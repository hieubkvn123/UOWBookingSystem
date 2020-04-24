from flask import Flask 
from flask import request
from flask import session
from flask import redirect
from flask import render_template
from db_config import DB_CONFIG
from werkzeug.utils import secure_filename

import os
import cv2
import json
import hashlib
import numpy as np 
import time

# need to install the zbar shared library first
# by sudo apt-get install libzbar0 (linux)
# or brew install libzbar0 (macos)
# if ur windows users ur screwed cuz Idk how to help ya
from pyzbar import pyzbar
import mysql.connector

from PIL import Image

app = Flask(__name__)
app.secret_key = "HieuDepTry"
app.config['UPLOAD_FOLDER'] = 'static/img/rooms'

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
		database = DB_CONFIG['database'],
		auth_plugin = 'mysql_native_password'
	)
	name = request.form['name']
	uow_id = request.form['uow_id']
	password = request.form['password']

	# check the database wheter there is such an ID
	cursor = mydb.cursor()
	sql = "SELECT * FROM staffs WHERE uow_id=" + uow_id
	cursor.execute(sql)
	results = cursor.fetchall()
	mydb.close()
	print("[INFO] Connection to database closed ... ")

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
			return render_template('error.html')

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
			database = DB_CONFIG['database'],
			auth_plugin = 'mysql_native_password'
		)
		sql = "SELECT * FROM room_details"
		cursor = mydb.cursor()

		cursor.execute(sql)

		results = cursor.fetchall()
		mydb.close()
		print("[INFO] Connection to database closed ... ")

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

			objects.append(obj)

		obj_str = json.dumps(objects)
		return obj_str

	else: # invalid method
		return redirect("/")

@app.route("/view_room_by_id", methods = ['POST'])
def view_room_by_id():
	room_id = request.form['room_id']
	sql = "SELECT * FROM room_details WHERE room_id=" + room_id

	# create a new connection then close it -> resource efficiency
	mydb = mysql.connector.connect(
		host = DB_CONFIG['host'],
		user = DB_CONFIG['user'],
		password = DB_CONFIG['password'],
		database = DB_CONFIG['database'],
		auth_plugin = 'mysql_native_password'
	)

	cursor = mydb.cursor()

	cursor.execute(sql)

	result = cursor.fetchall()[0]
	obj = {
		"avail_from" : str(result[1].year) + '-' + str(result[1].month) + '-' + str(result[1].day),
		"avail_to" : str(result[2].year) + '-' + str(result[2].month) + '-' + str(result[2].day),
		"rate" : str(result[4]),
		"description" : result[5],
		"capacity" : str(result[6]),
		"campus" : result[7],
		"occupied" : str(result[8])
	}

	obj_str = json.dumps(obj)
	mydb.close()
	print("[INFO] Connection to database closed ... ")

	return obj_str

@app.route("/edit_room", methods = ['POST'])
def edit_room():
	room_id = request.form['room_id']
	avail_from = request.form['avail_from']
	avail_to  = request.form['avail_to']
	rate = request.form['rate']
	capacity = request.form['capacity']
	description = request.form['description']
	campus = request.form['campus']
	occupied = request.form['occupied']

	if(occupied == 'Yes'):
		occupied = 1
	else:
		occupied = 0

	sql = "UPDATE room_details SET "
	sql += "avail_from = '" + avail_from + "'"
	sql += ",avail_to = '" + avail_to + "'"
	sql += ",rate = " + str(rate)
	sql += ",capacity = " + str(capacity) 
	sql += ",description = '" + description + "'"
	sql += ",campus = '" + campus + "'"
	sql += ",occupied = " + str(occupied) 
	sql += " WHERE room_id=" + str(room_id)

	mydb = mysql.connector.connect(
		host = DB_CONFIG['host'],
		user = DB_CONFIG['user'],
		password = DB_CONFIG['password'],
		database = DB_CONFIG['database'],
		auth_plugin = 'mysql_native_password'
	)

	cursor = mydb.cursor()
	cursor.execute(sql)
	mydb.commit()

	mydb.close()
	print("[INFO] Connection to database closed ... ")

	if(cursor.rowcount > 0):
		return "success"
	else:
		return "fail"

@app.route("/delete_room", methods = ['POST'])
def delete_room():
	room_id = request.form['room_id']

	sql = "DELETE FROM room_details WHERE room_id=" + str(room_id)

	# create a connection and close it
	mydb = mysql.connector.connect(
		host = DB_CONFIG['host'],
		user = DB_CONFIG['user'],
		password = DB_CONFIG['password'],
		database = DB_CONFIG['database'],
		auth_plugin = 'mysql_native_password'
	)

	cursor = mydb.cursor()
	cursor.execute(sql)
	mydb.commit()

	mydb.close()
	print("[INFO] Connection to database closed ... ")

	if(cursor.rowcount > 0):
		return "success"
	else:
		return "fail"

