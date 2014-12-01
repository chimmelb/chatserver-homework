'use strict';
exports.action = {
  name: 'chatPublic',
  description: 'Used to chat with users in the public room',
  blockedConnectionTypes: [],
  outputExample: {},
  matchExtensionMimeType: false,
  version: 1.0,
  toDocument: true,
  needsAuthenticated: true,
  shouldLog: true,


  inputs: {
    required: [ 'message' ],
    optional: [],
  },

  run: function( api, connection, next ) {
    //Make sure the message param is a string
    if ( typeof connection.params.message !== 'string' ) {
      connection.error = 'message must be a string.';
      return next( connection, true );
    }
    //Create the chat packet
    var push = {
      action: 'chatPublic',
      message: connection.params.message,
      from: connection.username,
      room: 'defaultRoom'
    };
    //Broadcast to everyone else in the room
    api.chatRoom.broadcast( connection, 'defaultRoom', push, function( err, data ) {
      connection.response.success = true;
      if ( err ) connection.response.error = err;
      next( connection, true );
    } );
  }
};
