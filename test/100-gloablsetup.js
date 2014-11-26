require( 'blanket' )( {
  pattern: function( filename ) {
    return !/node_modules|config|test/.test( filename );
  }
} );

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

  clientA = new ActionheroClient( {}, clientAsocket );

  setTimeout( function() {
    callback();
  }, 100 );
}


describe( 'Global Setup, Stock Actions', function() {

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
      clientA.welcomeMessage.should.equal( 'Connection established.' );
      done();
    } );
  } );


  it( 'should make showDocumentation call', function( done ) {
    clientA.action( 'showDocumentation', {
      username: 'user'
    }, function( response ) {
      done();
    } );
  } );

  it( 'should make status call', function( done ) {
    clientA.action( 'status', {
      username: 'user'
    }, function( response ) {
      done();
    } );
  } );


} );
