export const site = {
  name: 'Rootsignal',
  domain: 'rootsignal.top',
  url: 'https://rootsignal.top',
  tagline: 'See the changes happening below.',
  founder: 'Dave Michael',
  email: 'yusuf@rootsignal.top',
  description:
    'Rootsignal helps growers organise root images, irrigation readings, environmental measurements, and inspection records by growing zone. It highlights changes and helps teams decide which areas need inspection.',
} as const;

export const navLinks = [
  { to: '/product', label: 'Product' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/use-cases', label: 'Use Cases' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
] as const;
