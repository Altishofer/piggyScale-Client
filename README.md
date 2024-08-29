![paho-mqtt](https://img.shields.io/badge/paho--mqtt-2.1.0-brightgreen)
![requests](https://img.shields.io/badge/requests-2.32.3-orange)
![flask](https://img.shields.io/badge/flask-3.0.3-red)
![db-sqlite3](https://img.shields.io/badge/db--sqlite3-0.0.1-yellow)
![pandas](https://img.shields.io/badge/pandas-2.2.2-blue)
![flask_cors](https://img.shields.io/badge/flask__cors-4.0.1-purple)

# Piggy Scale: 
🎉 Real-Time Scale and Weight Analytics 🎉

This repository contains all three components of the Piggy Scale system. The Scale component reads data from the load cells and publishes the measurements to the MQTT server. The MQTT server stores these real-time measurements and makes them available to all subscribed web clients. The web client subscribes to these real-time signals and loads previous weights from the database, allowing users to view, visualize, and analyze both current and historical measurements. The server handles requests from the client to read, write, and manipulate stored records.

## Table of Contents

- [Features](#features)
- [Built With](#built-with)
- [Main Components](#main-components)
- [Hardware](#hardware)
- [Deployment](#deployment)

## Features
- Real-time visualization of scale data
- Automatic weight estimation using real-time measurements
- Manual storage, retrieval, and manipulation of weight data
- View and analyze the history and trends of different pig batches
- Export measurement data to Excel

## Built With

- **[Mosquitto](https://mosquitto.org/):** An open-source message broker that implements the MQTT protocol.
- **[Paho](https://www.eclipse.org/paho/):** A python library for interacting with the mosquitto MQTT broker.
- **[Python](https://www.python.org/):** The current prototype of the serverside is written in the general purpose language.
- **[Flask](https://flask.palletsprojects.com/):** A lightweight web application framework for Python.
- **[Angular](https://angular.io/):** A platform for building web applications using TypeScript.
- **[TypeScript](https://www.typescriptlang.org/):** The Client is written in TypeScript, a more statically typed version of JavaScrippt.
- **[SQLite3](https://sqlite.org/index.html):** A python library for manipulating lightweight open source database files.

## Main Components

- **[REST Server](https://github.com/Altishofer/piggyScale/tree/main/server):** Manages a RESTful API for interacting with the database, which stores permanent records.
- **[Scale](https://github.com/Altishofer/piggyScale/tree/main/scale):** Captures data from the hardware and publishes real-time measurements to the MQTT server.
- **[Client](https://github.com/Altishofer/piggyScale/tree/main/src):** An Angular-based web platform that subscribes to real-time updates from the scale and retrieves data from the server's database.
- **[MQTT Server](https://github.com/Altishofer/piggyScale/tree/main/server):** Buffers real-time measurements from the Scale and forwards them to subscribed clients.



## Hardware

### Prerequisites
- 4 **[Weight Cells](https://de.aliexpress.com/item/32993892413.html?srcSns=sns_WhatsApp&spreadType=socialShare&bizType=ProductDetail&social_params=60729542385&aff_fcid=967cfb0bb3c44d5994dca7a8b6821253-1721983637820-00146-_EIhxwWR&tt=MG&aff_fsk=_EIhxwWR&aff_platform=default&sk=_EIhxwWR&aff_trace_key=967cfb0bb3c44d5994dca7a8b6821253-1721983637820-00146-_EIhxwWR&shareId=60729542385&businessType=ProductDetail&platform=AE&terminal_id=15f1fe9867124f1a9b3cca645aa764d7&afSmartRedirect=y)**
- 1x **[IPS Touch Screen](https://de.aliexpress.com/item/1005006420023450.html?spm=a2g0o.order_list.order_list_main.11.3b3f5c5fLSSfJb&gatewayAdapt=glo2deu)**
- 4x **[Weight Cell Sensor (HX711)](https://de.aliexpress.com/item/1005006293368575.html?spm=a2g0o.order_list.order_list_main.23.3b3f5c5fLSSfJb&gatewayAdapt=glo2deu)**
- 2x **[Raspberry Pi 4B](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/)**

### Instructions
- Solder each weight cell to a HX711
- Connect each HX711 to an individual GPIO

## Deployment

### Deployment - REST-Server & Scale

#### Software Prerequisites
- [Python3.11.9](https://www.python.org/downloads/release/python-3119/)

#### Setup

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
4. Deploy REST-Server
 ```console
 python ./server/server.py
 ```

### Deployment - Client

#### Software Prerequisites
- [Node.js](https://www.yarn.com)
- [NPM](https://www.yarn.com)
- [Yarn](https://www.yarn.com)

#### Setup

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

### MQTT - Server Setup (Linux)
1. Update and ugrade all packages:
  ```shell
  sudo apt update && sudo apt upgrade
  ```
2. Install mosquitto broker:
  ```shell
  sudo apt install -y mosquitto mosquitto-clients
  ```
3. Open mosquitto configuration:
  ```shell
  sudo nano /etc/mosquitto/mosquitto.conf
  ```
4. Replace mosquitto configuration:
  ```shell
  # replace, save and close file
  pid_file /run/mosquitto/mosquitto.pid
  
  persistence true
  persistence_location /var/lib/mosquitto/
  
  log_dest file /var/log/mosquitto/mosquitto.log
  include_dir /etc/mosquitto/conf.d
  
  listener 1883 0.0.0.0
  allow_anonymous true
  protocol mqtt
  
  listener 9001 0.0.0.0
  allow_anonymous true
  protocol websockets
  
  connection_messages true
  log_timestamp true
  ```
5. Run MQTT-Broker in the background:
  ```shell
  mosquitto -v -d
  ```
6. Open NEW shell and test subscription:
  ```shell
  mosquitto _sub -h localhost -t /test/topic
  ```
7. Open NEW shell and test publishing:
  ```shell
  # Switch to subscription shell and check if output is visible
  mosquitto _pub -h localhost -t /test/topic -m "Hello World!"
  ```
### Autostart
Add script to autostart (optional)
 ```console
 sudo crontab -e
 ```
 ```console
 @reboot sleep 60 && source <absolutePathToRepository>/.venv/bin/activate && python <absolutePathToScript>/server/server.py
 @reboot sleep 60 && source <absolutePathToRepository>/.venv/bin/activate && python <absolutePathToScript>/scale/measurements.py
 @reboot sleep 60 && ng serve <absolutePathToScript>
 ```
