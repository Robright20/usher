const OAuth2 = require("client-oauth2");
const {config} = require("./auth-config");
const {fetch} = require("./helpers");

const client = new OAuth2(config);
async function main() {
  const token = await client.credentials.getToken();

  fetch("/v2/users/fokrober", token)
  	.then((res) => console.log(res));
}

main().then(() => console.log("done!"))
