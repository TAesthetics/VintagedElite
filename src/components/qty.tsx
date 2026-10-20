import { Minus, Plus } from "lucide-react";

export function Qty({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="inline-flex items-center border border-line">
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center"
        aria-label="Weniger"
        onClick={() => onChange(value - 1)}
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-8 text-center text-sm">{value}</span>
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center"
        aria-label="Mehr"
        onClick={() => onChange(Math.min(8, value + 1))}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
