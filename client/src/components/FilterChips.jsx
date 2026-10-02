import { FILTER_CHIPS } from '../constants/status.js';

export default function FilterChips({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
      {FILTER_CHIPS.map((chip) => {
        const active = chip.value === value;
        return (
          <button
            key={chip.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(chip.value)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              active ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
