require('dotenv').config();
const OAuth2 = require("client-oauth2");
const {config} = require("./auth-config");
const to = require('await-to-js').default;
const sqlite3 = require("sqlite3").verbose();
const fs = require('fs');
const prompts = require('prompts');
const {
  Upload,
  Feedback,
  ScaleTeam,
  Scale,
  Flag,
  fetch,
  BadEval,
  Participant
} = require("./helpers");

const questions = [
  {
    type: 'text',
    name: 'period',
    message: 'Specify the period of time :',
    initial: '1 week',
    validate: val => {
      let [, x, period] = val.split(/(\d+)\s+(\S+)/);
      const periods = ["week", "day", "hour", "min", "sec", "ms"];

      console.log()
      if (typeof period !== 'string')
        period = '';
      if (x == null || !periods.includes(period.trim())) {
        return (
          `expected format: "X period"
              X: number;
              period: {${periods}}\ngot: ${x} ${period}`);
      }
      return true;
    }
  },
  {
    type: 'number',
    name: 'moulinette',
    message: 'Enter moulinette left bound :',
    initial: '20',
    format: val => ({left:val})
  },
  {
    type: 'list',
    name: 'correctors_avr',
    message: "Enter corrector boundaries :(left, right)",
    initial: '20, 20',
    separator: ',',
    format: val => ({left: val[0], right: val[1]})
  },
  {
    type: 'number',
    name: 'page_number',
    message: "Max page per request: (100 evaluations/page)",
    initial: '2',
    min: 1
  }
];

const db = new sqlite3.Database(process.env.DB, (err) => {
  void (!err ?? console.log("err"));
});

const oa = new OAuth2(config);

(async function main() {
  const answers = await prompts(questions);
  let [err, token] = await to(oa.credentials.getToken());
  let res;
  if (err)
    return console.log("Connection failed!");
  // init database
  db.serialize(function() {
    const dbSchema = fs.readFileSync(process.env.DB_SCHEMA, "utf-8");
    db.exec(dbSchema);
  });
  const dt_range = `range[filled_at]=${answers.period.ago()},${new Date().toISOString()}`;
  const mark_range = `range[final_mark]=0,125`;
  const page_size = 2;
  let page_range, path;
  let page_number = 0;
  let scale_teams = [];
  let scale_team;
  let feedbacks = [];
  let upload = {};

  while (page_number < answers.page_number) {
    page_number += 1;
    page_range = `page[number]=${page_number}&page[size]=${page_size}`;
    path = `/v2/scale_teams/?${dt_range}&${mark_range}&${page_range}`;

    [err, res] = await to(fetch(path, token));
    scale_teams = JSON.parse(res.body);
    for (let elm of scale_teams) {
      scale_team = await new ScaleTeam(elm).save(db);
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
          await scale_team.saveUsers(db);
        }
      }
      [upload] = await Upload.fetchByScaleTeams(elm.id, token) ?? [];
      await Upload.create(upload, elm.id, db);
    }
    console.log(`page: ${page_number} length: ${scale_teams.length}`);
  }
  db.close();
})()
.catch((err) => console.log(err.message));
