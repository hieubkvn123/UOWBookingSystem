from flask import Flask 
from flask import request
from flask import session
from flask import redirect
from flask import render_template
from db_config import DB_CONFIG


import cv2
import hashlib
import numpy as np 
import pyzbar
import mysql.connector

app = Flask(__name__)
app.secret_key = "HieuDepTry"

PORT = 8081
mydb = mysql.connector.connect(
	host = DB_CONFIG['host'],
	user = DB_CONFIG['user'],
	password = DB_CONFIG['password'],
	database = DB_CONFIG['database']
)

cursor = mydb.cursor()

print("[INFO] Connection to database established ... ")

@app.route("/")
def home():
	return render_template('staff_login.html')

@app.route("/login", methods = ['POST', 'GET'])
def login():
	name = request.form['name']
	uow_id = request.form['uow_id']
	password = request.form['password']

	# check the database wheter there is such an ID
	sql = "SELECT * FROM staffs WHERE uow_id=" + uow_id
	cursor.execute(sql)
	results = cursor.fetchall()

	if(len(results) > 0): # Meaning the uow_id exists in the database
		# now check for credentials details
		result = results[0] # since uow_id is unique, only one result per query

		# 1. Name of staff
		# 2. UOW ID
		# 3. Password
		password_md5 = hashlib.md5(password.encode()).hexdigest() # hash password using md5 -> get the hexadecimal string -> decode it

		if(result[0] == name and result[2] == password_md5):
			session['user'] = name
			return redirect('/user')
		else:
			return "<h1>Login failed</h1>"

@app.route('/user')
def user():
	if(session['user'] != None):
		user = session['user']
		return render_template('staff.html', name=user)
	else:
		return redirect("/")


@app.route("/logout")
def logout():
	session['user'] = None
	return redirect("/")

@app.route("/view_room", methods = ['POST', 'GET'])
def view_room():
	if(request.method == 'POST'):
		sql = "SELECT * FROM room_details"
		cursor.execute(sql)

		results = cursor.fetchall()

		# store rooms in an array
		objects = []
	else: # invalid method
		return redirect("/")

if(__name__ == "__main__"):
	app.run(debug = True, port = PORT)