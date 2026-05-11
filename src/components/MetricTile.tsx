type MetricTileProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "teal" | "coral" | "amber" | "ink";
};

const toneClasses = {
  teal: "border-teal-700/30 bg-teal-50 text-teal-900",
  coral: "border-coral/30 bg-orange-50 text-orange-950",
  amber: "border-amber/30 bg-amber-50 text-amber-950",
  ink: "border-stone-300 bg-white text-stone-950",
};

export function MetricTile({
  label,
  value,
  detail,
  tone = "ink",
}: MetricTileProps) {
  return (
    <div className={`rounded-lg border p-3 sm:p-4 ${toneClasses[tone]}`}>
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-current/65 sm:text-xs">
        {label}
      </p>
      {/* The value used to be locked at text-3xl, which crammed against the
       * tile edge on a 360px portrait phone after the 4-up grid collapsed
       * to 2-up. Step it down on small viewports. */}
      <p className="mt-2 text-2xl font-semibold leading-none sm:text-3xl">
        {value}
      </p>
      <p className="mt-2 line-clamp-3 text-[0.85rem] leading-5 text-current/70 sm:text-sm">
        {detail}
      </p>
    </div>
  );
}
