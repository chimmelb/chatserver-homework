exports.action = {
  name: 'joinSecure',
  description: 'used to join the secure channel',
  blockedConnectionTypes: [],
  outputExample: {},
  matchExtensionMimeType: false,
  version: 1.0,
  toDocument: true,
  needsAuthenticated: true,

  inputs: {
    required: [ 'token' ],
    optional: [],
  },

  run: function( api, connection, next ) {
    // your logic here
    next( connection, true );
  }
};
