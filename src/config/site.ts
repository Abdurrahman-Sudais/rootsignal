export const site = {
  name: 'Rootsignal',
  domain: 'rootsignal.top',
  url: 'https://rootsignal.top',
  tagline: 'See the changes happening below.',
  founder: 'Dave Michael',
  email: 'yusuf@rootsignal.top',
  category: 'Root-zone monitoring, inspection records and AI-assisted crop operations for commercial growers',
  description:
    'Rootsignal helps growers organise root images, irrigation readings, environmental measurements, and inspection records by growing zone. It highlights changes and helps teams decide which areas need inspection.',
} as const;

export interface Person {
  name: string;
  initials: string;
  role: string;
  email?: string;
  bio: string;
  focus: string[];
}

/** The founding team, credited on the home page, About, Contact and in the footer. */
export const FOUNDERS: Person[] = [
  {
    name: 'Dave Michael',
    initials: 'DM',
    role: 'Founder/CEO',
    bio: 'Dave founded Rootsignal so growing teams can see what is happening in the root zone before it shows in the canopy — and leads product, growers and every pilot.',
    focus: ['Product', 'Growers', 'Pilots'],
  },
  {
    name: 'Yusuf Abdulhamid',
    initials: 'YA',
    role: 'Co-founder/CTO',
    bio: 'Yusuf co-founded Rootsignal and leads its technology — from image comparison and data-quality checks to the zone records and the cloud platform they run on.',
    focus: ['Image comparison', 'Data pipelines', 'Cloud platform'],
  },
];

export const navLinks = [
  { to: '/#problem', label: 'Problem' },
  { to: '/product', label: 'Product' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/technology', label: 'Technology' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about#team', label: 'Team' },
  { to: '/security', label: 'Security' },
] as const;

export const footerNav = [
  { title: 'Product', links: [['/product', 'Product overview'], ['/how-it-works', 'How it works'], ['/dashboard', 'Interactive demo'], ['/pricing', 'Pricing']] },
  { title: 'Solutions', links: [['/use-cases#hydroponic', 'Hydroponic farms'], ['/use-cases#greenhouse', 'Greenhouse operations'], ['/use-cases#nursery', 'Commercial nurseries']] },
  { title: 'Company', links: [['/about', 'About & team'], ['/technology', 'Technology (AWS)'], ['/security', 'Security & safeguards'], ['/contact?type=demo', 'Request early access'], ['/#faq', 'FAQ']] },
  { title: 'Legal', links: [['/privacy', 'Privacy notice'], ['/terms', 'Terms of use']] },
] as const;
