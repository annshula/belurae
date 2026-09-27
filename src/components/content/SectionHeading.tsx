import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
  align = "left",
  className,
  as: Tag = "h2",
  size = "display",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
  size?: "display" | "heading";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className={cn("eyebrow eyebrow-dot mb-5", align === "center" && "justify-center")}>{eyebrow}</p>}
      <Tag id={id} className={cn("font-serif font-light", size === "display" ? "text-display" : "text-heading-1")}>
        {title}
      </Tag>
      {intro && <div className="mt-6 text-body-lg text-ink-soft">{intro}</div>}
    </div>
  );
}
