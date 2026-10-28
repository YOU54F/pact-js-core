import * as net from 'node:net';
import { type ConsumerPact, logToBuffer, makeConsumerPact } from '../src';
import { FfiSpecificationVersion } from '../src/ffi/types';

const HOST = '127.0.0.1';

// The FFI only takes its log configuration on first initialisation, and each
// spec file runs in its own process, so this sends the native core logs to an
// in-memory buffer, where each mock server's logs can be read back.
logToBuffer('info');

const regex = (pattern: string, value: string) =>
  JSON.stringify({
    'pact:matcher:type': 'regex',
    regex: pattern,
    value,
  });

// Writes the request by hand so that each entry in `lines` reaches the mock
// server as its own field line. Node's http client merges repeated headers.
const sendRawRequest = (port: number, header: string, lines: string[]) =>
  new Promise<number>((resolve, reject) => {
    const socket = net.connect(port, HOST);
    let response = '';
    socket.on('data', (chunk) => {
      response += chunk.toString();
    });
    socket.on('end', () => resolve(Number(response.split(' ')[1])));
    socket.on('error', reject);
    socket.write(
      [
        'GET /headers HTTP/1.1',
        `Host: ${HOST}:${port}`,
        'Connection: close',
        ...lines.map((line) => `${header}: ${line}`),
        '',
        '',
      ].join('\r\n'),
    );
  });

type Case = {
  description: string;
  header: string;
  // One entry per header index, passed as-is to withRequestHeader
  expected: string[];
  // Each entry is sent as its own field line
  sent: string[];
  matches: boolean;
  // Asserted against the mock server's FFI logs
  log?: (log: string) => void;
};

// Repeated request header cases from pact-reference#584
// (RFC 9110 §5.3: repeated field lines are equivalent to one comma-joined line)
const cases: Record<string, Case> = {
  H1: {
    description: 'a custom header sent as separate field lines',
    header: 'X-Request',
    expected: ['a', 'b'],
    sent: ['a', 'b'],
    matches: true,
  },
  H2: {
    description: 'a custom header sent as one comma-joined field line',
    header: 'X-Request',
    expected: ['a', 'b'],
    sent: ['a, b'],
    matches: true,
  },
  H3: {
    description: 'values containing commas sent as separate field lines',
    header: 'X-Sunset',
    expected: [
      'Sat, 01 Jan 2028 00:00:00 GMT',
      'Sun, 02 Jan 2028 00:00:00 GMT',
    ],
    sent: ['Sat, 01 Jan 2028 00:00:00 GMT', 'Sun, 02 Jan 2028 00:00:00 GMT'],
    matches: true,
  },
  H4: {
    description: 'two content types sent as one comma-joined field line',
    header: 'Content-Type',
    expected: ['text/plain', 'text/html'],
    sent: ['text/plain, text/html'],
    matches: false,
  },
  H5: {
    description: 'cache-control directives sent as one comma-joined field line',
    header: 'Cache-Control',
    expected: ['no-cache', 'no-store'],
    sent: ['no-cache, no-store'],
    matches: true,
  },
  H6a: {
    description: 'a regex matcher per index, sent as separate field lines',
    header: 'X-Request',
    expected: [
      regex('^first-\\d+$', 'first-1'),
      regex('^first-\\d+$', 'first-2'),
    ],
    sent: ['first-42', 'first-99'],
    matches: true,
    log: (log) => {
      expect(log).not.toMatch(/deprecat/i);
    },
  },
  H6b: {
    description:
      'a quoted value containing a comma, sent as separate field lines',
    header: 'X-Request',
    expected: ['"x , y"', 'z'],
    sent: ['"x, y"', 'z'],
    matches: true,
    log: (log) => {
      const warnings = log
        .split('\n')
        .filter(
          (line) => line.includes('WARN') && line.includes('RFC 9110 §5.3'),
        );
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain(
        'only matched when its field lines were compared one at a time',
      );
    },
  },
  H8a: {
    description: 'link values containing commas sent as separate field lines',
    header: 'Link',
    expected: [
      '<https://a.example/x,y>; rel="a"',
      '<https://b.example/>; rel="b"',
    ],
    sent: ['<https://a.example/x,y>; rel="a"', '<https://b.example/>; rel="b"'],
    matches: true,
  },
  H8b: {
    description: 'link values containing commas sent as one field line',
    header: 'Link',
    expected: [
      '<https://a.example/x,y>; rel="a"',
      '<https://b.example/>; rel="b"',
    ],
    sent: ['<https://a.example/x,y>; rel="a", <https://b.example/>; rel="b"'],
    matches: true,
  },
};

describe('FFI integration test for repeated request headers', () => {
  let pact: ConsumerPact;
  let port: number;

  afterEach(() => {
    pact.cleanupMockServer(port);
  });

  Object.entries(cases).forEach(([id, c]) => {
    describe(`${id}: ${c.description}`, () => {
      beforeEach(() => {
        pact = makeConsumerPact(
          'repeated-headers-consumer',
          'repeated-headers-provider',
          FfiSpecificationVersion.SPECIFICATION_VERSION_V3,
          'info',
        );
        const interaction = pact.newInteraction(id);
        interaction.uponReceiving(
          `a request with a repeated ${c.header} header`,
        );
        interaction.withRequest('GET', '/headers');
        c.expected.forEach((value, index) => {
          interaction.withRequestHeader(c.header, index, value);
        });
        interaction.withStatus(200);
        port = pact.createMockServer(HOST);
      });

      it(c.matches ? 'matches' : 'does not match', async () => {
        const status = await sendRawRequest(port, c.header, c.sent);
        const mismatches = pact.mockServerMismatches(port);

        if (c.matches) {
          expect(status).toEqual(200);
          expect(mismatches).toEqual([]);
        } else {
          expect(status).not.toEqual(200);
          expect(mismatches.length).toBeGreaterThan(0);
        }

        if (c.log) {
          c.log(pact.mockServerLogs(port) ?? '');
        }
      });
    });
  });
});
