exports.action = {
  name: 'logOut',
  description: 'logs a user out of the chat system',
  blockedConnectionTypes: [],
  outputExample: {},
  matchExtensionMimeType: false,
  version: 1.0,
  toDocument: true,
  needsAuthenticated: true,

  inputs: {
    required: [],
    optional: [],
  },

  run: function( api, connection, next ) {

    api.chatRoom.removeMember( connection.id, 'defaultRoom', function( err, isRemoved ) {
      connection.response.success = isRemoved;
      connection.error = err;
      delete connection._originalConnection.username;
      next( connection, true );
    } )

  }
};
