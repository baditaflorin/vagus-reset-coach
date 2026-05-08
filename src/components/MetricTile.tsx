type MetricTileProps = {
  label: string
  value: string
  detail: string
  tone?: 'teal' | 'coral' | 'amber' | 'ink'
}

const toneClasses = {
  teal: 'border-teal-700/30 bg-teal-50 text-teal-900',
  coral: 'border-coral/30 bg-orange-50 text-orange-950',
  amber: 'border-amber/30 bg-amber-50 text-amber-950',
  ink: 'border-stone-300 bg-white text-stone-950',
}

export function MetricTile({ label, value, detail, tone = 'ink' }: MetricTileProps) {
  return (
    <div className={`rounded-lg border p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-current/65">{label}</p>
      <p className="mt-2 text-3xl font-semibold leading-none">{value}</p>
      <p className="mt-2 text-sm leading-5 text-current/70">{detail}</p>
    </div>
  )
}
