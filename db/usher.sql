CREATE TABLE IF NOT EXISTS scales (
    scale_id INTEGER PRIMARY KEY NOT NULL,
    duration INTEGER,
    correction_number INTEGER
);

CREATE TABLE IF NOT EXISTS scale_teams (
    scale_team_id INTEGER PRIMARY KEY NOT NULL,
    scale_id INTEGER  NOT NULL,
    team_id INTEGER  NOT NULL,
    final_mark INTEGER,
    comment TEXT,
    duration INTEGER,
    corrector NVARCHAR(20),
    created_at TEXT,
    updated_at TEXT,
    FOREIGN KEY (scale_id) REFERENCES scales (scale_id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS project_uploads (
    project_upload_id INTEGER PRIMARY KEY NOT NULL,
    scale_team_id INTEGER  NOT NULL,
    final_mark INTEGER,
    comment TEXT
);

CREATE TABLE IF NOT EXISTS flags (
    flag_id INTEGER PRIMARY KEY NOT NULL,
    scale_team_id INTEGER  NOT NULL,
    name TEXT,
    positive INTEGER,
    FOREIGN KEY (scale_team_id) REFERENCES scale_teams (scale_team_id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS feedbacks (
    feedback_id INTEGER PRIMARY KEY NOT NULL,
    scale_team_id INTEGER  NOT NULL,
    rating INTEGER,
    comment TEXT,
    nice INTEGER,
    rigor INTEGER,
    interest INTEGER,
    pontual INTEGER,
    FOREIGN KEY (scale_team_id) REFERENCES scale_teams (scale_team_id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);
