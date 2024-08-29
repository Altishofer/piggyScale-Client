[![GitHub issues](https://img.shields.io/github/issues/Altishofer/piggyScale.svg)](https://github.com/Altishofer/piggyScale/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/Altishofer/piggyScale.svg)](https://github.com/Altishofer/piggyScale/pulls)
[![Paho-MQTT Version](https://img.shields.io/badge/paho--mqtt-2.1.0-purple)](https://pypi.org/project/paho-mqtt/)

# Piggy Scale: 
🎉 Real Time Scale and Weight Management 🎉

Text


## Table of Contents

- [Implementation](#implementation)
- [Main Components](#main-components)
- [Deployment](#deployment)
- [Testing](#testing)


### Features
- Real time visualization of scale signal
- Automatic weight estimation during weighting process
- Manually storing measured weights
- View weight history per box
- Export measurements to Excel

## Built With

- **[Dapr](https://dapr.io/):** Platform for interconnecting preexisting frameworks.
- **[Python](https://www.python.org/):** Main language used for implementation.
- **[Docker](https://www.docker.com/):** Containerization for simplified deployment.
- **[Mosquitto](https://mosquitto.org/):** MQTT Broker.
- **[Paho](https://pypi.org/project/paho-mqtt/):** MQTT Client.

## Main Components

- **[Server](https://github.com/ryaniosys/erp2mqtt-bridge/tree/main/erp-interface/app):** Initializes a REST server to receive messages from the Dapr sidecar.
- **[Client](https://github.com/ryaniosys/erp2mqtt-bridge/tree/main/erp-interface/scripts/maxon_testing.py):** Simulates an entity (e.g., ERP, machinery) and connects to the MQTT broker to report events.
- **[Pubsub](https://github.com/ryaniosys/erp2mqtt-bridge/tree/main/erp-interface/components):** Configuration file for Dapr to connect to the various Services.
- **[Subscriptions](https://github.com/ryaniosys/erp2mqtt-bridge/tree/main/erp-interface/components/subscriptions.yml):** Specifies the MQTT topics Dapr needs to listen to and forward to the server.
- **[RegressionTesting](https://github.com/ryaniosys/erp2mqtt-bridge/tree/main/erp-interface/tests/controllers):** Regression testing for continuous testing and improvement.


## Deployment

### Prerequisites

### Hardware Prerequisites
- 2x Raspberry Pi (Server & Client)
- 4 Weight Cells
- Analog to Digital Converter
- PSI Screen

### Software Prerequisites
- [Node.js](https://www.yarn.com)
- [NPM](https://www.yarn.com)
- [Yarn](https://www.yarn.com)
- [Python](https://www.yarn.com)
- [Flask](https://www.yarn.com)

### Hardware Instructions
- solder weight cells to A2D converter
- connect each A2D converter to a GPIO of the client RPI

### Client Setup

1. Clone this repository to your local machine:
  ```shell
  git clone https://github.com/Altishofer/piggyScale.git
  ```
2. Enter newly cloned directory
  ```shell
  cd piggyScale 
  ```
3. Install dependencies
 ```console
 yarn install
 ```
4. Deploy Client
 ```console
 ng serve
 ```

### REST - Server Setup
1. Clone this repository to your local machine:
  ```shell
  git clone https://github.com/Altishofer/piggyScale.git
  ```
2. Enter newly cloned directory
  ```shell
  cd piggyScale 
  ```
3. Create Virtual Environment
 ```console
 python3.11 -m venv .venv
 ```
3. Activate venv (Linux)
 ```console
 source .venv/bin/activate
 ```
3. Install dependencies
 ```console
 pip install -r requirements
 ```
4. Deploy Client
 ```console
 ng serve
 ```



### MQTT - Server Setup
1. Clone this repository to your local machine:
  ```shell
  git clone https://github.com/Altishofer/piggyScale.git
  ```






 ```console
 sudo python3 -m pip install --force-reinstall adafruit-blinka
 ```
4. Add script to autostart (optional)
 ```console
 sudo crontab -e
 ```
 ```console
 @reboot sleep 60 && sudo python3 <absolutePathToScript>
 ```
___
### Troubleshooting
#### Got a rare Rpi revision (e.g. 3B 1.2) which is not compatible with rpi_ws281x library
 ```console
 foo@bar:~ws2811_init failed with code -3 (Hardware revision is not supported)
 ```
 follow description [https://github.com/jgarff/rpi_ws281x/issues/483](https://github.com/jgarff/rpi_ws281x/issues/483)

#### no permission to execute file
```console
sudo chown -R pi RpiLedMatrix/
```
___
### Run matrix
```console
sudo python3 RpiLedMatrix/ledMatrix.py
```
___
## Impressions

<span>
 <img src="https://github.com/Altishofer/RpiLedMatrix/blob/main/readmeImages/AddPingPongBallsPlexiCover.jpg" height="200" alt="Add Ping Pong Balls and Plexiglass Cover"/>
 <img src="https://github.com/Altishofer/RpiLedMatrix/blob/main/readmeImages/CoverBackFireSafety.jpg" height="200" alt="Cover Back of Matrix Fire Proof"/> 
</span>





# PiggyScale

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.1.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
