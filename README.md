# DUT-E Relay Simulator

## System Requirements

* [NodeJS](https://nodejs.org/en/download/current/)

## Installation

1. Download the latest [package](https://github.com/phimimms/dute-sim/packages/1040308)
2. Extract the compressed download
3. Open a terminal to the extracted package directory
4. Run the TCP server via `node index.js`

## Usage

Prior to running the TCP server, the `.env` file can be edited to configure the behavior of the NCD Relay simulator.

* `PORT` - The port number of the TCP server
* `ERROR_CODE` - The DUT-E error code
* `FUEL_BURN_RATE` - The rate at which the fuel is depleted by fuel level in millimeters per minute
* `INITIAL_FUEL_LEVEL` - The initial fuel level in millimeters
* `LEVEL_TO_VOLUME_MULTIPLIER` - The multiplier to convert fuel level to volume
* `MAX_FUEL_LEVEL` - The maximum fuel level in millimeters
