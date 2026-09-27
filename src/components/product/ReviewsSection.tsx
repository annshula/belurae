import Image from "next/image";

import type { ProductReviews } from "@/lib/judgeme/reviews";
import { shortDate } from "@/lib/money";

function Stars({ value, label }: { value: number; label: string }) {
  return (
    <span role="img" aria-label={label} className="inline-flex gap-0.5 text-ink">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="size-4" aria-hidden="true">
          <path
            d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.8l-5.1 2.6 1-5.6-4.1-4 5.7-.8z"
            fill={i < Math.round(value) ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      ))}
    </span>
  );
}

/**
 * Verified reviews only (lib/judgeme/reviews.ts). With none, the section says
 * so plainly instead of borrowing reviews from elsewhere.
 */
export function ReviewsSection({ data }: { data: ProductReviews | null }) {
  if (!data) {
    return (
      <div className="well-sage grid gap-6 rounded-media p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
        <div>
        <p className="font-serif text-heading-1 font-light">No reviews yet.</p>
        <p className="mt-4 max-w-xl text-ink-soft">
          Belurae only shows reviews from verified Belurae orders — we don&apos;t import reviews from marketplaces or other
          sellers. After your order arrives you&apos;ll get an email inviting you to share how it went.
        </p>
        </div>
        <p className="glass rounded-card px-6 py-5 text-body-sm md:max-w-64">
          <span className="block font-medium">Verified orders only</span>
          <span className="text-ink-soft">No imported, incentivised or hidden reviews.</span>
        </p>
      </div>
    );
  }

  const { summary, reviews } = data;
  return (
    <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
      <div className="surface h-fit p-8">
        <p className="font-serif text-display tabular-nums">{summary.average.toFixed(1)}</p>
        <Stars value={summary.average} label={`${summary.average.toFixed(1)} out of 5 stars`} />
        <p className="mt-2 text-body-sm text-ink-soft">
          {summary.count} verified review{summary.count === 1 ? "" : "s"}
        </p>
        <dl className="mt-6 space-y-1.5">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const n = summary.distribution[star];
            const pct = summary.count ? Math.round((n / summary.count) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-body-sm">
                <dt className="w-10 shrink-0">{star} star</dt>
                <dd className="flex flex-1 items-center gap-3">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand" aria-hidden="true">
                    <span className="block h-full rounded-full bg-sage-600" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="w-8 text-right tabular-nums text-ink-soft">{n}</span>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
      <ul className="flex flex-col gap-3">
        {reviews.slice(0, 10).map((r) => (
          <li key={r.id} className="surface p-7">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Stars value={r.rating} label={`${r.rating} out of 5 stars`} />
              <span className="text-body-sm font-medium">{r.author}</span>
              <span className="text-body-sm text-ink-soft">· Verified buyer · {shortDate(r.createdAt)}</span>
            </div>
            {r.title && <p className="mt-3 font-medium">{r.title}</p>}
            <p className="mt-2 max-w-[68ch] text-ink-soft">{r.body}</p>
            {r.images.length > 0 && (
              <ul className="mt-4 flex gap-2">
                {r.images.slice(0, 4).map((src) => (
                  <li key={src} className="relative size-20 overflow-hidden rounded-[12px] bg-cream">
                    <Image src={src} alt={`Photo from ${r.author}'s review`} fill sizes="80px" className="object-cover" unoptimized />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
