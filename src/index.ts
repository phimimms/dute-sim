import { Buffer } from 'buffer';
import dotenv from 'dotenv';
import net from 'net';

import { DuteDataType, getBytes } from './bytes';
import { computeChecksum } from './checksum';
import { RequestMessage } from './requests';

_subscribeToNodeProcess();

dotenv.config();

const server = net.createServer();

server.on('connection', _handleConnection);

const PORT = Number.isInteger(+process.env.PORT) ? +process.env.PORT : 2060;

const LEVEL_TO_VOLUME_MULTIPLIER = Number.isInteger(+process.env.LEVEL_TO_VOLUME_MULTIPLIER)
  ? +process.env.LEVEL_TO_VOLUME_MULTIPLIER : 5;

const FUEL_BURN_RATE = (Number.isInteger(+process.env.FUEL_BURN_RATE) ? +process.env.FUEL_BURN_RATE : 1) / 60;

const state: Record<string, number> = {
  errorCode: Number.isInteger(+process.env.ERROR_CODE) ? +process.env.ERROR_CODE : 0,
  level: Number.isInteger(+process.env.INITIAL_FUEL_LEVEL) ? +process.env.INITIAL_FUEL_LEVEL : 30,
  percent: null,
  volume: null,
};

const MAX_FUEL_LEVEL = Math.max(
  state.level,
  Number.isInteger(+process.env.MAX_FUEL_LEVEL) ? +process.env.MAX_FUEL_LEVEL : 30,
);

state.percent = 100 * state.level / MAX_FUEL_LEVEL;

state.volume = state.level * LEVEL_TO_VOLUME_MULTIPLIER;

const updateStateInterval = setInterval(_updateState, 1000);

server.listen(PORT, () => {
  console.log('Listening to %j', server.address());
});

function _handleConnection(connection: net.Socket) {
  const remoteAddress = `${connection.remoteAddress}:${connection.remotePort}`;

  console.log('New connection from %s', remoteAddress);

  connection.on('data', onConnectionData);
  connection.once('close', onConnectionClose);
  connection.on('error', onConnectionError);

  function onConnectionData(data: Buffer) {
    const request: number[] = Array.from(data);

    let response;

    if (request.every((element, index) => element === RequestMessage.ERROR_CODE[index])) {
      response = _generateErrorCodeResponse();
    } else if (request.every((element, index) => element === RequestMessage.METADATA[index])) {
      response = _generateMetadataResponse();
    } else {
      response = Buffer.from([ 0x3E, 0xFF, 0x00, 0x00, 0x15 ]);
    }

    connection.write(response);
  }

  function onConnectionClose() {
    console.log('Connection from %s closed', remoteAddress);
  }

  function onConnectionError(error) {
    console.log('Error occurred in connection from %s: %s', remoteAddress, error.message);
  }
}

function _generateErrorCodeResponse(): Buffer {
  const payload = [
    0x3E, 0xFF, 0x06,
    ...getBytes(state.errorCode, DuteDataType.S8),
    0x00, 0x00,
    0x00, 0x00,
  ];

  const checksum = computeChecksum(payload);

  return Buffer.from([ ...payload, checksum ]);
}

function _generateMetadataResponse(): Buffer {
  const payload = [
    0x3E, 0xFF, 0x23,
    0x00, 0x00,
    0x00, 0x00,
    0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00,
    0x00, 0x00,
    0x00, 0x00,
    0x00, 0x00,
    0x00, 0x00,
    ...getBytes(Math.round(state.volume / 0.1), DuteDataType.S16),
    0x00, 0x00,
    0x00, 0x00,
    ...getBytes(Math.round(state.level / 0.1), DuteDataType.S32),
    ...getBytes(Math.round(state.level / 0.1), DuteDataType.S32),
    ...getBytes(Math.round(state.level / 0.1), DuteDataType.S32),
    0x00, 0x00,
    0x00,
    ...getBytes(Math.round(state.percent / 0.4), DuteDataType.S8),
    0x00, 0x00,
  ];

  const checksum = computeChecksum(payload);

  return Buffer.from([ ...payload, checksum ]);
}

async function _onEndProcess() {
  await new Promise<void>((resolve) => {
    if (!server?.listening) {
      resolve();

      return;
    }

    server.close((error) => {
      if (error) {
        console.log('Error occurred upon closing server: %s', error.message);
      }

      resolve();
    });
  });

  clearInterval(updateStateInterval);

  process.exit();
}

function _subscribeToNodeProcess() {
  process.stdin.resume();

  process.on('SIGINT', _onEndProcess);
  process.on('SIGUSR1', _onEndProcess);
  process.on('uncaughtException', _onEndProcess);
}

function _updateState() {
  state.level = Math.max(state.level - FUEL_BURN_RATE, 0);

  state.percent = 100 * state.level / MAX_FUEL_LEVEL;

  state.volume = state.level * LEVEL_TO_VOLUME_MULTIPLIER;
}
