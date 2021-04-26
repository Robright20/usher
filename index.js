require('dotenv').config();
const OAuth2 = require("client-oauth2");
const {config} = require("./auth-config");
const to = require('await-to-js').default;
const sqlite3 = require("sqlite3").verbose();
const fs = require('fs');
const {
  Upload,
  Feedback,
  ScaleTeam,
  Scale,
  Flag
} = require("./helpers");

const db = new sqlite3.Database(process.env.DB, (err) => {
  void (!err ?? console.log("err"));
});

const oa = new OAuth2(config);

(async function main() {
  let [err, token] = await to(oa.credentials.getToken());
  if (err)
    return console.log("Connection failed!");
  // init database
  db.serialize(function() {
    const dbSchema = fs.readFileSync(process.env.DB_SCHEMA, "utf-8");
    db.exec(dbSchema);
  });

// const [err, res] = await to(fetch("/v2/scale_teams/page?number=1&pa", token))
  // console.log("1 day".ago());
  const scale_teams = JSON.parse(fs.readFileSync("./db/usher.json", "utf-8"));
  // // const scale_teams = JSON.parse(res.body);
  // // fs.writeFileSync("./db/usher.json", res.body);
  let feedbacks = [];
  let upload = {};
  // let res;
  // // let project_upload;
  for (let elm of scale_teams) {
    new ScaleTeam(elm).save(db);
    new Scale(elm).save(db);
    elm.scale.flags
      .filter(flag => flag.positive === true)
      .forEach(flag => new Flag({
        ...flag, id: elm.id
        }).save(db)
      );
    feedbacks = await Feedback.fetchByScaleTeams(elm.id, token);
    for (let feedback of feedbacks) {
      await Feedback.create(feedback, elm.id, db);
    }
    [upload] = await Upload.fetchByScaleTeams(elm.id, token);
    await Upload.create(upload, elm.id, db);
  }
  db.close();
  // fetch("/v2/users/fokrober", token)
  // 	.then((res) => console.log(res));
})();
