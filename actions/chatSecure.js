exports.action = {
  name: 'chatSecure',
  description: 'used to chat with users on the secure channel',
  blockedConnectionTypes: [],
  outputExample: {},
  matchExtensionMimeType: false,
  version: 1.0,
  toDocument: true,

  needsAuthenticated: true,

  inputs: {
    required: [ "message" ],
    optional: [],
  },

  run: function( api, connection, next ) {
    // your logic here
    next( connection, true );
  }
};
