CREATE DATABASE IF NOT EXISTS UOW_BOOKING_SYS;
DROP TABLE IF EXISTS bookings;

DROP TABLE IF EXISTS room_details;

USE UOW_BOOKING_SYS;

CREATE TABLE IF NOT EXISTS room_details(
	room_id INT  NOT NULL AUTO_INCREMENT,
	avail_from DATE NOT NULL,
	avail_to DATE NOT NULL,
	img_path VARCHAR(200) NOT NULL,
	rate NUMERIC NOT NULL,
	description VARCHAR(200) NOT NULL,
	capacity INT(10) NOT NULL,
	campus VARCHAR(100) NOT NULL,
	occupied BOOLEAN NOT NULL,
	PRIMARY KEY (room_id)
);

# Some demo data
INSERT INTO room_details VALUES (
	DEFAULT,'2020-04-01', '2020-04-20', '/static/img/rooms/img1.jpg', 19.80, 'Beautiful',3,'Singapore Institute of Management', 0
);

INSERT INTO room_details VALUES (
	DEFAULT,'2020-04-06', '2020-04-25', '/static/img/rooms/img2.jpg', 12.80, 'Beautiful',2,'UOW Wollongong Campus', 0
);

INSERT INTO room_details VALUES (
	DEFAULT,'2020-04-20', '2020-05-15', '/static/img/rooms/img3.jpg', 19.80, 'Beautiful',1,'Singapore Institute of Management', 0
);

INSERT INTO room_details VALUES (
	DEFAULT,'2020-03-28', '2020-04-25', '/static/img/rooms/img4.jpg', 17.80, 'Beautiful',2,'UOW Wollongong Campus', 0
);

# Create a booking table to record bookings
CREATE TABLE IF NOT EXISTS bookings (
	booking_id INT NOT NULL AUTO_INCREMENT,
	name VARCHAR(200) NOT NULL,
	uow_id VARCHAR(8) NOT NULL,
	checkin DATE NOT NULL,
	checkout DATE NOT NULL,
	num_people INT(10) NOT NULL,
	category VARCHAR(20) NOT NULL,
	campus VARCHAR(100) NOT NULL,
	room_id INT NOT NULL,
	PRIMARY KEY (booking_id),
	FOREIGN KEY (room_id) REFERENCES room_details(room_id) 
	ON DELETE CASCADE
)