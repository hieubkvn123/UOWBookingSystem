from flask import Flask
from flask import request
from flask import session
from flask import redirect
from flask import render_template
from db_config import DB_CONFIG
from werkzeug.utils import secure_filename
from scipy.spatial.distance import cosine

import os
import cv2
import json
import hashlib
import numpy as np
import face_recognition
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
FACE_DIR = 'faces/'
print("[INFO] Connection to database established ... ")

# load known face encodings for staff recognition
# basically encodings here are the 128-element features vector of the face
# it is theoritically similar to principal component analysis of vector
# the difference is that face encoding is extracted using deep learning which
# is a stochastic process while PCA is plain mathemtics and the solutions are always absolute
# (Don't mind if I write them out, I'm just revising)
known_encodings = []
known_names = []

for (dir, dirs, files) in os.walk(FACE_DIR):
	for file in files:
		img = face_recognition.load_image_file(FACE_DIR + file)
		img = cv2.resize(img, (0,0), fx = 0.25, fy = 0.25) # basically resize the image for faster preprocessing
		encoding = face_recognition.face_encodings(img)[0]

		known_encodings.append(encoding)
		known_names.append(file.split('.')[0])


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
		# 4. A staff or an admin
		password_md5 = hashlib.md5(password.encode()).hexdigest() # hash password using md5 -> get the hexadecimal string -> decode it

		if(result[0] == name and result[2] == password_md5):
			session['user'] = name
			if(result[3] == 1):
				session['admin'] = True
			else:
				session['admin'] = False
			return redirect('/user')
		else:
			return render_template('error.html')

@app.route('/user')
def user():
	if(session['user'] != None):
		user = session['user']
		admin = False
		if(session['admin']):
			admin = True
		return render_template('staff.html', name=user, admin = admin)
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

		# only allowed to edit rooms that are approved
		# for normal staff
		sql = "SELECT * FROM room_details WHERE approved = 1"
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

@app.route("/view_status", methods = ['POST'])
def view_status():
	if(request.method == 'POST'):
		mydb = mysql.connector.connect(
			host = DB_CONFIG['host'],
			user = DB_CONFIG['user'],
			password = DB_CONFIG['password'],
			database = DB_CONFIG['database'],
			auth_plugin = 'mysql_native_password'
		)


		# only admin staffs have access to this feature
		# so we are not going to exclude anything
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
			# 8. occupied - boolean
			# 9. approved - boolean
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
			obj['approved'] = str(result[9])

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
		"occupied" : str(result[8]),
		"approved" : str(result[9])
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

	sql = "INSERT INTO room_details VALUES(DEFAULT, %s, %s, %s, %s, %s, %s, %s, %s, %s)"

	approved = 0

	# if the staff that adds this room is the admin
	# it will automatically approved
	if(session['admin']):
		approved = 1

	val = (avail_from, avail_to, abs_filename, rate, description, capacity, campus, 0, approved)

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
					if(results[0][3]):
						session['admin'] = True
					else:
						session['admin'] = False

					return 'auth_success-'+name
				else:
					return 'auth_failed'

	else:
		return "none"


# just an add-on function
# basically this function neutralizes the contrast and brightness of the image
# the method is to use histogram equalization on the image
# yep, you heard it, "equalization" means stretching out the frequent intensity
# value so that the histogram of intensity of the overall image becomes less steep
# less steep meaning less unusual bright or dark spots on the image
# I use it to because I have a lamp that flares light straight into mah pretty face
# this will help the computer a little bit in detecting my celebrity face
def lumination_correct(img):
	# basically lab means l*ab -> lightness and 2 color components
	# we are gonna apply histogram equalization on that "l"
	img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
	lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)

	l, a, b = cv2.split(lab)

	# apply adaptive histogram equalization
	clahe = cv2.createCLAHE(clipLimit = 3.0, tileGridSize = (8,8))
	l_clahe = clahe.apply(l)

	# merge it back
	lab_clahe = cv2.merge((l_clahe, a, b))

	# convert back to BGR
	final = cv2.cvtColor(lab_clahe, cv2.COLOR_LAB2BGR)

	return final

