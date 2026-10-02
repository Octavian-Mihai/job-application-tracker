import { STATUSES, STATUS_BY_VALUE } from '../constants/status.js';

/** A select styled as a badge, for inline status changes. */
export default function StatusSelect({ value, onChange, disabled }) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Change status"
      className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset focus:outline-2 focus:outline-indigo-500 disabled:opacity-50 ${STATUS_BY_VALUE[value]?.badge}`}
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}
