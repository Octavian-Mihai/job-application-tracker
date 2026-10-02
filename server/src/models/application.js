import { db } from '../db/connection.js';

/**
 * @typedef {'applied'|'online_assessment'|'interview'|'offer'|'rejected'|'withdrawn'} ApplicationStatus
 */

/**
 * One row of the `applications` table.
 * @typedef {Object} Application
 * @property {number} id
 * @property {string} company
 * @property {string} role_title
 * @property {string|null} location
 * @property {string|null} job_url
 * @property {ApplicationStatus} status
 * @property {string|null} date_applied    ISO date, 'YYYY-MM-DD'
 * @property {string|null} resume_version  Free text, e.g. 'v2 backend'
 * @property {string|null} notes
 * @property {string|null} follow_up_date  ISO date; used by reminders later
 * @property {string|null} gmail_thread_id Unused until Gmail sync; unique when set
 * @property {string} created_at           ISO timestamp (UTC)
 * @property {string} updated_at           ISO timestamp (UTC)
 */

/**
 * Fields a client may set. id and the timestamps are managed by the server.
 * @typedef {Omit<Application, 'id'|'created_at'|'updated_at'>} ApplicationInput
 */

export const STATUSES = Object.freeze([
  'applied',
  'online_assessment',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
]);

/** Statuses that count as the company having responded (withdrawn is your own choice). */
export const RESPONDED_STATUSES = Object.freeze([
  'online_assessment',
  'interview',
  'offer',
  'rejected',
]);

export const WRITABLE_FIELDS = Object.freeze([
  'company',
  'role_title',
  'location',
  'job_url',
  'status',
  'date_applied',
  'resume_version',
  'notes',
  'follow_up_date',
  'gmail_thread_id',
]);

/**
 * @param {{status?: ApplicationStatus}} [filters]
 * @returns {Application[]} newest applications first
 */
export function list({ status } = {}) {
  const order = 'ORDER BY date_applied IS NULL, date_applied DESC, id DESC';
  return status
    ? db.prepare(`SELECT * FROM applications WHERE status = ? ${order}`).all(status)
    : db.prepare(`SELECT * FROM applications ${order}`).all();
}

/** @param {number} id @returns {Application|undefined} */
export function get(id) {
  return db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
}

/** @param {Partial<ApplicationInput>} input @returns {Application} */
export function create(input) {
  const cols = WRITABLE_FIELDS.filter((f) => input[f] !== undefined);
  const info = db
    .prepare(
      `INSERT INTO applications (${cols.join(', ')}) VALUES (${cols.map((c) => '@' + c).join(', ')})`,
    )
    .run(input);
  return get(Number(info.lastInsertRowid));
}

/**
 * Partial update: only the keys present in `changes` are written.
 * @param {number} id @param {Partial<ApplicationInput>} changes
 * @returns {Application|undefined} undefined if the id doesn't exist
 */
export function update(id, changes) {
  const cols = WRITABLE_FIELDS.filter((f) => changes[f] !== undefined);
  if (cols.length === 0) return get(id);
  const sets = cols.map((c) => `${c} = @${c}`).join(', ');
  const info = db
    .prepare(
      `UPDATE applications SET ${sets}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = @id`,
    )
    .run({ ...changes, id });
  return info.changes ? get(id) : undefined;
}

/** @param {number} id @returns {boolean} true if a row was deleted */
export function remove(id) {
  return db.prepare('DELETE FROM applications WHERE id = ?').run(id).changes > 0;
}

/**
 * Dashboard numbers, always over ALL applications (not a filtered list).
 * @returns {{total:number, interviewing:number, responded:number, response_rate:number}}
 *   response_rate is 0..1
 */
export function stats() {
  const marks = RESPONDED_STATUSES.map(() => '?').join(',');
  const row = db
    .prepare(
      `SELECT COUNT(*) AS total,
              COALESCE(SUM(status = 'interview'), 0) AS interviewing,
              COALESCE(SUM(status IN (${marks})), 0) AS responded
       FROM applications`,
    )
    .get(...RESPONDED_STATUSES);
  return {
    ...row,
    response_rate: row.total ? row.responded / row.total : 0,
  };
}
