var app = angular.module( 'actionheroChat', [] );
var rooms = [ 'defaultRoom' ]

app.controller( 'chatController', function( $scope, ChatClient ) {
  $scope.loggedIn = false;
  $scope.chatClient = new ChatClient( function() {
    $scope.$apply();
  } );
  $scope.chatClient.connect();

  $scope.inputMessage = {
    message: 'hi'
  };

  $scope.say = function() {
    $scope.chatClient.chatPublic( $scope.inputMessage.message );
    $scope.inputMessage.message = '';
  }

  $scope.logOn = function() {
    $scope.chatClient.logOn( $scope.inputUsername );
    $scope.inputUsername = '';
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

    self.client.on( 'connected', function() {
      self.connected = true;
      self.callback();
    } )
    self.client.on( 'disconnected', function() {
      self.connected = false;
      self.callback();
    } )
    self.client.on( 'message', function( message ) {

      console.log( 'message event: ' + JSON.stringify( message ) );
    } )
    self.client.on( 'alert', function( message ) {
      window.alert( JSON.stringify( message ) )
    } )
    self.client.on( 'api', function( message ) {
      window.alert( JSON.stringify( message ) )
    } )
    self.client.on( 'say', function( data ) {
      console.log( 'say event: ' + JSON.stringify( data ) );
      switch ( data.message.action ) {
        case 'joinedRoom':
          console.log( 'joined room message' );
          self.messages.push( {
            from: data.message.username,
            text: "***joined room***",
          } );
          break;
        case 'leftRoom':
          console.log( 'left room message' );
          self.messages.push( {
            from: data.message.username,
            text: "***left room***",
          } );
          break;
        case 'chatPublic':
          console.log( 'chat message' );
          self.messages.push( {
            from: data.message.from,
            text: data.message.message,
          } );
          break;
        default:
          console.log( 'no matching case for ' + data.message.action );
      }
      self.callback();
    } )
  };

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

  ChatClient.prototype.logOn = function( username ) {
    var self = this;
    //console.log( 'trying to log on with username ' + username );
    self.client.action( 'logOn', {
      username: username
    }, function( response ) {
      //console.log( 'response from logon: ' + JSON.stringify( response ) );
      if ( !response.error && response.success ) {
        self.username = username;
        self.callback();
      } else {
        console.log( 'error logging in: ' + JSON.stringify( response ) );
      }
    } );
  }

  ChatClient.prototype.logOut = function( message ) {
    var self = this;
    self.client.action( 'logOut', function( response ) {
      if ( !response.error && response.success ) {
        self.username = null;
      } else {
        console.log( 'error logging out: ' + JSON.stringify( response ) );
      }
      self.callback();
    } );
  }

  return ChatClient;
} );
