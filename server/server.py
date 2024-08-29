from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
import logging
import sqlite3
from datetime import datetime, timedelta
import pandas as pd
import random
import sys

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)

@app.route("/")
def index():
  return render_template("./index.html")


@app.route('/final', methods=['POST'])
def final():
  data = request.get_json()
  weight = data.get('weight')
  stddev = data.get("stddev")
  box = data.get('box')
  date_time = datetime.now().strftime("%Y.%m.%d %H:%M:%S")

  with sqlite3.connect("./database/database.db") as db:
    cursor = db.cursor()
    cursor.execute(
      "INSERT INTO PIGS (DATE_TIME, BOX, WEIGHT, STDDEV) VALUES (?,?,?,?)",
      (date_time, box, weight, stddev)
    )
    db.commit()

  return jsonify({"message": "success"}), 200


@app.route('/deleteLast', methods=['POST'])
def delete_last():
  with sqlite3.connect("./database/database.db") as db:
    cursor = db.cursor()

    # Select the row with the highest id
    cursor.execute(
      """
      SELECT ID, WEIGHT, STDDEV FROM PIGS
      ORDER BY ID DESC
      LIMIT 1
      """
    )
    last_row = cursor.fetchone()
    last_id = last_row[0]
    last_weight = last_row[1]
    stddev = last_row[2]

    # Delete the row with the highest id
    cursor.execute(
      """
      DELETE FROM PIGS
      WHERE ID = ?
      """, (last_id,)
    )
    db.commit()

  return jsonify({"weight": last_weight, "stddev": stddev}), 200


@app.route('/overview')
def all():
  with sqlite3.connect("./database/database.db") as db:
    df = pd.read_sql_query("SELECT * FROM PIGS", db)
    data_by_box = {
      str(box): df[df['BOX'] == box].to_dict(orient='records') for box in df['BOX'].unique()
    }
  return jsonify(data_by_box), 200


@app.route('/box/<int:box_nr>/<int:days>')
def box(box_nr: int, days: int):

  if days == 0:
    days = 10**3

  with sqlite3.connect("./database/database.db") as db:

    current_date = datetime.now()

    earlier_date = current_date - timedelta(days=days)

    current_date_str = current_date.strftime("%Y.%m.%d %H:%M:%S")
    earlier_date_str = earlier_date.strftime("%Y.%m.%d %H:%M:%S")

    # Print the dates for debugging
    print(f"Current Date: {current_date_str}")
    print(f"Earlier Date: {earlier_date_str}")

    query = """
        SELECT * FROM PIGS
        WHERE BOX = ?
        AND DATE_TIME BETWEEN ? AND ?
        """

    df = pd.read_sql_query(query, db, params=(box_nr, earlier_date_str, current_date_str))

    if df.empty:
      print("No data found for the given date range.")

  return jsonify(df.to_dict(orient='records')), 200


@app.route('/export')
def export():

  with sqlite3.connect("./database/database.db") as db:

    query = """
        SELECT * FROM PIGS
        """

    df = pd.read_sql_query(query, db)

  return jsonify(df.to_dict(orient='records')), 200



@app.route('/write')
def write():

  for delta in range(60):
    for box in range(1, 4):
      weight = 100 - delta - random.randint(-2, +2)
      stddev = random.randint(100, 500) / 100
      date_time = datetime.now() - timedelta(days=delta)
      date_time = date_time.strftime("%Y.%m.%d %H:%M:%S")

      with sqlite3.connect("./database/database.db") as db:
        cursor = db.cursor()
        cursor.execute(
          "INSERT INTO PIGS (DATE_TIME, BOX, WEIGHT, STDDEV) VALUES (?,?,?,?)",
          (date_time, box, weight, stddev)
        )
        db.commit()
  return "success", 200


if __name__ == '__main__':

  with sqlite3.connect("./database.db") as db:

    db.execute('DROP TABLE IF EXISTS PIGS')
    db.execute('CREATE TABLE IF NOT EXISTS PIGS (ID INTEGER PRIMARY KEY AUTOINCREMENT, DATE_TIME TEXT NOT NULL, BOX INTEGER NOT NULL, WEIGHT REAL NOT NULL, STDDEV REAL NOT NULL)')
    write()

  app.run(port=8000, debug=True, use_reloader=False, host='10.215.39.1') #'0.0.0.0'
