'use strict';
var Promise = require( 'bluebird' );
var tcp = require( './tcp.js' );

var argv = require( 'yargs' )
  .usage( 'Unleash some chat monkies!.\nUsage: $0 -host [str] -port [num]' )
  .demand( 1, 'Please specify the number of chat monkies to create.' )
  .example( 'node chatmonkey 5 -host localhost -port 5000', 'Start 5 chat monkies on localhost:5000' )
  .default( 'host', '192.168.50.3' )
  .default( 'port', 5000 )
  .argv;



function rand( min, max ) {
  var result = Math.floor( Math.random() * ( max - min + 1 ) + min );
  //console.log( 'rand(' + min + ',' + max + ')=' + result );
  return result;
}

//List of user names
var usernames = [
  'eGremlin',
  'BinaryMan',
  'FastChef',
  'JunkTop',
  'PurpleCharger',
  'CodeBuns',
  'BunnyJinx',
  'GoogleCat',
  'StrangeWizard',
  'Fuzzy_Logic',
  'New_Cliche',
  'whereismyname',
  'Nojokur',
  'Illusionz',
  'Spazyfool',
  'Supergrass',
  'Dreamworx',
  'Fried_Sushi'
];
//Username indecies that are in use
var userIndecies = [];
//List of messages to be chatted
var messages = [ 'hey there', 'I don\'t know', 'how is everyone doing?', 'what time is it there? ', 'I know what you mean',
  'LOL', 'ha ha : )', 'why do you say that?', 'I understand', 'I don\'t get it', 'same here', 'me too', 'too funny',
  'have any cat pics?', 'I had a late shift tonight', 'my dog is barking', 'find anything?', 'why are we still up?',
  'fancy that', 'love your user name', 'my mom is calling for dinner', 'NOM NOM NOM', 'send the link', 'hello', 'hey',
  'gotta go', 'afk', 'talk to you later', 'what music are you listening to?', 'ROFLMAO!!!1',
];
//Message indecies that are in use
var msgIndecies = [];

if ( isNaN( argv._[ 0 ] ) || argv._[ 0 ] > usernames.length || argv._[ 0 ] < 1 ) {
  console.error( 'Number of monkies must be at least 1, and no more than ' + usernames.length );
  process.exit();
}
var numberOfMonkies = argv._[ 0 ];

function getUsername() {
  //console.log( 'getting user name, used indecies: ' + userIndecies );
  var idx = rand( 0, usernames.length - 1 );
  while ( userIndecies.indexOf( idx ) >= 0 ) {
    idx = rand( 0, usernames.length - 1 );
  }
  //console.log( 'going to use index ' + idx + ', ' + usernames[ idx ] );
  userIndecies.push( idx );
  return usernames[ idx ];
}

function getMsg() {
  if ( msgIndecies.length === messages.length ) {
    msgIndecies = [];
  }
  var idx = rand( 0, messages.length - 1 );
  while ( msgIndecies.indexOf( idx ) >= 0 ) {
    idx = rand( 0, messages.length - 1 );
  }
  msgIndecies.push( idx );
  return messages[ idx ];
}

function createMessages( client ) {
  var messageTime = 0;
  var messagePromises = [];
  var numMessages = rand( 3, 7 );
  console.log( 'monkey[' + client.id + '] going to chat ' + numMessages + ' messages' );
  for ( var idx = numMessages; idx > 0; idx-- ) {
    messageTime += ( 1000 * rand( 1, 5 ) );
    var prom = Promise.delay( Promise.bind( client ), messageTime )
      .then( function() {
        var msg = getMsg();
        //console.log( 'monkey[' + client.id + '] chat: ' + msg );
        return tcp.chat( this, msg );
      } );
    messagePromises.push( prom );
  }
  return messagePromises;
}

var logTime = 0;
var currentMonkeyId = 0;
var monkeyPromises = [];
while ( currentMonkeyId < numberOfMonkies ) {
  var currentMonkey = {
    id: currentMonkeyId
  };
  var logDelay = 1000 * rand( 1, 3 );
  logTime += logDelay;
  console.log( 'Starting monkey ' + currentMonkeyId + ' at time ' + logTime );
  var monkeyProm = Promise.delay( Promise.bind( currentMonkey ), logTime )
    .then( function() {
      return tcp.connect( argv.port, argv.host, this );
    } )
    .then( function( client ) {
      //console.log( 'Connected client client ' + this.id + ', logging on' );
      return tcp.logOn( this, getUsername() )
    } )
    .then( function( success ) {
      console.log( 'monkey[' + this.id + '] has logged in as ' + this.username );
      return Promise.all( createMessages( this ) );
    } )
    .then( function( results ) {
      console.log( 'monkey[' + this.id + '] is logging out' );
      return tcp.logOut( this );
    } );
  monkeyPromises.push( monkeyProm );
  currentMonkeyId++;
}
console.log( 'setup complete, running' );
Promise.all( monkeyPromises )
  .then( function( results ) {
    console.log( 'All done!' );
    process.exit();
  } )
  .catch( function( err ) {
    console.error( err );
    process.exit();
  } );
