chatserver-homework
===================
# Approach
The goal of this assignment is to create a chat server and client, with dynamic logging, and with testing, that can be auto deployed. Here is my approach, let's see if I can spend the time to finish.

Chat needs to be real-time, so we'll need some sort of socket, and WebSockets is a nice protocol these days. Client might as well be a web page - HTML5 is very capable and portable. 

**Server: NodeJS with ActionHero**
NodeJS is the language I've been using most recently, and is fitting for a chat app (web tech and light processing). [ActionHeroJS](http://www.actionherojs.com/) is a framework I identify with over Express and the others as it feels more like a ESB than a "web app server". Definitely suited for APIs. 

ActionHero uses the [primus](https://github.com/primus/primus) library for WebSockets, which is a wrapper for a few different transports (socket.io, engine.io, websocket(RFC-6455), faye, etc.), so that checks the box for out chat transport. Redis is also used heavily by ActionHero, which will be all the DB we need for this simple server anyway. 

**Client: HTML + AngularJS**
A simple web page will act as our chat client. Basically any browser as well (though stick to an up-to-date one, IE10+, FireFox, Chrome, Safari - I use Chrome). Primus, and then ActionHero, each generate a client script file for use on a web page (or JS app) - so a lot of the work is done there.

AngularJS is a popular web dev framework, and will be very nice for this project for its two-way data binding. Message comes into data model, page is updated. Simple. Angular could do a lot more as well, but it's power shouldn't be required here.

**Chat Actions**
ActionHero has some basic chat examples and "verbs" built in, but we will define our own actions. Custom actions will be easier to write tests against for our business logic, and easy to hook into for custom log messages. There will be just one `defaultRoom` to start.

* LogOn - simple action to store a username in the connection. Param: username. Sets: auth
* chatPublic - single message on single channel. Param: message. Broadcasts to 'defaultRoom' the given message, an username of person who sent it.
* LogOut - no more messages. Broadcast of message that playa left the defaultRoom.
* joinRoom - Server Push Event. Fired when user logsOn (to other users that are logged on)
* leftRoom - Server Push Event. First when user logsOut (to other users still in room)

**Log Actions**
ActionHero uses [Winston](https://github.com/flatiron/winston) as its logging framework. There are logging levels, I'll have to see how to change that dynamically.

* setLogLevel - an action to set the existing log level. Params: logLevel ('info','warning','severe')


I'd like to set up two things here:

1. First is a logRoom that will broadcast log messages
2. Second would be a background task the gathers some key pieces of info from actionhero, and broadcasts to the logRoom. LogLevel will define the info logged.
3. Stretch step - it would be cool to broadcast winston logs to the stream as well. Unsure how possible that is.
4. Stretch step #2 - if that data is useful, it'd be cool to make an angular graph on the log page. Messages per minute or something. Visual stuff is always cooler than server-side . . . it's hard to sell the backend. 

** Testing **
Testing will be with [Mocha](http://mochajs.org/). This project didn't have anything about continuous delivery, so test will be run manually (SSH into VM server, `vagrant ssh`, and then run the tests `npm test`). Mocha gives a nice little output thought.

**Time**
A lot of key pieces are in place, and certainly possible, already. I'd say it'll take about 5 hours for the chat actions, and another 5 hours for the tests. Client-side work will be about 5 hours (masking the different rooms, buttons). Logging should be another 5, with that front-end taking about 3 (5 with the graph). 25 hours in a week? My wife might kill me . . . this isn't even for work! Let's see how far I get...

****
#Requirements
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
#Running
Push the vagrant server to a VM by running the command:

````
vagrant up
````

That will process for a while. Now access the client chat application at [http://192.168.50.3:3000](http://192.168.50.3:3000)
****
#Improvements
This will likely be the end of my work on this project, but things that would be improved:

* Better front-end. For design, I'd probably install Bower and Bootstrap, as that would give some flexibility on design changes and multi-modal layout. A lot of time could be lost here as well, so the app is simple. 
* Sign on. Authenication is pretty straight forward for ActionHero, and a bearer token might be nice for the WebSocket connection point. Two web page sections, sign up and sign on, would make the client feel more legit. My first step would be to have an authenticated user hide the chat <div>s, but AngularUI Views would be a better long-term choice. Redis session storage could be useful here as well. 
