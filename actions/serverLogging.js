exports.action = {
  name: 'serverLogging',
  description: 'used to enable or disable serverLogging (those message that log on an interval). "options" is an object, ' +
    ' with twp params: "statusOnly" will simply return the status, and "enable" will enable or disable serverLogging',
  blockedConnectionTypes: [ 'web' ],
  outputExample: {},
  matchExtensionMimeType: false,
  version: 1.0,
  toDocument: true,

  inputs: {
    required: [ 'options' ],
    optional: [],
  },

  run: function( api, connection, next ) {
    api.chatRoom.roomStatus( 'logging', function( statusErr, status ) {

      if ( !!statusErr || !status.members[ connection.id ] ) {
        connection.error = 'Cannot access serverLogging via this connection';
        return next( connection, true );
      }
      if ( typeof connection.params.options !== 'object' || ( connection.params.options[ 'enable' ] === undefined && connection.params.options[ 'statusOnly' ] === undefined ) ) {
        connection.error = '"options" must be an object, with at least one of "enable" or "statusOnly"';
        return next( connection, true );
      }
      var enable = connection.params.options.enable;
      api.cache.load( api.logLogic.loggingKey, function( err, value ) {
        //Treat err or !value as disabled
        var disabled = ( !!err || !value );

        //console.log( 'serverLogging: enable=' + enable + ' disabled=' + disabled + ' statusOnly=' + connection.params.options.statusOnly );
        if ( !!connection.params.options.statusOnly ) {
          connection.response.enabled = !disabled;
          return next( connection, true );

        }

        //Value is disabled, user wants to turn it on
        if ( disabled && enable ) {
          //console.log('serverLogging setting key to true');
          api.cache.save( api.logLogic.loggingKey, true, function( err, saved ) {
            connection.error = err;
            connection.response.enabled = true;
            next( connection, true );
            api.logLogic.log( {
              action: 'serverLogging',
              enabled: true
            } );
          } );
        }
        //value is on, and user wants to turn it on
        else if ( !disabled && enable ) {
          connection.error = 'Server logging already enabled.';
          connection.response.enabled = true;
          next( connection, true );
        }
        //value is off, and user wants to turn it off
        else if ( disabled && !enable ) {
          connection.error = 'Server logging already disabled.';
          connection.response.enabled = false;
          next( connection, true );
        }
        //value is on, and user wnat to turn it off
        else if ( !disabled && !enable ) {
          //console.log('serverLogging setting key to false');
          api.cache.save( api.logLogic.loggingKey, false, function( err, saved ) {
            connection.error = err;
            connection.response.enabled = false;
            next( connection, true );
            api.logLogic.log( {
              action: 'serverLogging',
              enabled: false
            } );
          } );
        }
      } );
    } );
  }
};
