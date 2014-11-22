'use strict';

exports.Promise = function( api, next ) {

  api.Promise = require( 'bluebird' );

  api.Promise.promisifyAll( api.chatRoom );

  // api.Promise._start = function( api, next ) {
  //   next();
  // };

  // api.Promise._stop = function( api, next ) {
  //   next();
  // };

  next();
}
