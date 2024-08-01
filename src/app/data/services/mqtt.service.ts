// mqtt.service.ts
import { Injectable } from '@angular/core';
import mqtt, {IClientOptions, IClientSubscribeOptions, MqttClient} from "mqtt";
import {Buffer} from "buffer";

@Injectable({
  providedIn: 'root'
})

export class MqttService {
  public client!: MqttClient;

  constructor() {
    this.connectToMqttBroker();
  }

  private connectToMqttBroker() {
    const options: IClientOptions = {
      keepalive: 60,
      clientId: 'angular-client-' + Math.random().toString(16).substr(2, 8),
      protocolId: 'MQTT',
      protocolVersion: 5,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      will: {
        topic: 'WillMsg',
        payload: Buffer.from("hello"),
        qos: 0,
        retain: false
      },
      rejectUnauthorized: false
    };

    this.client = mqtt.connect('ws://10.215.39.1:9001', options);

    this.client.on('connect', () => {
      console.log('Connected to MQTT Broker');
    });

    this.client.on('error', (err: any) => {
      console.error('Connection error: ', err);
      this.client.end();
    });

    this.client.on('message', (topic: any, message: { toString: () => any; }) => {
      //console.log(`Received message: ${message.toString()} from topic: ${topic}`);
    });
  }

  public subscribe(topic: string, options?: IClientSubscribeOptions) {
    this.client.subscribe(topic, options, (err: any, granted: any) => {
      if (err) {
        console.error('Subscription error: ', err);
      } else {
        console.log('Subscription granted: ', granted);
      }
    });
  }

  public publish(topic: string, message: string) {
    this.client.publish(topic, message);
  }
}
