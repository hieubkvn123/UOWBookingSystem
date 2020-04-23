from flask import Flask 
from flask import request
from flask import session
from flask import redirect
from flask import render_template
from db_config import DB_CONFIG


import cv2
import json
import hashlib
import numpy as np 
import pyzbar
import mysql.connector

app = Flask(__name__)
app.secret_key = "HieuDepTry"

PORT = 8081

print("[INFO] Connection to database established ... ")

@app.route("/")
def home():
	return render_template('staff_login.html')

@app.route("/login", methods = ['POST', 'GET'])
def login():
	mydb = mysql.connector.connect(
		host = DB_CONFIG['host'],
		user = DB_CONFIG['user'],
		password = DB_CONFIG['password'],
		database = DB_CONFIG['database']
	)
	name = request.form['name']
	uow_id = request.form['uow_id']
	password = request.form['password']

	# check the database wheter there is such an ID
	cursor = mydb.cursor()
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
	mydb.close()

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
		mydb = mysql.connector.connect(
			host = DB_CONFIG['host'],
			user = DB_CONFIG['user'],
			password = DB_CONFIG['password'],
			database = DB_CONFIG['database']
		)
		sql = "SELECT * FROM room_details"
		cursor = mydb.cursor()

		cursor.execute(sql)

		results = cursor.fetchall()

		# store rooms in an array
		objects = []
		for result in results:
			obj = {}

			# 0. room_id
			# 1. avail_from - date
			# 2. avail_to   - date
			# 3. img_path   - str
			# 4. rate - numeric
			# 5. description - str
			# 6. capacity - numeric
			# 7. campus - str
			# 8. occupied
			obj['room_id'] = result[0]

			# since date is not json serializable
			# we need to preprocess these data
			obj['avail_from'] = str(result[1].year) + '-' + str(result[1].month) + '-' + str(result[1].day)
			obj['avail_to'] = str(result[2].year) + '-' + str(result[2].month) + '-' + str(result[2].day)
			obj['img_path'] = result[3]
			obj['rate'] = str(result[4])
			obj['description'] = result[5]
			obj['capacity'] = str(result[6])
			obj['campus'] = result[7]
			obj['occupied'] = str(result[8])

			print(obj['occupied'])
			objects.append(obj)

		obj_str = json.dumps(objects)
		return obj_str

	else: # invalid method
		return redirect("/")
		
	mydb.close()

if(__name__ == "__main__"):
	app.run(debug = True, port = PORT)