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


describe( 'User LogOn', function() {

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
  } )

  it( 'clientA can connect via web socket', function( done ) {
    clientA.connect( function( err, data ) {
      data.context.should.equal( 'response' );
      data.data.totalActions.should.equal( 0 );
      clientA.welcomeMessage.should.equal( 'Hello! Welcome to the actionhero api' );
      done();
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

  it( 'should not access a protected action', function( done ) {
    clientA.action( 'private', function( response ) {
      response.error.should.be.String;
      done();
    } );
  } );

  it( 'should allow clientA to logOn', function( done ) {
    clientA.action( 'logOn', {
      username: 'user'
    }, function( response ) {
      ( response.error === undefined ).should.eql( true, 'clientA logOn response: ' + JSON.stringify( response ) );
      response.success.should.be.true;
      done();
    } );
  } );

  it( 'should then allow access to a protected action', function( done ) {
    clientA.action( 'private', function( response ) {
      ( response.error === undefined ).should.eql( true, 'clientA logOn response: ' + JSON.stringify( response ) );
      response.success.should.be.true;
      done();
    } );
  } );

  it( 'user should be a member of defaultRoom', function( done ) {
    api.chatRoom.roomStatus( 'defaultRoom', function( err, response ) {
      //console.log( 'defaultRoom status: ' + JSON.stringify( response ) );
      response.members[ clientA.id ].should.be.Object;
      done();
    } );
  } );

  it( 'should fail if no username is provided', function( done ) {
    clientB.action( 'logOn', function( response ) {
      response.error.should.be.String;
      done();
    } );
  } );

  it( 'should fail if empty username is provided', function( done ) {
    clientB.action( 'logOn', {
      username: ''
    }, function( response ) {
      response.error.should.be.String;
      done();
    } );
  } );

} );
