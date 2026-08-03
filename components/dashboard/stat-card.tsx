interface Props {
  title: string;
  value: string | number;
  accent?: string;
}

export default function StatCard({
  title,
  value,
  accent = "text-white",
}: Props) {
  return (
    <div className="min-w-44 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <p className="text-sm text-zinc-500">
        {title}
      </p>

      <p className={`mt-2 text-3xl font-bold ${accent}`}>
        {value}
      </p>
    </div>
  );
}