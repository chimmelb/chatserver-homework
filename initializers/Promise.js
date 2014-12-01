'use strict';

exports.Promise = function( api, next ) {

  //In case it is needed somewhere, put bluebird on the api object
  api.Promise = require( 'bluebird' );

  //A lot of things are better as promises . . .
  api.Promise.promisifyAll( api.chatRoom );

  // api.Promise._start = function( api, next ) {
  //   next();
  // };

  // api.Promise._stop = function( api, next ) {
  //   next();
  // };

  next();
}
