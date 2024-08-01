import { Component } from '@angular/core';
import {MqttService} from "../data/services/mqtt.service";

@Component({
  selector: 'app-scale',
  standalone: true,
  imports: [],
  templateUrl: './scale.component.html',
  styleUrl: './scale.component.css'
})
export class ScaleComponent {

  messages: string[] = [];
  title: string = "PiggyScale";

  constructor(private mqttService: MqttService) {
    this.mqttService.client.on('message', (topic: any, message: { toString: () => string; }) => {
      this.messages.push(message.toString());
    });
  }

  ngOnInit() {
    this.mqttService.subscribe('test/topic');
  }

}
