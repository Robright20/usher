require("dotenv").config();

module.exports = {
  config: {
    clientId: process.env.UID,
    clientSecret: process.env.SECRET,
    accessTokenUri: 'https://api.intra.42.fr/oauth/token',
    authorizationUri: 'https://api.intra.42.fr/oauth/authorize',
    redirectUri: 'http://www.google.com/'
  },
  auth: {
    body: `grantType=client_credentials&client_id=${process.env.UID}&` +
      `client_secret=${process.env.SECRET}`,
    headers: {"content-type": 'application/x-www-form-urlencoded'},
    base: "https://api.intra.42.fr"
  }
}
