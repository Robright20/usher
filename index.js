const OAuth2 = require("client-oauth2");
const {config, auth} = require("./auth-config");
const path = require("path");

const client = new OAuth2(config);
const fetch = (req) => {
  const method = req.method ?? "GET";
  const uri = path.join(auth.base, req.uri);
  const body = auth + "&" + req.body;
  const headers = auth.headers;

  if (req.token?.tokenType === 'bearer') {
    headers.Authorization = `Bearer ${req.token.accessToken}`;
  }
  return client.request(
    method,
    uri,
    body,
    headers
  );
}

async function main() {
  const token = await client.credentials.getToken();
  // console.log(token);
  // console.log(client.request.toString());
  fetch({uri: "/v2/users/fokrober", token}).then((res) => console.log(res))
}

main().then(() => console.log("done!"))