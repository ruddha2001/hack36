#include <painlessMesh.h>
#include <creds.h>  //To store credentials

painlessMesh  mesh; //Defining object of the painlessMesh class

Scheduler userScheduler;//We cannot use delays, thus we use the TaskScheduler Library to delay and set tasks
void sendMessage() ;//Init of message sending function

Task taskSendMessage( 500, TASK_FOREVER, &sendMessage );//The task of sending a message every minute

void sendMessage()//Specially formatted message containing all vitals information
{
  uint32_t nodeId = mesh.getNodeId();
  String msg = "Hello from node " + String(nodeId);
  mesh.sendBroadcast( msg );
  Serial.println("MESSAGE SENT: " + msg);
  taskSendMessage.setInterval(500);
}

void setup()//Init of the mesh network and init of the TaskScheduler
{
  Serial.begin(115200);
  mesh.setDebugMsgTypes( ERROR | STARTUP | CONNECTION );
  mesh.init(MESH_PREFIX, MESH_PASSWORD, &userScheduler, MESH_PORT, WIFI_AP_STA, 6); //Mesh Network Credentials
  mesh.setContainsRoot(true); // This node and all other nodes should ideally know the mesh contains a root, so we call this on all nodes
  userScheduler.addTask( taskSendMessage );
  taskSendMessage.enable();
}

void loop()//Manadtory update function of the library.
{
  mesh.update();
}
