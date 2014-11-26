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


describe( 'User LogOut', function() {

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

  it( 'clientC can connect via web socket', function( done ) {
    clientC.connect( function( err, data ) {
      data.context.should.equal( 'response' );
      data.data.totalActions.should.equal( 0 );
      clientA.welcomeMessage.should.equal( 'Hello! Welcome to the actionhero api' );
      done();
    } );
  } );


  it( 'will fail if not logged on', function( done ) {
    clientA.action( 'logOut', function( response ) {
      response.error.should.be.String;
      done();
    } );
  } );

  it( 'should allow a user to sign out', function( done ) {
    clientA.action( 'logOn', {
      username: 'user'
    }, function( responseLogOn ) {
      should( responseLogOn.error ).not.be.ok;
      responseLogOn.success.should.be.true;
      clientA.action( 'logOut', function( responseLogOut ) {
        ( responseLogOut.error === undefined ).should.eql( true, 'clientA logOut responseLogOut: ' + JSON.stringify( responseLogOut ) );
        responseLogOut.success.should.be.true;
        done();
      } );
    } );
  } );

  it( 'should logOut of defaultRoom when user logs out', function( done ) {
    api.chatRoom.roomStatus( 'defaultRoom', function( err, response ) {
      //should.not.exist( err );
      should.not.exist( response.members[ clientA.id ] );
      response.membersCount.should.eql( 0, 'logOut defaultRoom stats: ' + JSON.stringify( response ) )
      done();
    } );
  } );

  it( 'will fail private actions after logging out', function( done ) {
    clientB.action( 'logOn', {
      username: 'user'
    }, function( responseLogOn ) {
      should( responseLogOn.error ).not.be.ok;
      responseLogOn.success.should.be.true;
      clientB.action( 'private', function( response ) {
        ( response.error === undefined ).should.eql( true, 'clientB private response: ' + JSON.stringify( response ) );
        response.success.should.be.true;
        clientB.action( 'logOut', function( responseLogOut ) {
          ( responseLogOut.error === undefined ).should.eql( true, 'clientB logOut responseLogOut: ' + JSON.stringify( responseLogOut ) );
          responseLogOut.success.should.be.true;
          clientB.action( 'private', function( response ) {
            response.error.should.be.String;
            done();
          } );
        } );
      } );
    } );
  } );

  it( 'should log user out on disconnect', function( done ) {
    clientC.action( 'logOn', {
      username: 'user'
    }, function( response ) {
      should( response.error ).not.be.ok;
      response.success.should.be.true;
      api.chatRoom.roomStatus( 'defaultRoom', function( err, response ) {
        //console.log( 'defaultRoom status: ' + JSON.stringify( response ) );
        response.members[ clientC.id ].should.be.Object;

        clientC.disconnect();
        setTimeout( function() {
          api.chatRoom.roomStatus( 'defaultRoom', function( err, response ) {
            //console.log( 'defaultRoom status: ' + JSON.stringify( response ) );
            should.not.exist( response.members[ clientC.id ] );
            done();
          } );
        }, 100 );
      } );
    } );
  } );

} );
