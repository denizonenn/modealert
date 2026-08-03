interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Card({
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-white/20 ${className}`}
    >
      {children}
    </div>
  );
}