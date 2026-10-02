import StatusSelect from './StatusSelect.jsx';

function formatDate(iso) {
  if (!iso) return '–';
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ApplicationTable({ applications, onStatusChange, onDelete, pendingIds }) {
  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        No applications here yet.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Company / Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Resume</th>
            <th className="px-4 py-3">Applied</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {applications.map((a) => (
            <tr key={a.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="font-medium">
                  {a.job_url ? (
                    <a href={a.job_url} target="_blank" rel="noreferrer" className="hover:underline">{a.company}</a>
                  ) : (
                    a.company
                  )}
                </div>
                <div className="text-slate-500">{a.role_title}</div>
              </td>
              <td className="px-4 py-3">
                <StatusSelect value={a.status} disabled={pendingIds.has(a.id)} onChange={(s) => onStatusChange(a, s)} />
              </td>
              <td className="px-4 py-3 text-slate-600">{a.resume_version || '–'}</td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDate(a.date_applied)}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onDelete(a)}
                  className="text-xs text-slate-400 hover:text-red-600"
                  aria-label={`Delete ${a.company} application`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
