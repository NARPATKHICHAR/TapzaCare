import type { LayoutConfig, LayoutSection } from './types';

const baseTheme = {
  primary: '#087F78',
  secondary: '#DDF7F0',
  background: '#F4F8F7',
  surface: '#FFFFFF',
  textPrimary: '#183431',
  textSecondary: '#647875',
  accent: '#D97706',
};

const normalSections: LayoutSection[] = [
  { id: 'hero', type: 'hero_banner', background: { kind: 'gradient', value: '#075E57,#0E9388' }, title: 'Care that stays with you', items: [{ greeting: 'Namaste! 👋', subtitle: 'Health care for your whole family' }] },
  { id: 'categories', type: 'category_chips', background: { kind: 'color', value: '#EAF8F4' }, title: 'Explore services', items: [{ id: 'consult', name: 'Consult', icon: '🩺' }, { id: 'lab', name: 'Lab tests', icon: '🧪' }, { id: 'pharmacy', name: 'Pharmacy', icon: '💊' }, { id: 'vaccine', name: 'Vaccines', icon: '💉' }] },
  { id: 'actions', type: 'quick_actions', background: { kind: 'color', value: '#FFFFFF' }, title: 'Your care at a glance', items: [{ id: 'book', name: 'Book a visit', icon: '📅' }, { id: 'prescriptions', name: 'Prescriptions', icon: '📋' }, { id: 'reminders', name: 'Medicine reminders', icon: '⏰' }, { id: 'family', name: 'Family care', icon: '👨‍👩‍👧' }] },
  { id: 'services', type: 'service_grid', background: { kind: 'color', value: '#FFF7ED' }, title: 'Popular services', items: [{ id: 'blood', name: 'Blood test', price: 499, badge: 'Popular', icon: '🧪' }, { id: 'checkup', name: 'Health checkup', price: 999, icon: '🩺' }, { id: 'vaccine', name: 'Vaccination', price: 399, icon: '💉' }, { id: 'consult', name: 'Doctor consult', price: 500, icon: '👨‍⚕️' }] },
  { id: 'doctors', type: 'doctor_carousel', background: { kind: 'color', value: '#EEF4FF' }, title: 'Doctors near you', items: [] },
  { id: 'offer', type: 'offer_strip', background: { kind: 'color', value: '#DDF7F0' }, title: 'Small steps, healthier days', items: [{ message: 'Book your next visit in just a few taps.' }] },
];

export const normalDayConfig: LayoutConfig = {
  version: 1,
  theme: { ...baseTheme, festival: { name: '', greeting: 'Namaste!', bannerImageUrl: '' } },
  tabs: [
    { id: 'home', label: 'Home', icon: '⌂', screen: 'home' },
    { id: 'bookings', label: 'Bookings', icon: '▣', screen: 'bookings' },
    { id: 'prescriptions', label: 'Medicines', icon: '＋', screen: 'prescriptions' },
    { id: 'profile', label: 'More', icon: '☰', screen: 'profile' },
  ],
  sections: normalSections,
};

export const festivalDayConfig: LayoutConfig = {
  version: 2,
  theme: { ...baseTheme, primary: '#9A3412', secondary: '#FFEDD5', background: '#FFFBF5', accent: '#B45309', festival: { name: 'Diwali', greeting: 'Shubh Deepawali! 🪔', bannerImageUrl: '' } },
  tabs: normalDayConfig.tabs,
  sections: [
    { id: 'diwali-hero', type: 'hero_banner', background: { kind: 'gradient', value: '#7C2D12,#B45309' }, title: 'A brighter, healthier Diwali', items: [{ greeting: 'Shubh Deepawali! 🪔', subtitle: 'Wishing your family health and happiness' }] },
    normalSections[1],
    { id: 'diwali-offer', type: 'offer_strip', background: { kind: 'color', value: '#FED7AA' }, title: 'Festival wellness', items: [{ message: 'Make time for your family’s health this Diwali.' }] },
    normalSections[3],
    normalSections[2],
    normalSections[4],
  ],
};

export function validateConfig(value: unknown): value is LayoutConfig {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<LayoutConfig>;
  return typeof v.version === 'number'
    && !!v.theme && typeof v.theme.primary === 'string'
    && typeof v.theme.background === 'string'
    && Array.isArray(v.tabs) && Array.isArray(v.sections)
    && v.sections.every((s) => !!s && typeof s.id === 'string' && typeof s.type === 'string'
      && !!s.background && ['color', 'gradient', 'image'].includes(s.background.kind)
      && typeof s.background.value === 'string' && Array.isArray(s.items));
}
