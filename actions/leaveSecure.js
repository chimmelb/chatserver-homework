exports.action = {
  name: 'leaveSecure',
  description: 'used to exit the secure channel',
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
    // your logic here
    next( connection, true );
  }
};
