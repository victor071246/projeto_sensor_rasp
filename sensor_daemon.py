import os
import threading
import time
from flask import Flask, jsonify

app = Flask(__name__)
ultima_leitura = {"temperatura": None, "umidade": None, "timestamp": None}

MOCK = os.getenv("MOCK_SENSOR") == "1"

if not MOCK:
    import adafruit_dht
    import board
    dht = adafruit_dht.DHT22(board.D4)

def ler_sensor():
    if MOCK:
        return 25.0, 60.0

    for _ in range(5):
        try:
            t, u = dht.temperature, dht.humidity
            if t is not None and u is not None:
                return t, u
        except RuntimeError:
            pass
            time.sleep(2)
        raise RuntimeError("erro ao ler o sensor")

def loop_leitura():
    global ultima_leitura
    while True:
        try:
            temp, umid = ler_sensor()
            ultima_leitura = {"temperatura": temp, "umidade": umid, "timestamp": time.time()}
        except RuntimeError as e:
            print(f"erro na leitura: {e}")
        time.sleep(60)

@app.route("/reading")
def reading():
    return jsonify(ultima_leitura)

if __name__ == "__main__":
    thread = threading.Thread(target=loop_leitura, daemon=True)
    thread.start()
    app.run(host="0.0.0.0", port=5000)
