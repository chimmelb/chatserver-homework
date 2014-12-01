exports.action = {
  name: 'logOut',
  description: 'logs a user out of the chat system',
  blockedConnectionTypes: [],
  outputExample: {},
  matchExtensionMimeType: false,
  version: 1.0,
  toDocument: true,
  needsAuthenticated: true,
  shouldLog: true,

  inputs: {
    required: [],
    optional: [],
  },

  run: function( api, connection, next ) {

    //Remove the connection from the room
    api.chatRoom.removeMember( connection.id, 'defaultRoom', function( err, isRemoved ) {
      connection.response.success = isRemoved;
      connection.error = err;
      //Delete the connection stats so user is no longer logged in
      delete connection._originalConnection.username;
      next( connection, true );
    } )

  }
};