# sorry lecturer, idk what to do after I finish the project
# so I added this in
# dont mind me :3
@app.route("/face_login", methods = ['POST'])
def face_login():
	# so far face recognition has most popular methods (or at least to the best of my knowledge)
	# 1. Recognize the face using geometrical traits (distance between landmarks and area of triangular shapes on faces)
	# 2. using a infarred camera to project thousands of points on the face (Apple using it) - expensive -.-
	# 3. using deep learning to extract principal features (embeddings) represented as flat vectors
	#    then use a classification algorithm on those vectors, or simply use euclidean distance or cosine similarity
	#    to compare new faces with faces in the database
	#    the face_recognition module is a deep neural network that uses the third method, trained with over 3 millions images
	#    ---> a perfect module for this task :3
	#    (again, don't mind me writing them out)


	EUCLIDEAN_THRESHOLD = 0.35 # measure distance of vectors
	COSINE_THRESHOLD = 0.965 # measure similarity of vectors

	file = request.files['img']
	img = face_recognition.load_image_file(file) # RGB image
	img_bgr = lumination_correct(img) # now it is a BGR
	img = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

	# resize for faster processing
	small_img = cv2.resize(img, (0,0), fx = 0.25, fy = 0.25)
	locations = face_recognition.face_locations(small_img)
	encodings = face_recognition.face_encodings(small_img, locations)

	if(len(encodings) > 0):
		names = []
		for encoding in encodings:
			# compare the faces
			# tolerance is euclidean distance threshold
			# the closer the encoding to the known encoding
			# the higher the probability it is a match
			matches = face_recognition.compare_faces(known_encodings, encoding, tolerance = 0.35)

			# compute the distance of this encoding to known encodings
			face_distances = face_recognition.face_distance(known_encodings, encoding)

			# get the index of the closest known encoding to this encoding
			best_match_index = np.argmin(face_distances)

			# check if that closest encoding is actually a match
			if(matches[best_match_index]):
				# we are not done yet, have to check if this encoding
				# satisfies the cosine similarity condition
				# cosine_similarity = 1 - (u.v)/(||u||.||v||)
				#                   = 1 - cosine(u, v)
				similarity = 1 - cosine(known_encodings[best_match_index], encoding)
				if(similarity >= COSINE_THRESHOLD):
					# check the database who this dude is
					mydb = mysql.connector.connect( # resource efficiency, remember
						# actually the reason is that mysql concurrency is limited when
						# an object holds the connection
						# that's why I have to create and close connection continuously
						host = DB_CONFIG['host'],
						user = DB_CONFIG['user'],
						password = DB_CONFIG['password'],
						database = DB_CONFIG['database'],
						auth_plugin = 'mysql_native_password'
					)

					cursor = mydb.cursor()
					sql = "SELECT name, admin FROM staffs WHERE uow_id=" + known_names[best_match_index]
					cursor.execute(sql)
					result = cursor.fetchall()

					mydb.close()

					staff_name = result[0][0]
					session['user'] = staff_name

					if(result[0][1]):
						session['admin'] = True
					else:
						session['admin'] = False
					return 'success'
				else:
					return 'fail'
			else:
				return 'fail'

	else:
		return 'none'

@app.route("/approve_room", methods = ['POST'])
def approve_room():
	if request.method == 'POST' :
		room_id = request.form['room_id']

		mydb = mysql.connector.connect(
			host = DB_CONFIG['host'],
			user = DB_CONFIG['user'],
			password = DB_CONFIG['password'],
			database = DB_CONFIG['database'],
			auth_plugin = 'mysql_native_password'
		)

		cursor = mydb.cursor()

		sql = "UPDATE room_details SET approved = 1 WHERE room_id=" + str(room_id)
		cursor.execute(sql)

		mydb.commit()
		mydb.close()

		if(cursor.rowcount >= 1):
			return "success"
		else:
			return "failed"

if(__name__ == "__main__"):
	# debug mode
	app.run(debug = True, port = PORT)
