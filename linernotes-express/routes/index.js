var express = require('express');
var router = express.Router();


var SpotifyWebApi = require('spotify-web-api-node');
scopes = ['user-read-private', 'user-read-email']

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
  redirectUri: 'http://localhost:3000/callback',
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  var scopes = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + '778acb1e78cf4e0a8510e0cbd0cefe23' +
    (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
    '&redirect_uri=' + encodeURIComponent('http://localhost:3000/callback'));
  });

// router.get('/login', (req,res) => {
//   var html = spotifyApi.createAuthorizeURL(scopes)
//   console.log(html.body)
//   // res.redirect('https://accounts.spotify.com/authorize' +
//   //   '?response_type=code' +
//   //   '&client_id=' + my_client_id +
//   //   (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
//   //   '&redirect_uri=' + encodeURIComponent(redirect_uri));
//   res.redirect(html + "&show_dialog=true");
// })

router.get('/callback', async (req,res) => {
  const { code } = req.query;
  console.log(code)
  try {
    var data = await spotifyApi.authorizationCodeGrant(code)
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    res.redirect('http://localhost:3000/home');
  } catch(err) {
    res.redirect('/#/error/invalid token');
  }
});

module.exports = router;