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
  Flag,
  fetch,
  BadEval
} = require("./helpers");

const db = new sqlite3.Database(process.env.DB, (err) => {
  void (!err ?? console.log("err"));
});

const oa = new OAuth2(config);

(async function main() {
  let [err, token] = await to(oa.credentials.getToken());
  let res;
  if (err)
    return console.log("Connection failed!");
  // init database
  db.serialize(function() {
    const dbSchema = fs.readFileSync(process.env.DB_SCHEMA, "utf-8");
    db.exec(dbSchema);
  });
  const dt_range = `range[filled_at]=${'20 week'.ago()},${new Date().toISOString()}`;
  const mark_range = `range[final_mark]=0,300`;
  const page_size = 100;
  let page_range, path;
  let page_number = 1;
  let scale_teams = [];
  let feedbacks = [];
  let upload = {};

  while (page_number < 2) {
    page_range = `page[number]=${page_number}&page[size]=${page_size}`;
    path = `/v2/scale_teams/?${dt_range}&${mark_range}&${page_range}`;

    [err, res] = await to(fetch(path, token));
    // fs.writeFileSync("./db/usher.json", res.body);
    scale_teams = JSON.parse(res.body);
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
        if (BadEval.byFeedback(feedback)) {
          await BadEval.create({
            reason: 'feedback',
            details: 'rating',
            created_at: feedback.created_at,
          }, elm.id, db);
        }
      }
      [upload] = await Upload.fetchByScaleTeams(elm.id, token) ?? [];
      await Upload.create(upload, elm.id, db);
    }
    page_number += 1;
    console.log(scale_teams.length);
  }
  db.close();
})();
