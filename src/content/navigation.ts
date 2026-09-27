/**
 * Site navigation. Only destinations that exist are listed — categories are
 * added here as real products launch (docs/blueprint/02-experience.md §6).
 */

export type NavLink = { label: string; href: string; description?: string };
export type NavGroup = {
  label: string;
  href?: string;
  links: NavLink[];
  /**
   * Mobile menu only: tapping the group goes straight to `href` instead of
   * expanding its links. Used where the group's landing page already shows
   * everything the links would (Shop → Shop all), so a phone doesn't have to
   * open a submenu to reach it. Desktop keeps its dropdown panel either way.
   */
  mobileDirect?: boolean;
};

export const primaryNav: NavGroup[] = [
  {
    label: "Shop",
    href: "/collections/all",
    mobileDirect: true,
    links: [
      {
        label: "Hair Removal",
        href: "/collections/hair-removal",
        description: "At-home, no-blade hair removal",
      },
      {
        label: "Shop all",
        href: "/collections/all",
        description: "Everything Belurae sells today",
      },
    ],
  },
  {
    label: "Why Belurae",
    links: [
      {
        label: "Our philosophy",
        href: "/pages/philosophy",
        description: "Why clarity is the luxury",
      },
      {
        label: "How it works",
        href: "/guides/how-to-use-hair-removal-mousse",
        description: "The ritual, step by step",
      },
      {
        label: "Ingredients",
        href: "/ingredients",
        description: "What's inside, in plain words",
      },
      {
        label: "Our standards",
        href: "/pages/standards",
        description: "Claims, reviews and pricing rules",
      },
    ],
  },
  {
    label: "Learn",
    href: "/guides",
    links: [
      {
        label: "How to use hair removal mousse",
        href: "/guides/how-to-use-hair-removal-mousse",
        description: "Six unhurried steps",
      },
      {
        label: "How to patch test",
        href: "/guides/how-to-patch-test",
        description: "Check how your skin responds",
      },
      {
        label: "Hair removal aftercare",
        href: "/guides/hair-removal-aftercare",
        description: "The first 24 hours",
      },
      {
        label: "Choosing a method",
        href: "/guides/choosing-a-hair-removal-method",
        description: "Mousse, razor or wax?",
      },
      { label: "FAQs", href: "/pages/faq", description: "Straight answers" },
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
