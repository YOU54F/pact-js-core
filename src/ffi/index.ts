import path from 'node:path';
import logger, { DEFAULT_LOG_LEVEL } from '../logger';
import { LogLevel } from '../logger/types';
import { Ffi } from './types';

export const PACT_FFI_VERSION = '0.4.0';

// supported prebuilds
// darwin-arm64
// darwin-x64
// linux-arm64
// linux-x64
// win32-x64

const supportedPlatforms = [
  'darwin-arm64',
  'darwin-x64',
  'linux-arm64',
  'linux-x64',
  'win32-x64',
];
const platform = `${process.platform}-${process.arch}`;
const supportedPlatformsMessage = `Supported platforms are: \n\n - ${supportedPlatforms.join(
  '\n - '
)}\n`;
const detectedMessage = `We detected your platform as: \n\n - ${platform}\n`;

if (!supportedPlatforms.includes(platform)) {
  console.log(supportedPlatformsMessage);
  console.log(detectedMessage);
  console.error(`Unsupported platform: ${platform}`);
  process.exit(1);
}

const loadPath =
  process.env['PACT_NAPI_NODE_LOCATION'] ||
  path.join(__dirname, '..', '..', 'prebuilds', platform, 'node.napi.node');
const loadPathMessage = `: loading native module from: \n\n - ${path.resolve(
  loadPath
)} ${
  process.env['PACT_NAPI_NODE_LOCATION']
    ? '\n - source: PACT_NAPI_NODE_LOCATION\n'
    : '\n   source: prebuilds \n\n - You can override via PACT_NAPI_NODE_LOCATION\n'
}`;
let ffiLib: Ffi;
const importedLib = import(loadPath);
importedLib
  .then((lib) => {
    ffiLib = lib.default;
    console.log(`Success ${loadPathMessage}`);
  })
  .catch((error) => {
    console.log(supportedPlatformsMessage);
    console.log(detectedMessage);
    console.log(`Failed ${loadPathMessage}`);
    console.error(`Failed to load native module: ${error}`);
    process.exit(1);
  });

let ffi: typeof ffiLib;
let ffiLogLevel: LogLevel;

const initialiseFfi = (logLevel: LogLevel): typeof ffi => {
  logger.debug(`Initalising native core at log level '${logLevel}'`);
  ffiLogLevel = logLevel;
  ffiLib.pactffiInitWithLogLevel(logLevel);

  return ffiLib;
};

export const getFfiLib = (
  logLevel: LogLevel = DEFAULT_LOG_LEVEL
): typeof ffi => {
  if (!ffi) {
    logger.trace('Initiliasing ffi for the first time');
    ffi = initialiseFfi(logLevel);
  } else {
    logger.trace('Ffi has already been initialised, no need to repeat it');
    if (logLevel !== ffiLogLevel) {
      logger.warn(
        `The pact native core has already been initialised at log level '${ffiLogLevel}'`
      );
      logger.warn(`The new requested log level '${logLevel}' will be ignored`);
    }
  }
  return ffi;
};
