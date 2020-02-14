#include <painlessMesh.h>
#include <creds.h>  //To store credentials

painlessMesh  mesh; //Defining object of the painlessMesh class

Scheduler userScheduler;//We cannot use delays, thus we use the TaskScheduler Library to delay and set tasks
void sendMessage() ;//Init of message sending function

Task taskSendMessage( 500, TASK_FOREVER, &sendMessage );//The task of sending a message every minute

void sendMessage()//Specially formatted message containing all vitals information
{
  String msg = "Hello from node 1";
  mesh.sendBroadcast( msg );
  Serial.println("MESSAGE SENT: " + msg);
  taskSendMessage.setInterval(500);

}

void setup()//Init of the mesh network and init of the TaskScheduler
{
  Serial.begin(115200);
  mesh.setDebugMsgTypes( ERROR | STARTUP | CONNECTION );
  mesh.init(MESH_PREFIX, MESH_PASSWORD, &userScheduler, MESH_PORT); //Mesh Network Credentials
  userScheduler.addTask( taskSendMessage );
  taskSendMessage.enable();
}

void loop()//Manadtory update function of the library.
{
  mesh.update();
}
