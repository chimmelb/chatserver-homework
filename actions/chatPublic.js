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

  inputs: {
    required: [ 'message' ],
    optional: [],
  },

  run: function( api, connection, next ) {
    if ( typeof connection.params.message !== 'string' ) {
      connection.error = 'message must be a string.';
      return next( connection, true );
    }
    var push = {
      action: 'chatPublic',
      message: connection.params.message,
      from: connection.username,
      room: 'defaultRoom'
    };
    api.chatRoom.broadcast( connection, 'defaultRoom', push, function( err, data ) {
      connection.response.success = true;
      if ( err ) connection.response.error = err;
      next( connection, true );
    } );
  }
};
