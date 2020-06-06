var express = require('express');
var router = express.Router();


var SpotifyWebApi = require('spotify-web-api-node');
scopes = ['user-read-private', 'user-read-email','playlist-modify-public','playlist-modify-private']

require('dotenv').config();

var spotifyApi = new SpotifyWebApi({
  // clientId: process.env.SPOTIFY_API_ID,
  // clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  // redirectUri: process.env.CALLBACK_URL,
    clientId: '778acb1e78cf4e0a8510e0cbd0cefe23',
  clientSecret: '649659376143496180b829a2f10bae13',
  redirectUri: 'http://google.com',
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', (req,res) => {
  var html = spotifyApi.createAuthorizeURL(scopes)
  console.log(html.body)
  res.send({"spotifyAuthUrl": html + '"&show_dialog=true"'}) 
  // res.send(html + "&show_dialog=true");
})

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