import time
import paho.mqtt.client as mqtt
import logging
import random
from datetime import datetime
import math

logging.basicConfig(level=logging.DEBUG)


class MqttClientSingleton:
    _instance = None
    _is_connected = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = mqtt.Client(clean_session=True, userdata=None, callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
            cls._instance.on_connect = cls.on_connect
            # cls._instance.on_disconnect = cls.on_disconnect
            cls._instance.on_message = cls.on_message

            cls._instance.enable_logger(logging.getLogger())

            try:
                cls._instance.connect("10.215.39.1", 1883, 60)
            except Exception as e:
                logging.error(f"Failed to connect to MQTT broker: {e}")

            cls._instance.loop_start()
            cls.check_connection()

            try:
                weight = random.randint(80, 85)
                while True:
                    time.sleep(0.5)

                    seconds = datetime.now().strftime("%S")
                    weight = 40 * math.sin(float(seconds)/6.4) + 60 + random.randint(-5, +5)

                    cls._instance.publish("measurements/realtime", round(weight, 2))


            except KeyboardInterrupt:
                cls._instance.loop_stop()
        return cls._instance

    @staticmethod
    def on_message(cls, client, message):
        received_message = str(message.payload.decode("utf-8"))
        logging.info(f"Received message: {received_message}")

    @staticmethod
    def on_connect(
            instance,
            userdata,
            connect_flags,
            reason,
            properties,
        ):
        if not reason.is_failure:
            instance._is_connected = True
            instance.subscribe("measurements/realtime")
        else:
            logging.error(f"Connection failed")

    @staticmethod
    def on_disconnect(cls, flags, properties, userdata):
        if not flags:
            logging.warning("Unexpected disconnection, attempting to reconnect...")
            MqttClientSingleton._is_connected = False
            try:
                cls.reconnect()
                logging.info("Reconnected to MQTT broker")
            except Exception as e:
                logging.error(f"Failed to reconnect: {e}")
        else:
            logging.info("Disconnected from MQTT broker")

    @classmethod
    def check_connection(cls):
        for _ in range(20):
            if cls._instance.is_connected:
                break
            time.sleep(1)
            logging.warning("Failed to verify connection.")
        else:
            raise Exception("MQTT client not connected.")

        # cls._instance.publish("controller/status", '{"status":"Test_QoS_1"}', qos=1, retain=False)


if __name__ == "__main__":
    mqtt_client = MqttClientSingleton()
