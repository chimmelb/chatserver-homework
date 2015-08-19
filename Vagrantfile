# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box     = "parallels/ubuntu-14.04"
  config.vm.box_url = "http://files.vagrantup.com/precise64.box"

  config.vm.network :private_network, ip: "192.168.50.3"

  config.vm.synced_folder "/Users/chimmelb/Documents/workspace/chatserver-homework", "/srv/chatserver-homework"
  # config.vm.synced_folder "/local/path/to/anotherapp", "/srv/anotherapp"

  # Virtual Box Provider
	config.vm.provider "virtualbox" do |vb, override|
		override.vm.box = "ubuntu/trusty64"

		# Don't boot with headless mode
		#vb.gui = true

		# Set the timesync threshold to 10 seconds, instead of the default 20 minutes.
		vb.customize ["guestproperty", "set", :id, "/VirtualBox/GuestAdd/VBoxService/--timesync-set-threshold", 10000]

		# Use VBoxManage to customize the VM. For example to change memory:
		host = RbConfig::CONFIG['host_os']

		# Give VM 1/4 system memory & access to all cpu cores on the host
		if host =~ /darwin/
			cpus = `sysctl -n hw.ncpu`.to_i
			# sysctl returns Bytes and we need to convert to MB
			mem = `sysctl -n hw.memsize`.to_i / 1024 / 1024 / 4
		elsif host =~ /linux/
			cpus = `nproc`.to_i
			# meminfo shows KB and we need to convert to MB
			mem = `grep 'MemTotal' /proc/meminfo | sed -e 's/MemTotal://' -e 's/ kB//'`.to_i / 1024 / 4
		else # sorry Windows folks, I can't help you
			cpus = 2
			mem = 1024
		end

		vb.customize ["modifyvm", :id, "--memory", mem]
		vb.customize ["modifyvm", :id, "--cpus", cpus]


		# Use the host OS fo NAT lookups
		vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
		vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
	end

	# Parrallels Provider
	config.vm.provider "parallels" do |v, override|
		override.vm.box = "parallels/ubuntu-14.04"
		override.vm.box_version = "1.0.6"

		v.update_guest_tools = true
		v.name = "dev.chatserver"
		v.customize ["set", :id, "--on-window-close", "keep-running"]

		# Use VBoxManage to customize the VM. For example to change memory:
		host = RbConfig::CONFIG['host_os']

		# Give VM 1/4 system memory & access to all cpu cores on the host
		if host =~ /darwin/
			cpus = `sysctl -n hw.ncpu`.to_i
			# sysctl returns Bytes and we need to convert to MB
			mem = `sysctl -n hw.memsize`.to_i / 1024 / 1024 / 4
		elsif host =~ /linux/
			cpus = `nproc`.to_i
			# meminfo shows KB and we need to convert to MB
			mem = `grep 'MemTotal' /proc/meminfo | sed -e 's/MemTotal://' -e 's/ kB//'`.to_i / 1024 / 4
		else # sorry Windows folks, I can't help you
			cpus = 2
			mem = 1024
		end

		v.optimize_power_consumption = false
		v.memory = mem 
		v.cpus = cpus 
	end

  config.vm.provision :ansible do |ansible|
    ansible.playbook = "ansible-playbooks/main.yml"
    ansible.verbose = 'vvvv'
  end
end