@app.route("/add_room", methods = ['POST'])
def add_room():
	avail_from = request.form['avail_from']
	avail_to = request.form['avail_to']
	rate = request.form['rate']
	capacity = request.form['capacity']
	campus = request.form['campus']
	occupied = request.form['occupied'] # actually it will be non-occupied by default
	description = request.form['description']
	image = request.files['image']

	filename = secure_filename(image.filename)
	abs_filename = '/static/img/rooms/' + filename 

	sql = "INSERT INTO room_details VALUES(DEFAULT, %s, %s, %s, %s, %s, %s, %s, %s)"
	val = (avail_from, avail_to, abs_filename, rate, description, capacity, campus, 0)

	mydb = mysql.connector.connect(
		host = DB_CONFIG['host'],
		user = DB_CONFIG['user'],
		password = DB_CONFIG['password'],
		database = DB_CONFIG['database'],
		auth_plugin = 'mysql_native_password'
	)

	cursor = mydb.cursor()
	cursor.execute(sql, val)
	mydb.commit()
	mydb.close()

	if(cursor.rowcount > 0):
		image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
		return "success"
	else:
		return "fail"

@app.route("/add_promo", methods = ['POST'])
def add_promo():
	promo_code = request.form['promo_code']
	applicable_for = request.form['applicable_for']
	value = request.form['value']

	mydb = mysql.connector.connect(
		host = DB_CONFIG['host'],
		user = DB_CONFIG['user'],
		password = DB_CONFIG['password'],
		database = DB_CONFIG['database'],
		auth_plugin = 'mysql_native_password'
	)

	cursor = mydb.cursor()

	# first, check if the same code is in the database
	sql = "SELECT * FROM promo_code WHERE code='" + promo_code + "'"
	cursor.execute(sql)
	results = cursor.fetchall()
	if(len(results) > 0):
		return 'dupplicate'
	else:
		sql = "INSERT INTO promo_code VALUES (%s,%s,%s)"
		val = (promo_code, value, applicable_for)

		cursor.execute(sql, val)
		mydb.commit()
		mydb.close()

		if(cursor.rowcount > 0):
			return 'success'
		else:
			return 'fail'

@app.route("/qr_login", methods = ['POST'])
def qr_login():
	file = request.files['img']

	# the default image in Pillow is RGB
	img = Image.open(file).convert("RGB")

	# convert to numpy array
	img = np.array(img)

	# convert RGB to BGR (which opencv uses)
	img = img[:,:,::-1].copy()

	# now just use pyzbar to decode the qr code
	qr_codes = pyzbar.decode(img)

	# assuming there is only one qr code inside
	if(len(qr_codes) > 0):
		qr_code = qr_codes[0]

		# since the data is a byte string
		# we have to decode it back to normal utf-8 string
		qr_code_data = qr_code.data.decode('utf-8')

		# now just anaylize the code and decide
		# whether to grant access to this dude
		# the qr code will have the format :
		# <name>;<password>;<uow_id>
		qr_data = qr_code_data.split(";")

		# if we don't have all three data
		# then this qr code is not valid
		if(len(qr_data) < 3):
			return "invalid"
		else:
			name = qr_data[0]
			password = qr_data[1]
			uow_id = qr_data[2]

			print(name)
			print(uow_id)

			# again, resource efficiency
			mydb = mysql.connector.connect(
				host = DB_CONFIG['host'],
				user = DB_CONFIG['user'],
				password = DB_CONFIG['password'],
				database = DB_CONFIG['database'],
				auth_plugin = 'mysql_native_password'
			)

			cursor = mydb.cursor()

			sql = "SELECT * FROM staffs WHERE uow_id=" + str(uow_id)
			cursor.execute(sql)

			results = cursor.fetchall()
			print(results)
			mydb.close()

			if(len(results) < 1):
				return 'auth_failed'
			else:
				# check if name and password is corrects
				md5_password = hashlib.md5(password.encode()).hexdigest()
				true_password = results[0][2]
				true_name = results[0][0]

				if(name == true_name and md5_password == true_password):
					session['user'] = name
					return 'auth_success-'+name 
				else:
					return 'auth_failed'
		
	else:
		return "none"

if(__name__ == "__main__"):
	app.run(debug = True, port = PORT)