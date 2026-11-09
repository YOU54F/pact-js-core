import * as fs from 'node:fs';
import * as path from 'node:path';
import axios from 'axios';
import { type ConsumerPact, makeConsumerPact } from '../src';
import { FfiSpecificationVersion } from '../src/ffi/types';

const HOST = '127.0.0.1';
const CONSUMER = 'or-matcher-consumer';
const PROVIDER = 'or-matcher-provider';
const OUTPUT_DIR = path.join(__dirname, '__testoutput__');
const PACT_FILE = path.join(OUTPUT_DIR, `${CONSUMER}-${PROVIDER}.json`);
const UUID = 'e2490de5-5bd3-43d5-b7c4-526e33f71304';
const UUID_REGEX =
  '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

// Integration JSON with `pact:matcher:combine`, where `pact:matcher:type`
// holds the list of matchers to combine. Requires a version of the Pact FFI
// that supports it (pact-foundation/pact-reference#601).
const anyOf = (value: unknown, ...matchers: Record<string, unknown>[]) => ({
  'pact:matcher:type': matchers,
  'pact:matcher:combine': 'OR',
  value,
});
const digitsOrUuid = anyOf(
  '42',
  { 'pact:matcher:type': 'regex', regex: '^\\d+$' },
  { 'pact:matcher:type': 'regex', regex: UUID_REGEX },
);
const stringOrNull = anyOf(
  'Fred',
  { 'pact:matcher:type': 'type' },
  { 'pact:matcher:type': 'null' },
);
const addressOrNull = anyOf(
  {
    street: 'Main St',
    number: { 'pact:matcher:type': 'integer', value: 42 },
  },
  { 'pact:matcher:type': 'type' },
  { 'pact:matcher:type': 'null' },
);

describe('FFI integration test for matchers combined with OR', () => {
  let pact: ConsumerPact;
  let port: number;

  type RequestOptions = {
    name?: unknown;
    address?: unknown;
    id?: string;
    requestId?: string;
  };

  const sendRequest = ({
    name = 'Fred',
    address = { street: 'Main St', number: 42 },
    id = '42',
    requestId = '42',
  }: RequestOptions = {}) =>
    axios.request({
      baseURL: `http://${HOST}:${port}`,
      method: 'POST',
      url: '/users',
      params: { id },
      headers: {
        'content-type': 'application/json',
        'x-request-id': requestId,
      },
      data: { name, address },
      validateStatus: () => true,
    });

  beforeAll(() => {
    if (fs.existsSync(PACT_FILE)) {
      fs.unlinkSync(PACT_FILE);
    }
  });

  beforeEach(() => {
    pact = makeConsumerPact(
      CONSUMER,
      PROVIDER,
      FfiSpecificationVersion.SPECIFICATION_VERSION_V4,
    );
    const interaction = pact.newInteraction('');
    interaction.uponReceiving(
      'a request to create a user with optional fields',
    );
    interaction.withRequest('POST', '/users');
    interaction.withQuery('id', 0, JSON.stringify(digitsOrUuid));
    interaction.withRequestHeader(
      'x-request-id',
      0,
      JSON.stringify(digitsOrUuid),
    );
    interaction.withRequestBody(
      JSON.stringify({ name: stringOrNull, address: addressOrNull }),
      'application/json',
    );
    interaction.withStatus(201);
    interaction.withResponseBody(
      JSON.stringify({ name: stringOrNull }),
      'application/json',
    );
    port = pact.createMockServer(HOST);
  });

  afterEach(() => {
    pact.cleanupMockServer(port);
  });

  const expectMatch = async (options: RequestOptions) => {
    const res = await sendRequest(options);
    expect(pact.mockServerMismatches(port)).toHaveLength(0);
    expect(res.status).toEqual(201);
    expect(pact.mockServerMatchedSuccessfully(port)).toBe(true);
    return res;
  };

  const expectMismatch = async (options: RequestOptions) => {
    const res = await sendRequest(options);
    expect(res.status).not.toEqual(201);
    expect(pact.mockServerMatchedSuccessfully(port)).toBe(false);
  };

  it('matches the example values, and writes the rules combined with OR', async () => {
    const res = await expectMatch({});
    expect(res.data).toEqual({ name: 'Fred' });

    pact.writePactFile(OUTPUT_DIR);
    const written = JSON.parse(fs.readFileSync(PACT_FILE, 'utf8'));
    const { request, response } = written.interactions[0];
    const orDigitsOrUuid = {
      combine: 'OR',
      matchers: [
        { match: 'regex', regex: '^\\d+$' },
        { match: 'regex', regex: UUID_REGEX },
      ],
    };
    const orTypeOrNull = {
      combine: 'OR',
      matchers: [{ match: 'type' }, { match: 'null' }],
    };

    expect(request.matchingRules.query.id).toEqual(orDigitsOrUuid);
    expect(request.matchingRules.header['x-request-id']).toEqual(
      orDigitsOrUuid,
    );
    expect(request.matchingRules.body['$.name']).toEqual(orTypeOrNull);
    expect(request.matchingRules.body['$.address']).toEqual(orTypeOrNull);
    expect(request.matchingRules.body['$.address.number']).toEqual({
      combine: 'AND',
      matchers: [{ match: 'integer' }],
    });
    expect(response.matchingRules.body['$.name']).toEqual(orTypeOrNull);
  });

  it('matches the other alternatives', () =>
    expectMatch({ name: null, address: null, id: UUID, requestId: UUID }));

  it('applies the matchers nested in the example of an optional object', () =>
    expectMatch({ address: { street: 'Other St', number: 7 } }));

  it('fails when a nested matcher does not match', () =>
    expectMismatch({ address: { street: 'Main St', number: '42' } }));

  it('fails when the body value matches none of the alternatives', () =>
    expectMismatch({ name: 123 }));

  it('fails when a header matches none of the alternatives', () =>
    expectMismatch({ requestId: 'abc' }));

  it('fails when a query parameter matches none of the alternatives', () =>
    expectMismatch({ id: 'abc' }));
});
