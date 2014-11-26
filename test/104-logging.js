process.env.NODE_ENV = 'test';

var should = require( 'should' );
var request = require( 'request' );
var EventEmitter = require( 'events' ).EventEmitter
var actionheroPrototype = require( 'actionhero' ).actionheroPrototype;
var actionhero = new actionheroPrototype();
var api;

var clientA;
var logClient;

var url

var connectClients = function( callback ) {
  // get actionheroClient in scope
  eval( api.servers.servers.websocket.compileActionheroClientJS() );

  var S = api.servers.servers.websocket.server.Socket;
  var url = 'http://localhost:' + api.config.servers.web.port;
  var clientAsocket = new S( url );
  var clientBsocket = new S( url );

  clientA = new ActionheroClient( {}, clientAsocket );
  logClient = new ActionheroClient( {}, clientBsocket );


  setTimeout( function() {
    callback();
  }, 100 );
}


describe( 'Logging', function() {

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
      clientA.welcomeMessage.should.equal( 'Connection established.' );
      clientA.action( 'logOn', {
        username: 'clientA'
      }, function( response ) {
        should( response.error ).not.be.ok;
        response.success.should.be.true;
        done();
      } );
    } );
  } );

  it( 'logClient can connect via web socket', function( done ) {
    logClient.connect( function( err, data ) {
      data.context.should.equal( 'response' );
      data.data.totalActions.should.equal( 0 );
      logClient.welcomeMessage.should.equal( 'Connection established.' );
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


  it( 'should allow a client to connect to the logger', function( done ) {
    function listener( response ) {
      true.should.eql( false, 'clientA should not recieve an alery when a logging client connects' );
    };

    clientA.addListener( 'say', listener );
    logClient.action( 'connectLogger', function( response ) {
      should( response.error ).not.be.ok;
      response.success.should.be.true;
      //give time for clientA to recieve a message (it should not)
      setTimeout( function() {
        clientA.removeListener( 'say', listener );
        done();
      }, 50 );
    } );

  } );

  it( 'should send logger message when another client performs an action', function( done ) {
    var msg = 'hello from clientA';

    function listener( response ) {
      //console.log( 'log msg: ' + JSON.stringify( response ) );
      logClient.removeListener( 'say', listener );
      response.message.user.should.eql( 'clientA', 'logClient listen error: ' + JSON.stringify( response ) );
      response.message.serverId.should.eql( api.id, 'logClient listen error: ' + JSON.stringify( response ) );
      response.message.action.should.eql( 'chatPublic', 'logClient listen error: ' + JSON.stringify( response ) );
      response.message.latency.should.be.Number;
      done();
    };

    logClient.addListener( 'say', listener );
    clientA.action( 'chatPublic', {
      message: msg
    }, function( response ) {
      ( response.error === undefined ).should.eql( true, 'clientA chatPublic response: ' + JSON.stringify( response ) );
      response.success.should.be.true;
    } );
  } );


  it( 'should send log with error message if client blows it', function( done ) {
    function listener( response ) {
      logClient.removeListener( 'say', listener );
      response.message.user.should.eql( 'clientA', 'logClient listen error: ' + JSON.stringify( response ) );
      response.message.serverId.should.eql( api.id, 'logClient listen error: ' + JSON.stringify( response ) );
      response.message.action.should.eql( 'chatPublic', 'logClient listen error: ' + JSON.stringify( response ) );
      response.message.latency.should.be.Number;
      response.message.error.should.be.String;
      done();
    };

    logClient.addListener( 'say', listener );

    //Message is an object
    clientA.action( 'chatPublic', {
      message: {
        obj: 1
      }
    }, function( response ) {
      response.error.should.be.String;
    } );
  } );

  it( 'should send logger message when another client logs out', function( done ) {
    var msg = 'hello from clientA';

    function listener( response ) {
      logClient.removeListener( 'say', listener );
      response.message.user.should.eql( 'clientA', 'logClient listen error: ' + JSON.stringify( response ) );
      response.message.serverId.should.eql( api.id, 'logClient listen error: ' + JSON.stringify( response ) );
      response.message.action.should.eql( 'logOut', 'logClient listen error: ' + JSON.stringify( response ) );
      response.message.latency.should.be.Number;
      done();
    };

    logClient.addListener( 'say', listener );
    clientA.action( 'logOut', {
      message: msg
    }, function( response ) {
      ( response.error === undefined ).should.eql( true, 'clientA logOut response: ' + JSON.stringify( response ) );
      response.success.should.be.true;
    } );
  } );

} );
