exports.action = {
  name: 'logOn',
  description: 'logs a user into the chat system',
  blockedConnectionTypes: [],
  outputExample: {},
  matchExtensionMimeType: false,
  version: 1.0,
  toDocument: true,
  shouldLog: true,

  inputs: {
    required: [ "username" ],
    optional: [],
  },

  run: function( api, connection, next ) {
    //Put it on the originalConnection so later actions can use it
    connection._originalConnection.username = connection.params.username;
    //put it on this connection object (temp) for further use in this processing chain
    connection.username = connection.params.username;

    //This call should basically always pass
    api.chatRoom.addMember( connection.id, 'defaultRoom', function( err, connected ) {
      connection.response.error = err;
      connection.response.success = connected;
      next( connection, true );
    } );
  }
};
