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
    // your logic here
    next( connection, true );
  }
};
