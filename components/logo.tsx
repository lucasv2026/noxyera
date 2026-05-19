import Link from "next/link";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Noxyera">
      {/* Carré orange — lettre N blanche (identique Figma) */}
      <span
        className="flex h-8 w-8 items-center justify-center rounded-[10px] text-sm font-black text-white leading-none"
        style={{ background: "#f97316" }}
      >
        N
      </span>
      <span
        className="text-sm font-bold tracking-wide"
        style={{
          fontFamily: "var(--font-body), DM Sans, sans-serif",
          color: dark ? "white" : "#1b4332",
          letterSpacing: "0.08em",
        }}
      >
        NOXYERA
      </span>
    </Link>
  );
}
