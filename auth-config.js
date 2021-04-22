require("dotenv").config();

module.exports = {
  clientId: process.env.UID,
  clientSecret: process.env.SECRET,
  accessTokenUri: 'https://api.intra.42.fr/oauth/token',
  authorizationUri: 'https://api.intra.42.fr/oauth/authorize',
  redirectUri: 'http://www.google.com/'
}
