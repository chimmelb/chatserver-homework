exports.logLogic = function( api, next ) {

  api.logLogic = {};
  api.logLogic.loggingKey = 'loggingKey';

  api.logLogic.log = function( toLog ) {
    //console.log( 'logging: ' + JSON.stringify( toLog ) );
    api.chatRoom.broadcast( {}, 'logging', toLog );
  }

  api.logLogic._start = function( api, next ) {
    setInterval( function() {
      //Every 10 seconds, check the global cache value for logging
      api.cache.load( api.logLogic.loggingKey, function( err, value ) {
        //console.log( 'logLogic, loading key, value=' + value );
        //If it is found, proceed to get the server stats, and broadcast to the logging channel
        if ( !err && !!value ) {
          api.stats.getAll( function( err, stats ) {
            if ( !err && !!stats ) {
              //Got some stats. Now broadcast
              stats.action = 'statsLog';
              stats.timeStamp = new Date().getTime();
              api.logLogic.log( stats );
            }
          } );
        }

      } );
    }, api.config.logger.serverLoggingInterval );
    setTimeout( function() {
      api.chatRoom.add( 'logging' );
    }, 10000 );
    next();
  };

  api.logLogic._stop = function( api, next ) {
    next();
  };




  api.actions.addPreProcessor( function( connection, actionTemplate, next ) {
    connection.loggingStats = {
      timeIn: new Date().getTime(),
      serverId: api.id,
      action: actionTemplate.name,
    }
    next( connection, true );
  } );

  // a postProcessor to append the action's description to the response body

  api.actions.addPostProcessor( function( connection, actionTemplate, toRender, next ) {

    if ( actionTemplate.shouldLog ) {
      if ( connection.error ) {
        connection.loggingStats.error = connection.error;
      }
      connection.loggingStats.user = connection.username;
      connection.loggingStats.timeOut = new Date().getTime();
      api.logLogic.log( connection.loggingStats );
    }
    next( connection, toRender );
  } );

  next();
}
