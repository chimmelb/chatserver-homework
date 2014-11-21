chatserver-homework
===================
# Approach


#Requirements
Initial repo essentially forked from [here](https://github.com/theasta/vagrant-nodejs-dev). I did not want to reuse name. I felt confident on my appraoch to this homework, and this was a real jump-start for automated deployment - something I want to understand more going forward. 

Host machine must have [Virtual Box](https://www.virtualbox.org/), [Vagrant](http://www.vagrantup.com/) and [Ansible](http://docs.ansible.com/intro_installation.html) installed. This was performed on:

* Mac OSX 10.9.5
* Vagrant 1.6.5 
* VirtualBox 4.3.18
* Ansible 1.7.2

#Installation
````
git clone https://github.com/chimmelb/chatserver-homework
cd chatserver-homework
````
Edit `Vagrantfile` so this line matches your current working directory:

    config.vm.synced_folder "/Users/chimmelb/Documents/workspace/chatserver-homework", "/srv/chatserver-homework"

Once the local working directory is defined to be synced with Vagrant, the install is complete.

(The `Vagrantfile` also defines the IP of the VM network, defaulting to 192.168.50.3. Change that if needed).

#Running
Push the vagrant server to a VM by running the command:

````
vagrant up
````

That will process for a while. Now access the client chat application at [http://192.168.50.3:3000](http://192.168.50.3:3000)