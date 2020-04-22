const express = require('express')
const http = require('http')
const path = require('path')
const formidable = require('formidable')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const db_config = require('./db_config')

const PORT = 8080
var DB_CONFIG = db_config.DB_CONFIG

var connection = mysql.createConnection(DB_CONFIG)

connection.connect(function(err){
	if(err){
		console.log("[ERROR] There is some problem connecting to database ... ")
		throw err 
	}else{
		console.log("[INFO] Connection to database established ... ")
	}
})

var app = express()
var server = http.Server(app)

app.use('/static', express.static(path.join(__dirname, 'static')))
app.use(bodyParser.urlencoded({extended : true}))


app.get('/', function(req, res){
	res.sendFile('index.html', {root: __dirname})
})

app.post('/book', function(req, res){
	var form = formidable.IncomingForm()
	form.parse(req, function(err, fields, files){
		var rooms = []

		var name = fields.name
		var check_in = fields.check_in
		var check_out = fields.check_out
		var num_people = fields.num_people
		var staff_student = fields.staff_student
		var campus = fields.campus

		// we need to find room with avail_from before check in
		var condition0 = " occupied <> 1" 
		var condition1 = " avail_from < '" + check_in + "'"
		var condition2 = " avail_to > '" + check_out + "'"
		var condition3 = " capacity >= " + num_people + ""
		var condition4 = " campus = '" + campus + "'"

		var sql = "SELECT * FROM room_details WHERE " + condition0 + " AND "
		sql += condition1 + " AND "
		sql += condition2 + " AND "
		sql += condition3 + " AND "
		sql += condition4 

		// console.log(sql)

		connection.query(sql, function(err, result){
			if(err) console.log(err)
			var objects = new Array(result.length)
			// console.log(sql)
			// console.log(result.length)

			for(var i = 0; i < result.length; i++){
				var obj = {}
				obj['room_id'] = result[i].room_id
				obj['avail_from'] = result[i].avail_from
				obj['avail_to'] = result[i].avail_to
				obj['img_path'] = result[i].img_path
				obj['rate'] = result[i].rate
				obj['description'] = result[i].description
				obj['capacity'] = result[i].capacity
				obj['campus'] = result[i].campus

				objects.push(obj)
			}

			res.send(JSON.stringify(objects))
		})
	})
})

app.post("/process_form", function(req, res){
	// res.send("Hello")
	var form = formidable.IncomingForm()
	form.parse(req, function(err, fields, files){
		// update the selected room status to occupied
		var id_list = fields.id_list.split('-')
		for(var i = 0; i < id_list.length - 1; i++){
			var sql = 'UPDATE room_details SET occupied=1 WHERE room_id=' + id_list[i] 
			connection.query(sql, function(err, results){
				if(err) console.log(err)
				else{
					console.log("[INFO] Inserted to table room_details, " + results.affectedRows + " rows affected ... ")
				}
			})

			// then log information to the bookings table
			var sql = "INSERT INTO bookings VALUES ?"

			var values = [
				[mysql.AUTO_INCREMENT,fields.name, fields.uow_id,fields.checkin, 
				fields.checkout,
				fields.num_people, fields.category, fields.campus, id_list[i]]
			]

			connection.query(sql, [values], function(err, results){
				if(err) console.log(err)
				else{
					console.log("[INFO] Inserted to table room_details, " + results.affectedRows + " rows affected ... ")
				}
			})
		}

		res.send("Your booking has reached us successfully :3")
	})
})

app.post('/check_booking', function(req, res){
	var form = formidable.IncomingForm()
	form.parse(req, function(err, fields, files){
		var uow_id = fields.uow_id

		sql = 'SELECT * FROM bookings WHERE uow_id=' + uow_id
		connection.query(sql, function(err, results){
			var objects = []
			// we need booking id, checkin, checkout and room id and campus
			for (var i = 0; i < results.length; i++){
				var obj = {}
				obj['booking_id'] = results[i].booking_id
				obj['checkin'] = results[i].checkin
				obj['checkout'] = results[i].checkout 
				obj['room_id'] = results[i].room_id
				obj['campus']  = results[i].campus
				objects.push(obj)
			}

			var obj_string = JSON.stringify(objects)
			res.send(obj_string)
		})
	})
})

app.post('/cancel_booking', function(req, res){
	var form = formidable.IncomingForm()
	form.parse(req, function(err, fields, files){
		var room_id = fields.room_id
		var booking_id = fields.booking_id

		// delete the row from bookings table
		var sql = "DELETE FROM bookings WHERE booking_id = " + booking_id
		connection.query(sql, function(err, results){
			if(err){
				console.log(err)
				res.send("Delete Booking failed ... ")
			}else{
				// change room status to unoccupied
				var sql = "UPDATE room_details SET occupied = 0 WHERE room_id = " + room_id
				connection.query(sql, function(err, results){
					if(err){
						console.log(err)
						res.send("Delete Booking failed ... ")
					}else{
						res.send("The Booking has been canceled successfully")
					}
				})
			}
		})
	})
})

console.log("[INFO] Starting Server ... ")
console.log("[INFO] Listening on port " + PORT + " ... ")
server.listen(PORT)