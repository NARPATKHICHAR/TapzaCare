export type ScreenName = 'home' | 'bookings' | 'prescriptions' | 'profile';

export type ThemeConfig = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  festival: { name: string; greeting: string; bannerImageUrl: string };
};

export type LayoutSection = {
  id: string;
  type: string;
  background: { kind: 'color' | 'gradient' | 'image'; value: string };
  title: string;
  items: unknown[];
};

export type LayoutConfig = {
  version: number;
  theme: ThemeConfig;
  tabs: { id: string; label: string; icon: string; screen: ScreenName }[];
  sections: LayoutSection[];
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  photoUrl: string;
  feeInr: number;
  languages: string[];
};

export type Slot = {
  id: string;
  doctorId: string;
  startsAt: string;
  endsAt: string;
  available: boolean;
};

export type Booking = {
  id: string;
  doctorId: string;
  slotId: string;
  status: 'confirmed';
};

export type Medicine = {
  id: string;
  name: string;
  dose: string;
  days: number;
  timing: ('morning' | 'afternoon' | 'night')[];
};

export type Prescription = {
  id: string;
  issuedAt: string;
  doctorName: string;
  clinicName: string;
  medicines: Medicine[];
};

export type ServiceItem = {
  id: string;
  name: string;
  price: number;
  badge?: string;
  icon?: string;
  imageUrl?: string;
};
