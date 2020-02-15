#include <painlessMesh.h>
#include <ESP8266HTTPClient.h>
#include <SoftwareSerial.h>
#include <creds.h> //To store mesh credentials

void receivedCallback( uint32_t from, String &msg );//'from' stores the chipID and 'msg' the message recieved

painlessMesh  mesh; //Declare mesh library objects
uint8_t server_ip[4] = {192, 168, 225, 46}; //Server IP
SoftwareSerial mySerial(4, 5); // RX, TX // SoftWare Serial Config

void setup() {
  Serial.begin(115200);
  mySerial.begin(115200);  
  mesh.setDebugMsgTypes( ERROR | STARTUP | CONNECTION );  //Debugging commands will thus be always displayed
  mesh.init( MESH_PREFIX, MESH_PASSWORD, MESH_PORT, WIFI_AP_STA, 6);//Mesh Initialisation
//  mesh.initOTAReceive("bridge");
//  mesh.stationManual(STATION_SSID, STATION_PASSWORD, STATION_PORT, server_ip);
  // Bridge node, should (in most cases) be a root node. 
  mesh.setRoot(true);
  // This node and all other nodes should ideally know the mesh contains a root, so call this on all nodes
  mesh.setContainsRoot(true);

  mesh.onReceive(&receivedCallback);//On Data Recieve, execute 'recievedCallback' function
}

void loop() {
  mesh.update();//Mantainance tasks automatically conducted by the library functions.
}

void receivedCallback( uint32_t from, String &msg )//On receiving of a signal, conduct the following tasks...
{
  String payload = "echoFromNode: Recieved from " + String(from) + " msg= " + String(msg);
  Serial.print(payload);
//  char* CharString;
//  payload.toCharArray(CharString, payload.length());
  mySerial.println(payload);

  
//  mySerial.write(payload);
//  "echoFromNode: Received from %u msg=%s\n", from, msg.c_str()
//  mesh.sendSingle(from, msg);//Talks back to the original meshnode

//  HTTPClient http; //Object for API Call
//  http.begin("http://192.168.225.46:6600/incoming");  //Specifying request destination
//  http.addHeader("Content-Type", "text/plain");  //Specifying content-type header
//  int httpCode = http.POST(msg);
//  String payload = http.getString();
//  Serial.printf("%d : %s\n",httpCode, payload.c_str());
//  http.end();
}
