import { cn } from "@/lib/utils";

export function PageIntro({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <header className={cn("animate-fade-up", className)}>
      {eyebrow ? <p className="cr-eyebrow">{eyebrow}</p> : null}
      <h1
        className={cn(
          "font-display text-[1.85rem] leading-[1.08] font-semibold text-ink md:text-[2.05rem]",
          eyebrow ? "mt-2" : "mt-0"
        )}
      >
        {title}
      </h1>
      <p className="cr-lede mt-2 max-w-[36ch]">{description}</p>
    </header>
  );
}

export function SpecList({
  items,
  className,
}: {
  items: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <dl className={cn("cr-spec", className)}>
      {items.map((item) => (
        <div key={item.label} className="cr-spec-row">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      {eyebrow && <p className="cr-eyebrow mb-1.5">{eyebrow}</p>}
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      {description && <p className="cr-lede mt-1.5">{description}</p>}
    </div>
  );
}
