exports.chatLogic = function( api, next ) {

  api.chatLogic = {};

  api.chatRoom.addJoinCallback( function( connection, room ) {
    var msg = {
      action: 'joinedRoom',
      username: connection.username
    };

    api.chatRoom.broadcast( connection, room, msg );
  } );

  api.chatRoom.addLeaveCallback( function( connection, room ) {
    var msg = {
      action: 'leftRoom',
      username: connection.username
    };
    api.chatRoom.broadcast( connection, room, msg );
  } );

  api.chatLogic._start = function( api, next ) {
    next();
  };

  api.chatLogic._stop = function( api, next ) {
    next();
  };

  next();
}
