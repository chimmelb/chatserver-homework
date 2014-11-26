exports.logLogic = function( api, next ) {

  api.logLogic = {};

  api.logLogic.log = function( toLog ) {
    api.chatRoom.broadcast( {}, 'logging', toLog );
  }

  api.logLogic._start = function( api, next ) {
    next();
  };

  api.logLogic._stop = function( api, next ) {
    next();
  };

  api.actions.addPreProcessor( function( connection, actionTemplate, next ) {
    connection.loggingStatsTimeIn = new Date();
    connection.loggingStats = {
      serverId: api.id,
      action: actionTemplate.name,
    }
    next( connection, true );
  } );

  // a postProcessor to append the action's description to the response body

  api.actions.addPostProcessor( function( connection, actionTemplate, toRender, next ) {

    if ( connection.username ) {
      if ( connection.error ) {
        connection.loggingStats.error = connection.error;
      }
      connection.loggingStats.user = connection.username;
      connection.loggingStats.latency = new Date() - connection.loggingStatsTimeIn;
      api.logLogic.log( connection.loggingStats );
    }
    next( connection, toRender );
  } );

  next();
}
