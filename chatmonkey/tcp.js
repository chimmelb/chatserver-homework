'use strict';
var net = require( 'net' );
var util = require( 'util' );
var Promise = require( 'bluebird' );

var DEBUG = false;

function waitForPushMethod( thisClient, timeout, cb ) {
  var lines = [];

  var rsp = function( d ) {
    if ( DEBUG ) console.log( 'rsp: ' + d );
    d.split( '\n' ).forEach( function( l ) {
      lines.push( l );
    } );
    lines.push()
  };

  setTimeout( function() {


    var lastLine = lines[ ( lines.length - 1 ) ];
    if ( lastLine === '' ) {
      lastLine = lines[ ( lines.length - 2 ) ]
    }
    var parsed = null;
    try {
      parsed = JSON.parse( lastLine )
    } catch ( e ) {
      if ( DEBUG ) console.log( 'returning parsing error of ' + lastLine );
      return cb( e )
    }
    thisClient.client.removeListener( 'data', rsp );
    //console.log( '...wait for response returning: ' + JSON.stringify( parsed ) );
    if ( typeof cb === 'function' ) {
      cb( null, parsed );
    }
  }, timeout );

  thisClient.client.on( 'data', rsp );
}
var waitForPush = Promise.promisify( waitForPushMethod );
exports.waitForPush = waitForPush;


var request = Promise.method( function makeRequest( thisClient, timeout, message ) {
  //Technically this isn't a server push, but it's the same code
  if ( DEBUG ) console.log( 'tcp request...' + JSON.stringify( message ) );
  var str = ( typeof message === 'object' ? JSON.stringify( message ) : message );
  thisClient.client.write( str + '\r\n' );
  return waitForPush( thisClient, timeout );
} );
exports.request = request;

function connectClient( port, host, client, callback ) {
  //console.log( 'starting net connect at ' + host + ':' + port );
  client.client = net.connect( port, host, function() {
    //console.log( '...net connected' )
    client.client.setEncoding( 'utf8' );
    callback( null, client );
  } );
}
exports.connect = Promise.promisify( connectClient );

function logOn( client, username ) {
  return request( client, 150, {
      'action': 'logOn',
      'params': {
        username: username
      }
    } )
    .then( function( response ) {
      if ( response.success ) {
        client.username = username;
      }
      if ( response.error ) {
        throw new Error( 'monkey[' + client.id + '] logOn ' + username + ', ' + response.error );
      }
      return response.success;
    } );
}
exports.logOn = logOn;

function logOut( client ) {
  return request( client, 150, {
      'action': 'logOut'
    } )
    .then( function( response ) {
      return response.success;
    } );
}
exports.logOut = logOut;

function chat( client, msg ) {
  return request( client, 150, {
      'action': 'chatPublic',
      'params': {
        message: msg
      }
    } )
    .then( function( response ) {
      return response.success;
    } );
}
exports.chat = chat;
