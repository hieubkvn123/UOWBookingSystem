# a simple module used to register staff face for face recognition

import cv2

from imutils.video import WebcamVideoStream

vs = WebcamVideoStream(src = 0).start()

print("[SYS] Enter your UOW ID : ", end = "")
name = input()

UPLOAD_DIR = 'faces/'
DRAW_TEXT = False

while(True):
	frame = vs.read()

	if(DRAW_TEXT):
		cv2.putText(frame, "Face has been registered", (20,20), cv2.FONT_HERSHEY_DUPLEX, 0.6, (0,255,0), 2)

	key = cv2.waitKey(1)
	if(key == ord("q")):
		break
	if(key == ord("s")):
		cv2.imwrite(UPLOAD_DIR + name + ".jpg", frame)
		DRAW_TEXT = True

	cv2.imshow("Frame", frame)

vs.stop()
cv2.destroyAllWindows()