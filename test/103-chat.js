process.env.NODE_ENV = 'test';

var should = require( 'should' );
var request = require( 'request' );
var EventEmitter = require( 'events' ).EventEmitter
var actionheroPrototype = require( 'actionhero' ).actionheroPrototype;
var actionhero = new actionheroPrototype();
var api;

var clientA;
var clientB;
var clientC;

var url

var connectClients = function( callback ) {
  // get actionheroClient in scope
  eval( api.servers.servers.websocket.compileActionheroClientJS() );

  var S = api.servers.servers.websocket.server.Socket;
  var url = 'http://localhost:' + api.config.servers.web.port;
  var clientAsocket = new S( url );
  var clientBsocket = new S( url );
  var clientCsocket = new S( url );

  clientA = new ActionheroClient( {}, clientAsocket );
  clientB = new ActionheroClient( {}, clientBsocket );
  clientC = new ActionheroClient( {}, clientCsocket );

  setTimeout( function() {
    callback();
  }, 100 );
}


describe( 'Chat', function() {

  before( function( done ) {
    actionhero.start( function( err, a ) {
      api = a;
      url = 'http://localhost:' + api.config.servers.web.port;
      api.config.servers.websocket.clientUrl = 'http://localhost:' + api.config.servers.web.port;
      connectClients( function() {
        done();

      } );
    } )
  } );

  after( function( done ) {
    actionhero.stop( function( err ) {
      done();
    } );
  } );

  it( 'clientA can connect via web socket, and logOn', function( done ) {
    clientA.connect( function( err, data ) {
      data.context.should.equal( 'response' );
      data.data.totalActions.should.equal( 0 );
      clientA.welcomeMessage.should.equal( 'Hello! Welcome to the actionhero api' );
      clientA.action( 'logOn', {
        username: 'clientA'
      }, function( response ) {
        should( response.error ).not.be.ok;
        response.success.should.be.true;
        done();
      } );
    } );
  } );

  it( 'clientB can connect via web socket', function( done ) {
    clientB.connect( function( err, data ) {
      data.context.should.equal( 'response' );
      data.data.totalActions.should.equal( 0 );
      clientA.welcomeMessage.should.equal( 'Hello! Welcome to the actionhero api' );
      done();
    } );
  } );

  // it( 'clientC can connect via web socket', function( done ) {
  //   clientC.connect( function( err, data ) {
  //     data.context.should.equal( 'response' );
  //     data.data.totalActions.should.equal( 0 );
  //     clientA.welcomeMessage.should.equal( 'Hello! Welcome to the actionhero api' );
  //     done();
  //   } );
  // } );


  it( 'should anounce when someone else logs on', function( done ) {
    function listener( response ) {
      clientA.removeListener( 'say', listener );
      response.message.action.should.eql( 'joinedRoom', 'clientB joined error: ' + JSON.stringify( response ) );
      response.message.username.should.eql( 'clientB', 'clientB joined error: ' + JSON.stringify( response ) );
      done();
    };

    clientA.addListener( 'say', listener );
    clientB.action( 'logOn', {
      username: 'clientB'
    }, function( response ) {
      should( response.error ).not.be.ok;
      response.success.should.be.true;
    } );

  } );

  it( 'should receive message from someone who just joined the room', function( done ) {
    var msg = 'hello from clientB';

    function listener( response ) {
      clientA.removeListener( 'say', listener );
      response.message.action.should.eql( 'chatPublic', 'clientB chatPublic error: ' + JSON.stringify( response ) );
      response.message.from.should.eql( 'clientB', 'clientB chatPublic error: ' + JSON.stringify( response ) );
      response.message.room.should.eql( 'defaultRoom', 'clientB chatPublic error: ' + JSON.stringify( response ) );
      response.message.message.should.eql( msg, 'clientB chatPublic error: ' + JSON.stringify( response ) );
      done();
    };

    clientA.addListener( 'say', listener );
    clientB.action( 'chatPublic', {
      message: msg
    }, function( response ) {
      ( response.error === undefined ).should.eql( true, 'clientB chatPublic response: ' + JSON.stringify( response ) );
      response.success.should.be.true;
    } );
  } );

  it( 'should receive message from someone who has been in the room', function( done ) {
    var msg = 'hello from clientB';

    function listener( response ) {
      clientB.removeListener( 'say', listener );
      response.message.action.should.eql( 'chatPublic', 'clientA chatPublic error: ' + JSON.stringify( response ) );
      response.message.from.should.eql( 'clientA', 'clientA chatPublic error: ' + JSON.stringify( response ) );
      response.message.room.should.eql( 'defaultRoom', 'clientA chatPublic error: ' + JSON.stringify( response ) );
      response.message.message.should.eql( msg, 'clientA chatPublic error: ' + JSON.stringify( response ) );
      done();
    };

    clientB.addListener( 'say', listener );
    clientA.action( 'chatPublic', {
      message: msg
    }, function( response ) {
      ( response.error === undefined ).should.eql( true, 'clientA chatPublic response: ' + JSON.stringify( response ) );
      response.success.should.be.true;
    } );
  } );

  it( 'should anounce when someone logs out', function( done ) {
    function listener( response ) {
      clientA.removeListener( 'say', listener );
      response.message.action.should.eql( 'leftRoom', 'clientB leftRoom error: ' + JSON.stringify( response ) );
      response.message.username.should.eql( 'clientB', 'clientB leftRoom error: ' + JSON.stringify( response ) );
      done();
    };

    clientA.addListener( 'say', listener );
    clientB.action( 'logOut', {
      username: 'clientB'
    }, function( response ) {
      ( response.error === undefined ).should.eql( true, 'clientB logOut response: ' + JSON.stringify( response ) );
      response.success.should.be.true;
    } );

  } );

  it( 'will fail if user is not logged in', function( done ) {
    clientB.action( 'chatPublic', function( response ) {
      response.error.should.be.String;
      done();
    } );
  } );

  it( 'will fail if message is not a string', function( done ) {
    //Message is an object
    clientA.action( 'chatPublic', {
      message: {
        obj: 1
      }
    }, function( response ) {
      response.error.should.be.String;
      //message is a number
      clientA.action( 'chatPublic', {
          message: 10
        },
        function( response ) {
          response.error.should.be.String;
          done();
        } );
    } );
  } );

} );
