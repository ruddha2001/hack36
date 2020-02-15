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
  // Bridge node, should (in most cases) be a root node. 
  mesh.setRoot(true);
  // This node and all other nodes should ideally know the mesh contains a root, so we call this on all nodes
  mesh.setContainsRoot(true);
  mesh.onReceive(&receivedCallback);//On Data Recieve, execute 'recievedCallback' function
}

void loop() {
  mesh.update();//Mantainance tasks automatically conducted by the library functions.
}

void receivedCallback( uint32_t from, String &msg )//On receiving of a signal, conduct the following tasks...
{
  String payload = "echoFromNode: Recieved from " + String(from) + " msg= " + String(msg);
  Serial.println(payload);
  mySerial.println(payload);
}
