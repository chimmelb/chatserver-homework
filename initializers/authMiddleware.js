'use strict';
exports.authMiddleware = function( api, next ) {


  var doAuthenticate = function( connection, actionTemplate, next ) {

    //api.log( 'actionPreProcessor.doAuthenticate for action "' + actionTemplate.name + '"' );
    // Requires login
    if ( !!actionTemplate.needsAuthenticated ) {
      //api.log( '... needs authenticated' );

      //A simple check for authentication. Redis session storage might be more appropiate in some circumstances
      if ( !connection.username ) {
        connection.error = 'Unauthorized. This action requires authentication.';
      }

      next( connection, true );

    } else {
      //api.log( '... authentication not necessary' );
      next( connection, true );
    }

  };

  api.actions.addPreProcessor( doAuthenticate );
  next();
};
