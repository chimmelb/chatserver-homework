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


describe( 'Server Logging', function() {

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

  it( 'logClient can connect via web socket, and connect logger', function( done ) {
    logClient.connect( function( err, data ) {
      data.context.should.equal( 'response' );
      data.data.totalActions.should.equal( 0 );
      logClient.welcomeMessage.should.equal( 'Connection established.' );
      logClient.action( 'connectLogger', function( response ) {
        should( response.error ).not.be.ok;
        response.success.should.be.true;
        done();
      } );
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


  it( 'will fail to allow non-log client to access action', function( done ) {
    clientA.action( 'serverLogging', {
      options: {
        statusOnly: true,
        enable: true
      }
    }, function( response ) {
      //console.log( 'clientA serverLogging: ' + JSON.stringify( response ) );
      response.error.should.be.ok;
      done();
    } );
  } );


  it( 'should return status disabled if first call and "statusOnly"', function( done ) {
    logClient.action( 'serverLogging', {
      options: {
        statusOnly: true,
        enable: true
      }
    }, function( response ) {
      //console.log( 'logClient serverLogging: ' + JSON.stringify( response ) );
      ( response.error === undefined ).should.eql( true, 'logClient.serverLogging.statusOnly=true: ' + JSON.stringify( response ) );
      response.enabled.should.eql( false, 'Expected first call to be false' );
      done();
    } );
  } );

  it( 'will fail if options does not contain "enable" or "statusOnly"', function( done ) {
    logClient.action( 'serverLogging', {
      options: {
        enableBAD: false,
        statusOnlyBAD: false
      }
    }, function( response ) {
      //console.log( 'logClient serverLogging: ' + JSON.stringify( response ) );
      response.error.should.be.ok;
      done();
    } );
  } );

  it( 'will fail if trying to disable serverLogging if already disabled', function( done ) {
    logClient.action( 'serverLogging', {
      options: {
        enable: false,
        statusOnly: false
      }
    }, function( response ) {
      //console.log( 'logClient serverLogging: ' + JSON.stringify( response ) );
      response.error.should.be.ok;
      response.enabled.should.eql( false );
      done();
    } );
  } );



  it( 'should turn on serverLogging, and receive a log message', function( done ) {
    function listener( response ) {
      //console.log( 'log msg: ' + JSON.stringify( response ) );
      if ( response.message.action === 'statsLog' ) {
        logClient.removeListener( 'say', listener );

        done();
      }
    };

    logClient.addListener( 'say', listener );


    logClient.action( 'serverLogging', {
      options: {
        enable: true,
        statusOnly: false
      }
    }, function( response ) {
      //console.log( 'logClient serverLogging: ' + JSON.stringify( response ) );
      ( response.error === undefined ).should.eql( true, 'logClient.serverLogging.enable=true: ' + JSON.stringify( response ) );
      response.enabled.should.eql( true );
      logClient.action( 'serverLogging', {
        options: {
          statusOnly: true,
          enable: true
        }
      }, function( response ) {
        //console.log( 'logClient serverLogging: ' + JSON.stringify( response ) );
        ( response.error === undefined ).should.eql( true, 'logClient.serverLogging.statusOnly=true: ' + JSON.stringify( response ) );
        response.enabled.should.eql( true );
      } );
    } );
  } );

  it( 'will fail if trying to enable serverLogging if already enabled', function( done ) {
    logClient.action( 'serverLogging', {
      options: {
        enable: true,
        statusOnly: false
      }
    }, function( response ) {
      //console.log( 'logClient serverLogging: ' + JSON.stringify( response ) );
      response.error.should.be.ok;
      response.enabled.should.eql( true );
      done();
    } );
  } );

  it( 'should turn off serverLogging, and not receive a log message', function( done ) {
    function listener( response ) {
      //console.log( 'log msg: ' + JSON.stringify( response ) );
      if ( response.message.action === 'statsLog' ) {
        true.should.eql( false, 'Should never reach this! Danger!' );
      }
    };

    logClient.addListener( 'say', listener );

    logClient.action( 'serverLogging', {
      options: {
        enable: false,
        statusOnly: false
      }
    }, function( response ) {
      //console.log( 'logClient serverLogging: ' + JSON.stringify( response ) );
      ( response.error === undefined ).should.eql( true, 'logClient.serverLogging.enable=true: ' + JSON.stringify( response ) );
      response.enabled.should.eql( false );
      //give time for logClient to recieve a message (it should not)
      setTimeout( function() {
        logClient.removeListener( 'say', listener );
        done();
      }, 2000 ); //timeout of 2000, as test logging time are 1000
    } );
  } );


} );
