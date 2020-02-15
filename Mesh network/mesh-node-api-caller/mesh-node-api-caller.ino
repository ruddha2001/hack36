#include <ESP8266HTTPClient.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <creds.h> //To store mesh credentials
HTTPClient http; //Object for API Call
SoftwareSerial mySerial(4, 5); // RX, TX Software Serial Config

void setup() {
  Serial.begin(115200);
  mySerial.begin(115200);
  WiFi.begin(STATION_SSID, STATION_PASSWORD); //To start the nodeMCU in Station Mode
  delay(500);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("WiFi Connected with IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (mySerial.available())
  {
    String str = mySerial.readStringUntil('\n');
//    mySerial.flush();
    Serial.println(str);
    http.begin("http://192.168.225.98:6600/incoming");  //Specifying request destination
    http.addHeader("Content-Type", "application/json");  //Specifying content-type header
    int httpCode = http.POST(str);
    String httpStatus = http.getString();
    Serial.printf("%d\n",httpCode);
    http.end();
  }
}
