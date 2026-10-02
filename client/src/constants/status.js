/** Single source of truth for status labels and badge colors. Keep in sync with the server's STATUSES. */
export const STATUSES = [
  { value: 'applied', label: 'Applied', badge: 'bg-slate-100 text-slate-700 ring-slate-300' },
  { value: 'online_assessment', label: 'Online assessment', badge: 'bg-amber-100 text-amber-800 ring-amber-300' },
  { value: 'interview', label: 'Interview', badge: 'bg-blue-100 text-blue-800 ring-blue-300' },
  { value: 'offer', label: 'Offer', badge: 'bg-green-100 text-green-800 ring-green-300' },
  { value: 'rejected', label: 'Rejected', badge: 'bg-red-100 text-red-800 ring-red-300' },
  { value: 'withdrawn', label: 'Withdrawn', badge: 'bg-zinc-100 text-zinc-600 ring-zinc-300' },
];

export const STATUS_BY_VALUE = Object.fromEntries(STATUSES.map((s) => [s.value, s]));

/** Filter chips: Withdrawn is intentionally omitted (those rows still appear under All). */
export const FILTER_CHIPS = [{ value: '', label: 'All' }, ...STATUSES.filter((s) => s.value !== 'withdrawn')];
