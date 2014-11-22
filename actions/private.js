exports.action = {
  name: 'private',
  description: 'private',
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
    connection.response.success = true;
    next( connection, true );
  }
};
