import { useState } from 'react';
import { STATUSES } from '../constants/status.js';
import { ApiError } from '../api/applications.js';

const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
const empty = () => ({
  company: '', role_title: '', status: 'applied', location: '', job_url: '',
  date_applied: today(), resume_version: '', follow_up_date: '', notes: '',
});

function validate(v) {
  const e = {};
  if (!v.company.trim()) e.company = 'Company is required';
  if (!v.role_title.trim()) e.role_title = 'Role is required';
  if (!v.status) e.status = 'Status is required';
  if (v.job_url.trim() && !/^https?:\/\//i.test(v.job_url.trim())) e.job_url = 'Must start with http:// or https://';
  return e;
}

function Field({ label, error, required, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">
        {label}{required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

const input = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-2 focus:outline-indigo-500';

/** Form values from an existing application (nulls become empty strings for inputs). */
const fromApplication = (a) =>
  Object.fromEntries(Object.keys(empty()).map((k) => [k, a[k] ?? '']));

/** Pass `initial` (an application) to edit it; omit it to create a new one. */
export default function ApplicationForm({ initial, onSubmit, onCancel }) {
  const editing = Boolean(initial);
  const [values, setValues] = useState(() => (initial ? fromApplication(initial) : empty()));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    setFormError('');
    try {
      await onSubmit(values);
    } catch (err) {
      if (err instanceof ApiError && err.details) setErrors(err.details);
      else setFormError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{editing ? `Edit ${initial.company}` : 'Add application'}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company" required error={errors.company}>
          <input className={input} value={values.company} onChange={set('company')} autoFocus />
        </Field>
        <Field label="Role" required error={errors.role_title}>
          <input className={input} value={values.role_title} onChange={set('role_title')} />
        </Field>
        <Field label="Status" required error={errors.status}>
          <select className={input} value={values.status} onChange={set('status')}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Date applied" error={errors.date_applied}>
          <input type="date" className={input} value={values.date_applied} onChange={set('date_applied')} />
        </Field>
        <Field label="Location" error={errors.location}>
          <input className={input} value={values.location} onChange={set('location')} />
        </Field>
        <Field label="Job URL" error={errors.job_url}>
          <input className={input} value={values.job_url} onChange={set('job_url')} placeholder="https://" />
        </Field>
        <Field label="Resume version" error={errors.resume_version}>
          <input className={input} value={values.resume_version} onChange={set('resume_version')} placeholder="e.g. v2 backend" />
        </Field>
        <Field label="Follow-up date" error={errors.follow_up_date}>
          <input type="date" className={input} value={values.follow_up_date} onChange={set('follow_up_date')} />
        </Field>
      </div>
      <Field label="Notes" error={errors.notes}>
        <textarea rows={3} className={input} value={values.notes} onChange={set('notes')} />
      </Field>
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-md px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
        <button type="submit" disabled={submitting} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {submitting ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
