import { STATUSES } from '../models/application.js';

const MAX = { company: 200, role_title: 200, location: 200, job_url: 2000, resume_version: 200, notes: 10000, gmail_thread_id: 200 };
const OPTIONAL_TEXT = ['location', 'resume_version', 'notes', 'gmail_thread_id'];
const DATE_FIELDS = ['date_applied', 'follow_up_date'];

function isIsoDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function isHttpUrl(s) {
  try {
    return ['http:', 'https:'].includes(new URL(s).protocol);
  } catch {
    return false;
  }
}

/**
 * Validates and normalizes a request body.
 * Strings are trimmed; empty optional strings become null.
 * @param {unknown} body
 * @param {{partial: boolean}} opts partial=true (PATCH) only checks fields that are present;
 *   partial=false (POST) also requires company, role_title and status.
 * @returns {{errors: Record<string,string>, value: Record<string, any>}}
 */
export function validateApplication(body, { partial }) {
  const errors = {};
  const value = {};

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: { _body: 'Request body must be a JSON object' }, value };
  }

  for (const f of ['company', 'role_title']) {
    if (body[f] === undefined) {
      if (!partial) errors[f] = 'Required';
      continue;
    }
    const s = typeof body[f] === 'string' ? body[f].trim() : '';
    if (!s) errors[f] = 'Must be a non-empty string';
    else if (s.length > MAX[f]) errors[f] = `Must be at most ${MAX[f]} characters`;
    else value[f] = s;
  }

  if (body.status === undefined) {
    if (!partial) errors.status = 'Required';
  } else if (!STATUSES.includes(body.status)) {
    errors.status = `Must be one of: ${STATUSES.join(', ')}`;
  } else {
    value.status = body.status;
  }

  for (const f of OPTIONAL_TEXT) {
    if (body[f] === undefined) continue;
    if (body[f] === null) value[f] = null;
    else if (typeof body[f] !== 'string') errors[f] = 'Must be a string or null';
    else if (body[f].trim().length > MAX[f]) errors[f] = `Must be at most ${MAX[f]} characters`;
    else value[f] = body[f].trim() || null;
  }

  if (body.job_url !== undefined) {
    if (body.job_url === null || body.job_url === '') value.job_url = null;
    else if (typeof body.job_url !== 'string' || !isHttpUrl(body.job_url.trim()) || body.job_url.length > MAX.job_url)
      errors.job_url = 'Must be a valid http(s) URL';
    else value.job_url = body.job_url.trim();
  }

  for (const f of DATE_FIELDS) {
    if (body[f] === undefined) continue;
    if (body[f] === null || body[f] === '') value[f] = null;
    else if (!isIsoDate(body[f])) errors[f] = 'Must be a valid date in YYYY-MM-DD format';
    else value[f] = body[f];
  }

  return { errors, value };
}

/** Parses a route :id param. @returns {number|null} null if not a positive integer */
export function parseId(raw) {
  return /^\d+$/.test(raw) && Number(raw) > 0 ? Number(raw) : null;
}
