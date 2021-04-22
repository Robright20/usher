const OAuth2 = require("client-oauth2");
const opts = require("./auth-config");

const client = new OAuth2(opts);

async function run() {
  const token = await client.credentials.getToken();

  console.log(client.request.toString());
}

run().then(() => console.log("done!"))