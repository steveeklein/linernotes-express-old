var express = require('express');
var router = express.Router();


var SpotifyWebApi = require('spotify-web-api-node');
scopes = ['user-top-read','user-read-currently-playing', 'user-read-playback-state']

require('dotenv').config();

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var spotifyApi = new SpotifyWebApi({
  // clientId: process.env.SPOTIFY_API_ID,
  // clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  // redirectUri: process.env.CALLBACK_URL,
  clientId: '778acb1e78cf4e0a8510e0cbd0cefe23',
  clientSecret: '649659376143496180b829a2f10bae13',
  redirectUri: 'http://localhost:8080/callback',
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + spotifyApi.getClientId() +
    (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
    '&redirect_uri=' + encodeURIComponent(spotifyApi.getRedirectURI()));
});

// router.get('/login', (req,res) => {
//   var html = spotifyApi.createAuthorizeURL(scopes)
//   console.log(html.body)
//   // res.redirect('https://accounts.spotify.com/authorize' +
//   //   '?response_type=code' +
//   //   '&client_id=' + my_client_id +
//   //   (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
//   //   '&redirect_uri=' + encodeURIComponent(redirect_uri));
//   res.redirect(html + '&show_dialog=true');
// })

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  // console.log(code)
  try {
    var data = await spotifyApi.authorizationCodeGrant(code)
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    res.redirect('http://localhost:3000');
  } catch(err) {
    res.redirect('/#/error/invalid token');
  }
});

router.get('/currentlyPlayingTrack', async function (req, res) {
  let currentlyPlayingTrack = {};
  try {
    currentlyPlayingTrack = await spotifyApi.getMyCurrentPlayingTrack(null);
        
  } catch (error) {
    console.error(new Error(error));
  }
  console.log(`currentlyPlayingTrack: ${JSON.stringify(currentlyPlayingTrack)}`);
    res.send(currentlyPlayingTrack);    
});

module.exports = router;