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
    "month": [7, 4, "week"],
    "week": [6, 7, "day", 4, "month"],
    "day": [5, 24, "hour", 7, "week"],
    "hour": [4, 60, "min", 24, 'day'],
    "min": [3, 60, "sec", 60, 'hour'],
    "sec": [2, 1000, "ms", 60, 'min'],
    "ms": [1, 1,, 1000, 'sec']
  }
    
  let result = x;
  let tmp = src;

  if (!locales[src] || !locales[dst])
    return ; // maybe throw an error
  if (locales[src][0] < locales[dst][0]) {
      while (tmp && tmp != dst) {
        result /= locales[tmp][3];
          tmp = locales[tmp][4]
      }
  } else if (locales[src][0] > locales[dst][0]) {
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
  return elapdate.toISOString();
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

const handleError = (err) => {
  if (!err || err.code === 'SQLITE_CONSTRAINT')
    return ;
  console.log(err.message);
  // console.log("Constructor: ", err.constructor);
  // console.log("message: ", err.message);
  // console.log("code: ", err.code);
  // console.log("name: ", err.name);
}

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
  ], handleError);
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
    ], handleError
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
    ], handleError
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
  ], handleError);
  return new this(scale_team_id, feedback);
}

function Upload(upload) {
  this.project_upload_id = upload.id;
  this.final_mark = upload.final_mark;
  this.comment = upload.comment;
}

Upload.fetchByScaleTeams = async function(scale_team_id, token) {
  const path = `/v2/teams/${scale_team_id}/teams_uploads`;
  let [err, upload] = await to(fetchBy(path, token));

  if (err || !(upload instanceof Array)) {
    //console.log("Failed to fetch teams uploads!");
    upload = [];
  }
  return upload;
}

Upload.create = async function(upload, scale_team_id, db) {
  if (!upload)
    return ;
  db.run(`INSERT INTO project_uploads
    VALUES(?, ?, ?, ?)`, [
      upload.id,
      scale_team_id,
      upload.final_mark,
      upload.comment,
      ], handleError
  );
  return new this(scale_team_id, upload);
}

function BadEval(evaluation, scale_team_id) {
  this.scale_team_id = scale_team_id;
  this.reason = evaluation.reason;
  this.details = evaluation.details;
  this.created_at = evaluation.created_at;
}

BadEval.create = async function(evaluation, scale_team_id, db) {
  if (!evaluation)
    return ;
  db.run(`INSERT INTO bad_evaluations
    (scale_team_id, reason, details, created_at) VALUES(?, ?, ?, ?)`, [
      scale_team_id,
      evaluation.reason,
      evaluation.details,
      evaluation.created_at
      ], handleError
  );
  return new this(evaluation, scale_team_id);
}

BadEval.byFeedback = (feedback) => feedback.rating <= 3;

function Participant(props) {
  this.scale_team_id = props.scale_team_id;
  this.login = props.login;
  this.position = props.position;
}

Participant.prototype.save = async function(db) {
  db.run(`INSERT INTO participants (scale_team_id, login, position)
    VALUES(?, ?, ?)`, [
      this.scale_team_id,
      this.login,
      this.position,
      ], handleError
  );
  return new this(participant, scale_team_id);
}

Participant.create = async function(participant, db) {
  if (!participant)
    return ;
  db.run(`INSERT INTO participants (scale_team_id, login, position)
    VALUES(?, ?, ?)`, [
      participant.scale_team_id,
      participant.login,
      participant.position,
      ], handleError
  );
  return new this(participant, scale_team_id);
}

ScaleTeam.prototype.saveUsers = async function(db) {
  const {corrector, correcteds} = this;
  await new Participant({
    login: corrector.login,
    scale_team_id: this.id,
    position: 'corrector'
  }).save(db);

  for (user of correcteds) {
    await new Participant({
      login: user.login,
      scale_team_id: this.id,
      position: 'corrected'
    }).save(db);
  }
  console.log(`begin_at: ${this.begin_at} corrector: ${corrector.login} correcteds:${correcteds.map(v => v.login)}`);
}

module.exports = {
  Upload,
  Feedback,
  ScaleTeam,
  Scale,
  Flag,
  fetch,
  BadEval,
  Participant
};
