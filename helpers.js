const {auth} = require("./auth-config");
const path = require("path");

module.exports = {
  fetch: (uri, token) => {
    if (!(token.constructor.name === "ClientOAuth2Token")) {
      throw Error("Invalid Token");
    }
    const headers = auth.headers;

    if (token.tokenType === 'bearer') {
      headers.Authorization = `Bearer ${token.accessToken}`;
    }
    uri = path.join(auth.base, uri);
    return token.client.request(
      "GET",
      uri,
      auth.body,
      headers
    );
  }
}
