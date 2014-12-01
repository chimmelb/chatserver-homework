exports.action = {
  name: 'connectLogger',
  description: 'logs a user into the chat system',
  blockedConnectionTypes: [],
  outputExample: {},
  matchExtensionMimeType: false,
  version: 1.0,
  toDocument: true,

  inputs: {
    required: [],
    optional: [],
  },

  run: function( api, connection, next ) {
    //connect this connection to the logging server. This call will basically always pass
    api.chatRoom.addMember( connection.id, 'logging', function( err, connected ) {
      connection.response.error = err;
      connection.response.success = connected;
      next( connection, true );
    } );
  }
};
