chatserver-homework
===================
# Assignment
* Develop a chat server that supports multiple clients where you can send a message from a client to another client (feel free to apply any encryption or security aspect if you like). 
* Develop unit test code where you can run a unit test and see the coverage of all of your functions. 
* Once it's done, develop a script to deploy both client and server in automated way (you can use any scripts or chef/puppet, etc). Please be sure you have enough logs and appropriate log level so that you can trace and debug by setting different log level dynamically. 

****
#Build System Requirements
Initial repo essentially forked from [here](https://github.com/theasta/vagrant-nodejs-dev). I did not want to reuse name. I felt confident on my appraoch to this homework, and this was a real jump-start for automated deployment - something I want to understand more going forward. 

Host machine must have [Virtual Box](https://www.virtualbox.org/), [Vagrant](http://www.vagrantup.com/) and [Ansible](http://docs.ansible.com/intro_installation.html) installed. This was performed on:

* Mac OSX 10.9.5
* Vagrant 1.6.5 
* VirtualBox 4.3.18
* Ansible 1.7.2

Of course, one will need a [git](http://git-scm.com/) client too. 

****
#Installation
````
git clone https://github.com/chimmelb/chatserver-homework
cd chatserver-homework
````
Edit `Vagrantfile` so this line matches your current working directory:

    config.vm.synced_folder "/Users/chimmelb/Documents/workspace/chatserver-homework", "/srv/chatserver-homework"

Once the local working directory is defined to be synced with Vagrant, the install is complete.

(The `Vagrantfile` also defines the IP of the VM network, defaulting to 192.168.50.3. Change that if needed).
****
#Deployment
Push the vagrant server to a VM by running the command:

````
vagrant up
````

This can take a while to process. A clean VM image is spun up, required programs are downloaded and installed, and the host server is deployed. The installation should be a success and ready to use.
****
#Usage
Now access the client chat application at [http://192.168.50.3:8080](http://192.168.50.3:8080) with a modern web browser. The server is built as an API server[^1] where any client could connect and follow the API. The client in this case, is simply a web page[^2].

##Log On
 
Enter a username and click the "Log On" button. This will log into the system[^3], showing the Chat and Log windows on the client. The server will not authenticate any private actions without logging in.

##Chat
The chat window is simply text box to enter chat messages, and will display messages of other clients[^4]. Two columns are used to display the information, "Who" and "Message", though client design could be laid out differently (it is currently filtering info from the server.)

The chat window will also state when someone else joins or leaves the room.

##Logging
Log messages are streamed as a service from each server in the cluster, and this client connects to the logging service once a user logs in. Larger systems would count these as separate, but it fit the assignment. [^5]

The log window displays any time an action is performed on the chat service. Common actions seen are:

* logOn
* logOut
* chatPublic

Each log message is storing the server it came from, the user, the action, and the timeIn and timeOut of the server. Plus any error message, if it occurred. This log data could be analysed and filtered to find server latency, usage statistics per user or per server feature, server load (load-balancer performance), peak usage times etc. [^6]

The global statistics logging can be dynamically turned on an off, clicking the buttons to the left of "Extra Logging". These messages will display a filtered set of data (and time stamp) for the server application. These counts are historic (since the app was launched) while the currentChatters is closer to real-time.[^7] This is a global value, and any client can turn on or off this level of debug information.

##Test
Testing is done with [MochaJS](http://mochajs.org/). This project didn't require anything with continuous delivery, so test will be run manually following these steps:

1. `vagrant ssh`, 
2. On VM: `cd /srv/chatserver-homework`
3. On VM: `npm test`

The output will show the test headings and individual test that were run in a readable format. This type of testing follows the Behaviour Driven Development syntax ("describe" "it should", etc.). 

All tests should pass, and cover success and failure cases of the code. 

##Test Coverage
During test, the source files are instrumented using [BlanketJS](http://blanketjs.org/) to relay and format Mocha's coverage information. The resulting output is created on server start, and is served here:

[http://192.168.50.3:8080/coverage.html](http://192.168.50.3:8080/coverage.html)

100% coverage is a good thing.[^8]

#Chat Monkey

Included in the `/chatmonkey` folder is a simple program that creates a few users to chat with the server. They are random and timer based (no NLP or Turing machines here), but do fill up the chat and log windows so your closest friends or family aren't required to evaluate this software!

This could be run by SSH'ing to the VM with `vagrant ssh`, and from the `/srv/chatserver-homework` directory, running:

````
npm run monkey
````

This would start five monkies, though other command line options could be used as well.

****
Unleash some chat monkies!

Usage: `node ./chatmonkey $0 --host [str] --port [num]`

Examples:

````
  node chatmonkey 5 --host 192.168.50.3 --port 5000    Start 5 chat monkies on localhost:5000
````

Options:

````
  --host  [default: "localhost"]
  --port  [default: 5000]
````

#Final Thoughts
Overall, I think this assignment came out well. More could have been done to fully flesh out some key areas, but I beleive the pieces chosen could be scaled (in terms of users and infrastructure) and built into a full chat and/or logging system. Nice "homework" to bring all these aspects together. Please send any questions or comments my way.

****
###Footnotes

[^1]: NodeJS is the language I've been using most recently, and is fitting for a chat app (web tech and light processing). [ActionHeroJS](http://www.actionherojs.com/) is a framework I identify with over Express and the others as it feels more like a Java ESB than a "web app server". Definitely suited for APIs.

[^2]: The web page is built using the AngularJS framework with Bootstrap for styling. This would be a fair choice for any modern web app for multiple device types.

[^3]: Actual authentication with a database would be more secure, of course. Dropping web socket or TCP connections that are not authenticated after a second or two would also be appropitate (if there were not any public actions to access)

[^4]: Chat is essentially in real-time, minus any latency from client to server. WebSockets is a nice protocol and ActionHero uses the [primus](https://github.com/primus/primus) library for WebSockets, which is a wrapper for a few different transports (socket.io, engine.io, websocket(RFC-6455), faye, etc.). Messages are broadcast on the server via Redis pub/sub, and pushed to clients using the web sockets.

[^5]: A logging service is more appropiate once servers start to scale, as one cannot be sure that on-disk log files will be maintained if a server crashes (or cloud instances goes down). Data can then be stored in whatever manner fits the bill: big data DBs, high throughput MongoDBs, large EBS stores, whatever. 
  
[^6]: More analytics would have been nice for the client-side of the log messages. Just a view thing, but a graph would be great here. ChartJS has a nice AngularJS plugin, and a sparkline chart would have a good real-time feel for this logging data. Or analyzing the data per user, filter by time slice, etc. I'll add it in version 2.0 : )
  
[^7]: Many more stats are kept by ActionHero by default, let alone any custom stats that are needed for server debugging. I chose to log this type of information dynamically as it would aid in server-load information and scaled-system debugging. Feature level debugging could be acheived with Winston, the logging framework used by ActionHero, and piping all logged messages to the logging service. This did not make for a very visual client, nor logging too many server stats, so both were kept out for this brief user experience.
  
[^8]: Test coverage was run only against the code created for this project. Since javascript is not compiled, I left config files and server code out of the coverage results (because my test cases were not testing the framework.)
 
[^9]: 