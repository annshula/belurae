import Link from "next/link";
import type { ReactNode } from "react";

import { products } from "@/content/products";
import { site } from "@/lib/site";

/**
 * Brand and customer-care pages (/pages/[slug]). Legal policies are NOT here —
 * they come verbatim from Shopify (lib/shopify/policies.ts).
 */

export type ContentPage = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  schemaType: "AboutPage" | "ContactPage" | "WebPage" | "FAQPage";
  intro: string;
  body: ReactNode;
  faqs?: { q: string; a: string }[];
};

const mousse = products[0];

export const contentPages: ContentPage[] = [
  {
    slug: "about",
    title: "About Belurae",
    eyebrow: "Our story",
    description:
      "Belurae is a beauty and wellness store for simpler everyday body-care routines, starting with at-home hair removal — sold with key ingredients, clear directions and honest limitations.",
    schemaType: "AboutPage",
    intro:
      "Everyday personal care is often sold with more noise than information: big promises, tiny print, and very little about how to use a product well. Belurae is built to do the opposite.",
    body: (
      <>
        <h2>What Belurae is</h2>
        <p>
          Belurae is a beauty and wellness store built around simpler everyday
          body-care routines. We begin with at-home hair removal — a{" "}
          {mousse?.format.toLowerCase()} you spray on, leave for 5–10 minutes
          and wipe away — and will grow into body care and aftercare, one
          considered product at a time.
        </p>
        <h2>Our mission</h2>
        <p>
          To make everyday care easier to understand and easier to do. That
          means publishing the key ingredients of everything we sell, writing
          directions you can follow without a magnifying glass, and saying
          plainly where a product shouldn&apos;t be used.
        </p>
        <h2>Who makes our products</h2>
        <p>
          Belurae is the brand. The manufacturer behind each formula is named on
          the product page — we don&apos;t present another company&apos;s
          product as our own invention. We choose what we sell, publish the key
          ingredients and directions you read here, and look after you from
          order to delivery.
        </p>
        <h2>How orders work</h2>
        <p>
          Checkout is handled securely by Shopify. Orders ship with tracking and
          usually arrive in {site.delivery.minDays}–{site.delivery.maxDays}{" "}
          days. Questions at any point:{" "}
          <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
        </p>
        <p>
          <Link href="/pages/standards">Read our standards</Link> ·{" "}
          <Link href="/pages/contact">Contact us</Link>
        </p>
      </>
    ),
  },
  {
    slug: "philosophy",
    title: "Our philosophy",
    eyebrow: "Why Belurae",
    description:
      "Beauty, made simpler: why Belurae believes clarity — not hype — is what makes personal care feel premium.",
    schemaType: "WebPage",
    intro:
      "Beauty, made simpler. Not because care should be minimal, but because it should be understandable.",
    body: (
      <>
        <h2>Clarity is the luxury</h2>
        <p>
          Premium, for us, isn&apos;t a heavier jar or a louder claim. It&apos;s
          knowing exactly what you&apos;re buying, how to use it, how long to
          leave it on and what to do if something doesn&apos;t feel right.
        </p>
        <h2>Four things we hold to</h2>
        <ul>
          <li>
            <strong>Simple.</strong> Fewer steps, fewer words, one clear next
            action.
          </li>
          <li>
            <strong>Clear.</strong> Key ingredients, exact timings and
            limitations beside the price — not hidden in an accordion no one
            opens.
          </li>
          <li>
            <strong>Considered.</strong> Products that work together as a
            routine, with guidance for before and after.
          </li>
          <li>
            <strong>Warm.</strong> Body hair isn&apos;t a problem to be fixed.
            Removing it is a choice, and we&apos;ll help you do it comfortably
            if you want to.
          </li>
        </ul>
        <h2>What you won&apos;t find here</h2>
        <p>
          We don&apos;t use made-up stock levels, borrowed reviews, or promises
          that a product is safe for everyone. Any deadline or crossed-out price
          you see here is real.
        </p>
      </>
    ),
  },
  {
    slug: "standards",
    title: "Our standards",
    eyebrow: "Why Belurae",
    description:
      "How Belurae writes product claims, lists ingredients, collects reviews and prices bundles — the rules we hold ourselves to.",
    schemaType: "WebPage",
    intro:
      "The rules behind every product page — written down so you can hold us to them.",
    body: (
      <>
        <h2>Claims</h2>
        <p>
          Every product statement comes from the manufacturer&apos;s packaging
          or documentation. Where something is the manufacturer&apos;s claim —
          like “hypoallergenic” — we say so. We don&apos;t use words like
          “painless”, “guaranteed” or “clinically proven” unless there&apos;s
          real evidence to show you.
        </p>
        <h2>Ingredients</h2>
        <p>
          We name the key ingredients on every product page, in the INCI form
          they appear on the pack, and explain each one in plain language. The
          complete INCI declaration is printed on every product&apos;s
          packaging.
        </p>
        <h2>Who makes our products</h2>
        <p>
          The manufacturer is named on each product page. We don&apos;t present
          another company&apos;s formula as our own.
        </p>
        <h2>Reviews</h2>
        <p>
          We only show reviews from verified Belurae orders. We don&apos;t
          import reviews from marketplaces or other sellers, and we don&apos;t
          hide critical ones. When a product has no reviews yet, we say that.
        </p>
        <h2>Pricing</h2>
        <p>
          We don&apos;t show “was” prices. When a multi-pack costs less than
          buying single sets, we show the exact saving, calculated from the
          current single price.
        </p>
        <h2>Safety guidance</h2>
        <p>
          We put the patch test, where to use a product and where not to use it
          next to the “Add to bag” button — not at the bottom of the page. Our
          guides are general information, not medical advice.
        </p>
      </>
    ),
  },
  {
    slug: "contact",
    title: "Contact us",
    eyebrow: "Customer care",
    description:
      "Contact Belurae customer care about orders, delivery, products or returns.",
    schemaType: "ContactPage",
    intro:
      "Questions about an order, a delivery or how to use a product? Write to us and a member of the team will reply.",
    body: (
      <>
        <h2>Email</h2>
        <p>
          <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
        </p>
        <h2>Helpful to include</h2>
        <ul>
          <li>
            Your order number (it starts with #) if your question is about an
            order
          </li>
          <li>A photo, if something arrived damaged or incorrect</li>
          <li>The product name, if your question is about how to use it</li>
        </ul>
        <h2>Order tracking</h2>
        <p>
          Signed-in customers can follow every order from{" "}
          <Link href="/account/orders">Your account → Orders</Link>.
        </p>
      </>
    ),
  },
  {
    slug: "shipping",
    title: "Shipping & delivery",
    eyebrow: "Customer care",
    description: `Belurae orders ship with tracking and usually arrive in ${site.delivery.minDays}–${site.delivery.maxDays} days. Shipping costs and options are shown at checkout.`,
    schemaType: "WebPage",
    intro: `Every order ships with tracking and usually arrives in ${site.delivery.minDays}–${site.delivery.maxDays} days.`,
    body: (
      <>
        <h2>Delivery times</h2>
        <p>
          Orders are typically delivered in {site.delivery.minDays}–
          {site.delivery.maxDays} days. Delivery estimates can vary by
          destination and during busy periods.
        </p>
        <h2>Costs</h2>
        <p>
          Shipping options and costs for your address are shown at checkout
          before you pay.
        </p>
        <h2>Tracking</h2>
        <p>
          You&apos;ll receive tracking details by email once your order ships,
          and signed-in customers can follow it from{" "}
          <Link href="/account/orders">Your account</Link>.
        </p>
        <h2>Something wrong with your delivery?</h2>
        <p>
          Contact us at{" "}
          <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> with
          your order number and we&apos;ll help. See also our{" "}
          <Link href="/pages/refund-policy">refund policy</Link>.
        </p>
      </>
    ),
  },
  {
    slug: "accessibility",
    title: "Accessibility",
    eyebrow: "Our commitment",
    description:
      "Belurae's accessibility statement: our target of WCAG 2.2 AA and how to report a barrier.",
    schemaType: "WebPage",
    intro:
      "We want everyone to be able to shop and learn at Belurae comfortably.",
    body: (
      <>
        <h2>Our target</h2>
        <p>
          This site is designed and tested against the Web Content Accessibility
          Guidelines (WCAG) 2.2 at level AA: keyboard access throughout, visible
          focus, sufficient colour contrast, descriptive image text, captions or
          text alternatives for video content, and respect for reduced-motion
          settings.
        </p>
        <h2>Found a barrier?</h2>
        <p>
          Please tell us at{" "}
          <a href={`mailto:${site.supportEmail}?subject=Accessibility`}>
            {site.supportEmail}
          </a>{" "}
          — include the page and what happened. We&apos;ll respond and fix what
          we can.
        </p>
      </>
    ),
  },
];

export function contentPageBySlug(slug: string): ContentPage | undefined {
  return contentPages.find((p) => p.slug === slug);
}

/** Shopify-managed legal pages: slug → policy key. */
export const policyPages = {
  "refund-policy": { key: "refundPolicy", title: "Refund policy" },
  "privacy-policy": { key: "privacyPolicy", title: "Privacy policy" },
  "terms-of-service": { key: "termsOfService", title: "Terms of service" },
} as const;
