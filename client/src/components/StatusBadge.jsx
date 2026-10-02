import { STATUS_BY_VALUE } from '../constants/status.js';

export default function StatusBadge({ status }) {
  const s = STATUS_BY_VALUE[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s?.badge}`}>
      {s?.label ?? status}
    </span>
  );
}
