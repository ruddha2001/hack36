#include <ESP8266HTTPClient.h>
#include <SoftwareSerial.h>
#include <creds.h> //To store mesh credentials
HTTPClient http; //Object for API Call
SoftwareSerial mySerial(4, 5); // RX, TX Software Serial Config

void setup() {
  Serial.begin(115200);
  mySerial.begin(115200);
//  Serial.print("\nConnecting to SoftSerial.");
//  while (!mySerial) {
//    Serial.print(".");  //Waiting for SoftSerial to connect
//  }
//  Serial.println();
}

void loop() {
  if (mySerial.available())
  {
    String str = mySerial.readStringUntil('\n');
    Serial.println(str);
  }
}

//void receivedCallback( uint32_t from, String &msg )//On receiving of a signal, conduct the following tasks...
//{
////
////  http.begin("http://192.168.225.46:6600/incoming");  //Specifying request destination
////  http.addHeader("Content-Type", "text/plain");  //Specifying content-type header
////  int httpCode = http.POST(msg);
////  String payload = http.getString();
////  Serial.printf("%d : %s\n",httpCode, payload.c_str());
////  http.end();
//}
