const {auth} = require("./auth-config");
const to = require('await-to-js').default;
const path = require("path");

/*
* @Strings helpers
*
*/
String.prototype['time_to'] = function (dst) {
  let [, x, src] = this.split(/(\d+)/);

  if (!x || !src)
    return ;
  src = src.trim();

  const locales = {
    "week": [1, 7, "day"],
    "day": [2, 24, "hour", 7, "week"],
    "hour": [3, 60, "min", 24, 'day'],
    "min": [4, 60, "sec", 60, 'hour'],
    "sec": [5, 1000, "ms", 60, 'min'],
    "ms": [6, 1,, 1000, 'sec']
  }
    
  let result = x;
  let tmp = src;

  if (!locales[src] || !locales[dst])
    return ; // maybe throw an error
  if (locales[src][0] > locales[dst][0]) {
      while (tmp && tmp != dst) {
        result /= locales[tmp][3];
          tmp = locales[tmp][4]
      }
  } else if (locales[src][0] < locales[dst][0]) {
      while (tmp && tmp != dst) {
        result *= locales[tmp][1];
          tmp = locales[tmp][2]
      }
  }
  return (result);
}

String.prototype['ago'] = function() {
  let elaptime = this.time_to("ms");
  let elapdate;

  if (elaptime) {
    elapdate = new Date(Date.now() - elaptime);
  }
  return elapdate;
}

String.prototype['elaptime_to'] = function(fin) {
  const debut = Date.parse(this);
  fin = Date.parse(fin);

  const result = (fin - debut);
  if (isNaN(result)) {
    return (null);
  }
  return (Math.floor(result / 1000));
}

/*
* @Request helpers
*
*/
const fetch = (uri, token) => {
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
};
  
const fetchBy = async (path, token) => {
  const [err, res] = await to(fetch(path, token));

  if (err) {
    return Promise.reject(err);
  }

  return JSON.parse(res.body);
};

/*
* @Data helpers
*
*/

function Scale(props) {
  this.scale_id = props.scale_id;
  this.duration = props.scale.duration;
  this.correction_number = props.scale.correction_number;
}

Scale.prototype.save = async function (db) {
  db.run(`INSERT INTO scales VALUES (?, ?, ?)`, [
      this.scale_id,
      this.duration,
      this.correction_number
  ], (err) => {});
  return (this);
}

function ScaleTeam(props) {
  this.id = props.id;
  this.scale_id = props.scale_id;
  this.team_id = props.team.id;
  this.final_mark = props.final_mark;
  this.comment = props.comment;
  this.created_at = props.created_at;
  this.updated_at = props.updated_at;
  this.duration = props.created_at.elaptime_to(props.begin_at);
  this.corrector = props.corrector.login;
}

ScaleTeam.prototype.save = async function (db) {
  db.run(`INSERT INTO scale_teams
    VALUES(${'?,'.repeat(9).slice(0, -1)})`, [
    this.id,
    this.scale_id,
    this.team_id,
    this.final_mark,
    this.comment,
    this.duration,
    this.corrector,
    this.created_at,
    this.updated_at
    ], (err) => {}
  );
  return (this);
}

function Flag(props) {
  this.scale_team_id = props.id;
  this.name = props.name;
  this.positive = !!props.positive;
}

Flag.prototype.save = async function(db) {
  db.run(`INSERT INTO flags (scale_team_id, name, positive)
    VALUES(?, ?, ?)`, [
      this.scale_team_id,
      this.name,
      this.positive
    ], (err) => {}
  );
  return (this);
}

function Feedback(scale_team_id, feedback) {
  this.id = feedback.id;
  this.scale_team_id = scale_team_id;
  this.rating = feedback.rating;
  this.comment = feedback.coment;
  this.details = feedback.feedback_details;
}

Feedback.fetchByScaleTeams = async function(scale_team_id, token) {
  const path = `/v2/scale_teams/${scale_team_id}/feedbacks`;
  const [err, feedbacks] = await to(fetchBy(path, token));

  return feedbacks ?? [];
}

Feedback.create = async function(feedback, scale_team_id, db) {
  const details = feedback.feedback_details.map((v) => v.rate);

  db.run(`INSERT INTO feedbacks
    VALUES(${'?,'.repeat(8).slice(0, -1)})`, [
      feedback.id,
      scale_team_id,
      feedback.rating,
      feedback.comment,
      ...details
  ], (err) => {});
  return new this(scale_team_id, feedback);
}

function Upload(upload) {
  this.project_upload_id = upload.id;
  this.final_mark = upload.final_mark;
  this.comment = upload.comment;
}

Upload.fetchByScaleTeams = async function(scale_team_id, token) {
  const path = `/v2/teams/${scale_team_id}/teams_uploads`;
  const [err, upload] = await to(fetchBy(path, token));

  return upload ?? [];
}

Upload.create = async function(upload, scale_team_id, db) {
  console.log(upload);
  if (!upload)
    return ;
  db.run(`INSERT INTO project_uploads
    VALUES(?, ?, ?, ?)`, [
      upload.id,
      scale_team_id,
      upload.final_mark,
      upload.comment,
      ], (err) => {}
  );
  return new this(scale_team_id, upload);
}

module.exports = {
  Upload,
  Feedback,
  ScaleTeam,
  Scale,
  Flag
};
