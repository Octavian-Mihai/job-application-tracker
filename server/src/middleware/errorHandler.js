/** Consistent error shape: { error: { message, details? } } */
export class HttpError extends Error {
  /** @param {number} status @param {string} message @param {object} [details] */
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.path}` } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // express.json() parse failures
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Malformed JSON body' } });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }
  // Unique violation (e.g. duplicate gmail_thread_id)
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: { message: 'Conflicts with an existing record' } });
  }
  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}
