CREATE TABLE applications (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  company          TEXT NOT NULL,
  role_title       TEXT NOT NULL,
  location         TEXT,
  job_url          TEXT,
  status           TEXT NOT NULL DEFAULT 'applied'
                   CHECK (status IN ('applied','online_assessment','interview',
                                     'offer','rejected','withdrawn')),
  date_applied     TEXT,            -- ISO date 'YYYY-MM-DD'
  resume_version   TEXT,            -- free text, e.g. 'v2 backend'
  notes            TEXT,
  follow_up_date   TEXT,            -- ISO date, nullable (reminders, later)
  gmail_thread_id  TEXT,            -- nullable, unused until Gmail sync
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX idx_applications_status ON applications(status);

CREATE INDEX idx_applications_follow_up ON applications(follow_up_date)
  WHERE follow_up_date IS NOT NULL;

CREATE UNIQUE INDEX idx_applications_gmail_thread ON applications(gmail_thread_id)
  WHERE gmail_thread_id IS NOT NULL;
