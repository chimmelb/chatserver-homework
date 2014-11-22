'use strict';
var util = require( 'util' );
var Promise = require( 'bluebird' );
var EventEmitter = require( 'events' ).EventEmitter

var connectClients = function( api, clientsObjArray, callback ) {

  var clients = util.isArray( clientsObjArray ) ? clientsObjArray : [ clientsObjArray ];
  // get actionheroClient in scope
  eval( api.servers.servers.websocket.compileActionheroClientJS() );

  var Sock = api.servers.servers.websocket.server.Socket;
  var url = 'http://localhost:' + api.config.servers.web.port;

  clients.forEach( function( client ) {
    client.sock = new Sock( url );
    client.ahws = new ActionheroClient( {}, client.sock );

    client.ahws.connect( function( err, data ) {
      data.context.should.equal( 'response' );
      data.data.totalActions.should.equal( 0 );
      client.ahws.welcomeMessage.should.equal( 'Hello! Welcome to the actionhero api' );
    } );
  } );

  setTimeout( function() {
    callback();
  }, 100 );
}
exports.connectClients = connectClients;
