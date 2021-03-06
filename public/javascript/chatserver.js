var app = angular.module( 'actionheroChat', [ 'ui.bootstrap' ] );
var rooms = [ 'defaultRoom' ]

app.controller( 'chatController', function( $scope, ChatClient ) {
  $scope.loggedIn = false;
  $scope.chatClient = new ChatClient( function() {
    $scope.$apply();
  } );
  $scope.chatClient.connect();
  $scope.logClient = new ChatClient( function() {
    $scope.$apply();
  } );


  $scope.inputMessage = {
    message: 'hi'
  };

  $scope.say = function() {
    $scope.chatClient.chatPublic( $scope.inputMessage.message );
    $scope.inputMessage.message = '';
  }

  $scope.logOn = function() {
    $scope.chatClient.logOn( $scope.inputUsername, function() {
      $scope.logClient.connect();
      setTimeout( function() {
        $scope.logClient.connectLogger();
      }, 500 );
    } );
    $scope.inputUsername = '';
  }

  $scope.enableServerLogging = function( enable ) {
    $scope.logClient.setServerLogging( enable );
  }

  $scope.logOut = function() {
    $scope.chatClient.logOut( $scope.inputUsername, function() {
      $scope.logClient.disconnect();
    } );
  }
} );

app.factory( 'ChatClient', function() {
  var ChatClient = function( callback ) {
    var self = this;

    self.client = new ActionheroClient();
    self.messages = [];
    self.error = null;
    self.rooms = rooms;
    self.connected = false;
    self.callback = callback;
    self.username = null;
    self.serverLogging = null;

    self.client.on( 'connected', function() {
      self.connected = true;
      self.callback();
    } )
    self.client.on( 'disconnected', function() {
        self.connected = false;
        self.callback();
      } )
      // self.client.on( 'message', function( message ) {

    //   console.log( 'message event: ' + JSON.stringify( message ) );
    // } )

    self.client.on( 'alert', function( message ) {
      window.alert( JSON.stringify( message ) )
    } )
    self.client.on( 'api', function( message ) {
      window.alert( JSON.stringify( message ) )
    } )
    self.client.on( 'say', function( data ) {

      self.handleMessage( data );
    } );

    //Connect this web socket with the server
    ChatClient.prototype.connect = function() {
      var self = this;

      self.client.connect( function( error, details ) {
        if ( error ) {
          self.error = error;
        } else {
          self.details = details;
        }
      } );
    }

    //Disconnect the web socket from the server
    ChatClient.prototype.disconnect = function() {
      var self = this;

      self.client.disconnect( function( error, details ) {
        if ( error ) {
          self.error = error;
        } else {
          self.details = details;
        }
      } );
    }

    //shortcut method to chat public (fills in the action params)
    ChatClient.prototype.chatPublic = function( message ) {
      var self = this;
      self.client.action( 'chatPublic', {
        message: message
      } );
      self.messages.push( {
        from: self.username,
        text: message
      } );
    }

    //shortcut method to logOn, fills in action params
    ChatClient.prototype.logOn = function( username, callback ) {
      var self = this;
      //console.log( 'trying to log on with username ' + username );
      self.client.action( 'logOn', {
        username: username
      }, function( response ) {
        //console.log( 'response from logon: ' + JSON.stringify( response ) );
        if ( !response.error && response.success ) {
          //If we are successful, set the username
          self.username = username;
          callback();
          self.callback();
        } else {
          console.log( 'error logging in: ' + JSON.stringify( response ) );
        }
      } );
    }

    //shortcut method to connect to the logging service
    ChatClient.prototype.connectLogger = function() {
      var self = this;
      //console.log( 'trying to log on with username ' + username );
      self.client.action( 'connectLogger', function( response ) {
        //console.log( 'response from logon: ' + JSON.stringify( response ) );
        if ( !response.error && response.success ) {
          self.client.action( 'serverLogging', {
            options: {
              statusOnly: true
            }
          }, function( response ) {
            console.log( 'serverLogging status = ' + JSON.stringify( response ) );
            self.serverLogging = response.enabled;
            self.callback();
          } );
        } else {
          console.log( 'error logging in: ' + JSON.stringify( response ) );
        }
      } );
    }

    //shortcut method to set the serverLogging value (fills in action params)
    ChatClient.prototype.setServerLogging = function( enable ) {
      var self = this;
      self.client.action( 'serverLogging', {
        options: {
          enable: enable
        }
      }, function( response ) {
        console.log( 'serverLogging status = ' + JSON.stringify( response ) );
        self.serverLogging = response.enabled;
        self.callback();
      } );
    }

    //shortcut method to log out from the chat system
    ChatClient.prototype.logOut = function( message, callback ) {
      var self = this;
      self.client.action( 'logOut', function( response ) {
        if ( !response.error && response.success ) {
          self.username = null;
          callback();
        } else {
          console.log( 'error logging out: ' + JSON.stringify( response ) );
        }
        self.callback();
      } );
    }

    //Basic controls to handle input messages, either from the chat system or logging service
    ChatClient.prototype.handleMessage = function( data ) {
      var self = this;
      console.log( 'say event: ' + JSON.stringify( data ) );
      if ( data.room === 'defaultRoom' ) {
        switch ( data.message.action ) {
          case 'joinedRoom':
            console.log( 'joined room message' );
            self.messages.unshift( {
              from: data.message.username,
              text: "***joined room***",
            } );
            break;
          case 'leftRoom':
            console.log( 'left room message' );
            self.messages.unshift( {
              from: data.message.username,
              text: "***left room***",
            } );
            break;
          case 'chatPublic':
            console.log( 'chat message' );
            self.messages.unshift( {
              from: data.message.from,
              text: data.message.message,
            } );
            break;
          default:
            console.log( 'no matching case for ' + data.message.action );
        }
      } else if ( data.room === 'logging' ) {
        switch ( data.message.action ) {
          case 'joinedRoom':
          case 'leftRoom':
            //do nothing, do not log loggers joining the room
            //console.log( 'doing nothing' );
            break;
          case 'serverLogging':
            self.serverLogging = data.message.enabled;
            self.callback();
            break;
          case 'statsLog':
            //filter the server stats so we don't log too much
            var statsToLog = {
              timeStamp: data.message.timeStamp,
              currentChatters: data.message[ "actionhero:stats" ][ "chatRoom:roomMembers:defaultRoom" ],
              totalChats: data.message[ "actionhero:stats" ][ "chatRoom:messagesSent:defaultRoom" ],
              totalActions: data.message[ "actionhero:stats" ][ "actions:totalProcessedActions" ]
            }
            self.messages.unshift( statsToLog );
            self.callback();
            break;
          default:
            self.messages.unshift( data.message );
            self.callback();
            break;
        }
      }
    }
  }
  return ChatClient;
} );
