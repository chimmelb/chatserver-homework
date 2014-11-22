exports.action = {
  name: 'logOn',
  description: 'logs a user into the chat system',
  blockedConnectionTypes: [],
  outputExample: {},
  matchExtensionMimeType: false,
  version: 1.0,
  toDocument: true,

  inputs: {
    required: [ "username" ],
    optional: [],
  },

  run: function( api, connection, next ) {
    connection._originalConnection.username = connection.params.username;

    api.chatRoom.addMember( connection.id, 'defaultRoom', function( err, connected ) {
      if ( err ) {
        connection.response.error = err;
      } else {
        connection.response.success = connected;
      }
      next( connection, true );
    } );
  }
};
