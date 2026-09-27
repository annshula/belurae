/**
 * Site navigation. Only destinations that exist are listed — categories are
 * added here as real products launch (docs/blueprint/02-experience.md §6).
 */

export type NavLink = { label: string; href: string; description?: string };
export type NavGroup = { label: string; href?: string; links: NavLink[] };

export const primaryNav: NavGroup[] = [
  {
    label: "Shop",
    href: "/collections/all",
    links: [
      { label: "Hair Removal", href: "/collections/hair-removal", description: "At-home, no-blade hair removal" },
      { label: "Shop all", href: "/collections/all", description: "Everything Belurae sells today" },
    ],
  },
  {
    label: "Why Belurae",
    links: [
      { label: "Our philosophy", href: "/pages/philosophy" },
      { label: "How it works", href: "/guides/how-to-use-hair-removal-mousse" },
      { label: "Ingredients", href: "/ingredients" },
      { label: "Our standards", href: "/pages/standards" },
    ],
  },
  {
    label: "Learn",
    href: "/guides",
    links: [
      { label: "How to use hair removal mousse", href: "/guides/how-to-use-hair-removal-mousse" },
      { label: "How to patch test", href: "/guides/how-to-patch-test" },
      { label: "Hair removal aftercare", href: "/guides/hair-removal-aftercare" },
      { label: "Choosing a method", href: "/guides/choosing-a-hair-removal-method" },
      { label: "All guides", href: "/guides" },
      { label: "FAQs", href: "/pages/faq" },
    ],
  },
  { label: "About", href: "/pages/about", links: [] },
];

export const footerNav: NavGroup[] = [
  {
    label: "Shop",
    links: [
      { label: "Hair Removal", href: "/collections/hair-removal" },
      { label: "Shop all", href: "/collections/all" },
    ],
  },
  {
    label: "Learn",
    links: [
      { label: "Guides", href: "/guides" },
      { label: "Ingredients", href: "/ingredients" },
      { label: "FAQs", href: "/pages/faq" },
    ],
  },
  {
    label: "Why Belurae",
    links: [
      { label: "Our philosophy", href: "/pages/philosophy" },
      { label: "Our standards", href: "/pages/standards" },
      { label: "About", href: "/pages/about" },
    ],
  },
  {
    label: "Customer care",
    links: [
      { label: "Contact", href: "/pages/contact" },
      { label: "Shipping", href: "/pages/shipping" },
      { label: "Returns & refunds", href: "/pages/refund-policy" },
      { label: "Your account", href: "/account" },
    ],
  },
];

export const legalNav: NavLink[] = [
  { label: "Privacy", href: "/pages/privacy-policy" },
  { label: "Terms", href: "/pages/terms-of-service" },
  { label: "Accessibility", href: "/pages/accessibility" },
];
