exports.action = {
  name: 'private',
  description: 'a simple private action that always return true (if authenticated)',
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
