import Link from "next/link";

import { CookieSettingsButton } from "@/components/layout/CookieSettingsButton";
import { NewsletterForm } from "@/components/content/NewsletterForm";
import { footerNav, legalNav } from "@/content/navigation";
import { site } from "@/lib/site";

/** Deep botanical footer, inset as one rounded block — no rules, only space. */
export function Footer() {
  return (
    <footer className="mt-auto px-2 pb-2 sm:px-3 sm:pb-3">
      <div className="overflow-hidden rounded-media bg-sage-900 text-sage-100">
        <div className="container-page grid gap-14 pt-16 pb-12 lg:grid-cols-[1.1fr_1.6fr] lg:gap-24 lg:pt-24">
          <div>
            <p className="font-logo text-[1.75rem] tracking-[0.32em] text-ivory">BELURAE</p>
            <p className="mt-8 font-serif text-heading-1 font-light text-ivory">
              Beauty, <em>made simpler.</em>
            </p>
            <p className="mt-3 max-w-sm text-sage-200">{site.descriptor}</p>
            <div className="mt-10 max-w-md rounded-[20px] bg-white/6 p-5 [&_.eyebrow]:text-sage-200 [&_p]:text-sage-200">
              <NewsletterForm compact tone="dark" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {footerNav.map((group) => (
              <nav key={group.label} aria-label={group.label}>
                <h2 className="eyebrow text-sage-300">{group.label}</h2>
                <ul className="mt-5 space-y-1">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        prefetch={link.href.startsWith("/account") ? false : undefined}
                        className="inline-flex min-h-10 items-center text-body-sm text-sage-100 transition-colors hover:text-ivory"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="container-page flex flex-col gap-4 pb-10 text-body-sm text-sage-300 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name} ·{" "}
            <a href={`mailto:${site.supportEmail}`} className="text-sage-100 hover:text-ivory">
              {site.supportEmail}
            </a>
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legalNav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-ivory">
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="hover:text-ivory">
              <CookieSettingsButton />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
