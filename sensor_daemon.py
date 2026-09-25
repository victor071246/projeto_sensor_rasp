import os
import threading
import time
from flask import Flask, jsonify
import psycopg2

DB = dict(
    host="127.0.0.1",
    dbname="sensores",
    user="sensor_user",
    password=os.environ["DB_PASSWORD"],
)

def conectar():
    while True:
        try:
            conn = psycopg2.connect(**DB)
            conn.autocommit = True
            return conn
        except psycopg2.OperationalError as e:
            print(f"falha ao conectar no banco: {e}")
            time.sleep(10)


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

def salvar(conn, temp, umid):
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO leituras (temperatura, umidade) VALUES (%s, %s)",
            (temp, umid)
        )

def loop_leitura():
    global ultima_leitura
    conn = conectar()
    while True:
        try:
            temp, umid = ler_sensor()
            ultima_leitura = {"temperatura": temp, "umidade": umid, "timestamp": time.time()}
            salvar(conn, temp, umid)
        except RuntimeError as e:
            print(f"erro na leitura: {e}")
        except (psycopg2.OperationalError, psycopg2.InterfaceError):
            print("conexão com o banco caiu, reconectando")
            conn = conectar()
        time.sleep(60)

@app.route("/reading")
def reading():
    return jsonify(ultima_leitura)

if __name__ == "__main__":
    thread = threading.Thread(target=loop_leitura, daemon=True)
    thread.start()
    app.run(host="0.0.0.0", port=5000)
