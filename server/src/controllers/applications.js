import * as Applications from '../models/application.js';
import { validateApplication, parseId } from '../validation/application.js';
import { HttpError } from '../middleware/errorHandler.js';

function idParam(req) {
  const id = parseId(req.params.id);
  if (id === null) throw new HttpError(400, 'Invalid id: must be a positive integer');
  return id;
}

function validated(body, partial) {
  const { errors, value } = validateApplication(body, { partial });
  if (Object.keys(errors).length) throw new HttpError(422, 'Validation failed', errors);
  return value;
}

export function list(req, res) {
  const { status } = req.query;
  if (status !== undefined && !Applications.STATUSES.includes(status)) {
    throw new HttpError(400, `Invalid status filter. Must be one of: ${Applications.STATUSES.join(', ')}`);
  }
  res.json(Applications.list({ status }));
}

export function stats(req, res) {
  res.json(Applications.stats());
}

export function get(req, res) {
  const row = Applications.get(idParam(req));
  if (!row) throw new HttpError(404, 'Application not found');
  res.json(row);
}

export function create(req, res) {
  const row = Applications.create(validated(req.body, false));
  res.status(201).location(`/api/applications/${row.id}`).json(row);
}

export function update(req, res) {
  const id = idParam(req);
  const changes = validated(req.body, true);
  if (Object.keys(changes).length === 0) throw new HttpError(400, 'No updatable fields provided');
  const row = Applications.update(id, changes);
  if (!row) throw new HttpError(404, 'Application not found');
  res.json(row);
}

export function remove(req, res) {
  if (!Applications.remove(idParam(req))) throw new HttpError(404, 'Application not found');
  res.status(204).end();
}
