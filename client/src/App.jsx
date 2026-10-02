import { useCallback, useEffect, useState } from 'react';
import * as api from './api/applications.js';
import SummaryCards from './components/SummaryCards.jsx';
import FilterChips from './components/FilterChips.jsx';
import ApplicationTable from './components/ApplicationTable.jsx';
import ApplicationForm from './components/ApplicationForm.jsx';

export default function App() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('');
  // null = closed, 'new' = add form, or the application being edited
  const [formTarget, setFormTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingIds, setPendingIds] = useState(new Set());

  const refresh = useCallback(async () => {
    try {
      const [rows, s] = await Promise.all([api.listApplications(filter), api.getStats()]);
      setApplications(rows);
      setStats(s);
      setError('');
    } catch (e) {
      setError(`Couldn't reach the server: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { refresh(); }, [refresh]);

  async function handleSave(values) {
    // Empty strings become null, which also lets an edit clear an optional field.
    const body = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v === '' ? null : v]));
    if (formTarget === 'new') await api.createApplication(body);
    else await api.updateApplication(formTarget.id, body);
    setFormTarget(null);
    await refresh();
  }

  async function handleStatusChange(app, status) {
    if (status === app.status) return;
    setPendingIds((p) => new Set(p).add(app.id));
    try {
      await api.updateApplication(app.id, { status });
      await refresh();
    } catch (e) {
      setError(`Couldn't update status: ${e.message}`);
    } finally {
      setPendingIds((p) => { const n = new Set(p); n.delete(app.id); return n; });
    }
  }

  async function handleDelete(app) {
    if (!window.confirm(`Delete ${app.company} – ${app.role_title}?`)) return;
    try {
      await api.deleteApplication(app.id);
      await refresh();
    } catch (e) {
      setError(`Couldn't delete: ${e.message}`);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Internship Tracker</h1>
        {!formTarget && (
          <button type="button" onClick={() => setFormTarget('new')} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            + Add application
          </button>
        )}
      </header>

      <SummaryCards stats={stats} />
      {formTarget && (
        <ApplicationForm
          key={formTarget === 'new' ? 'new' : formTarget.id}
          initial={formTarget === 'new' ? undefined : formTarget}
          onSubmit={handleSave}
          onCancel={() => setFormTarget(null)}
        />
      )}
      <FilterChips value={filter} onChange={setFilter} />

      {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <ApplicationTable applications={applications} onStatusChange={handleStatusChange} onEdit={(a) => { setFormTarget(a); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onDelete={handleDelete} pendingIds={pendingIds} />
      )}
    </main>
  );
}
