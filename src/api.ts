import { festivalDayConfig, normalDayConfig } from './config';
import type { Booking, Doctor, LayoutConfig, Prescription, Slot } from './types';

export const mockSettings = {
  latencyMs: 350,
  forceFailure: false,
  emptyPrescriptions: false,
};

export const doctors: Doctor[] = [
  { id: 'doc-1', name: 'Dr. Ananya Reddy', specialty: 'General Physician', photoUrl: '', feeInr: 500, languages: ['Telugu', 'Hindi', 'English'] },
  { id: 'doc-2', name: 'Dr. Rahul Sharma', specialty: 'Dermatologist', photoUrl: '', feeInr: 700, languages: ['Hindi', 'English'] },
  { id: 'doc-3', name: 'Dr. S. Lakshmi', specialty: 'Paediatrician', photoUrl: '', feeInr: 600, languages: ['Telugu', 'English'] },
];

const slots: Slot[] = [];
for (const doctorId of ['doc-1', 'doc-2', 'doc-3']) {
  for (const day of [13, 14, 15, 16, 17, 18, 19, 20, 21, 22]) {
    for (const [index, hour] of [10, 11, 12, 16, 17].entries()) {
      const date = `2026-10-${String(day).padStart(2, '0')}`;
      slots.push({
        id: `${doctorId}-${date}-${hour}`,
        doctorId,
        startsAt: `${date}T${String(hour).padStart(2, '0')}:00:00+05:30`,
        endsAt: `${date}T${String(hour).padStart(2, '0')}:30:00+05:30`,
        available: index !== 2,
      });
    }
  }
}

export const prescriptions: Prescription[] = [
  {
    id: 'rx-1',
    issuedAt: '2026-10-10',
    doctorName: 'Dr. Ananya Reddy',
    clinicName: 'Tapza Family Clinic, Hyderabad',
    medicines: [
      { id: 'med-1', name: 'Paracetamol', dose: '500 mg', days: 3, timing: ['morning', 'night'] },
      { id: 'med-2', name: 'Vitamin D', dose: '1 tablet', days: 7, timing: ['morning'] },
      { id: 'med-3', name: 'Antacid', dose: '1 tablet', days: 5, timing: ['afternoon'] },
    ],
  },
  {
    id: 'rx-2',
    issuedAt: '2026-10-08',
    doctorName: 'Dr. S. Lakshmi',
    clinicName: 'Tapza Family Clinic, Hyderabad',
    medicines: [{ id: 'med-4', name: 'ORS', dose: 'As directed', days: 2, timing: ['morning', 'afternoon'] }],
  },
];

let activeConfig: LayoutConfig = normalDayConfig;
const bookings: Booking[] = [];

async function delayAndFail(): Promise<void> {
  await new Promise<void>(resolve => setTimeout(resolve, mockSettings.latencyMs));
  if (mockSettings.forceFailure) throw new Error('Network request failed. Please try again.');
}

export async function getConfig(): Promise<LayoutConfig> {
  await delayAndFail();
  return activeConfig;
}

export async function setFestival(enabled: boolean): Promise<LayoutConfig> {
  activeConfig = enabled ? festivalDayConfig : normalDayConfig;
  return activeConfig;
}

export async function getDoctors(): Promise<Doctor[]> {
  await delayAndFail();
  return doctors;
}

export async function getSlots(doctorId: string, date: string): Promise<Slot[]> {
  await delayAndFail();
  return slots.filter(s => s.doctorId === doctorId && s.startsAt.slice(0, 10) === date);
}

export async function createBooking(doctorId: string, slotId: string): Promise<Booking> {
  await delayAndFail();
  const slot = slots.find(s => s.id === slotId && s.doctorId === doctorId);
  if (!slot || !slot.available) throw new Error('409: This slot is no longer available.');
  slot.available = false;
  const booking = { id: `booking-${Date.now()}`, doctorId, slotId, status: 'confirmed' as const };
  bookings.push(booking);
  return booking;
}

export async function getBookings(): Promise<Booking[]> {
  await delayAndFail();
  return [...bookings];
}

export async function getPrescriptions(): Promise<Prescription[]> {
  await delayAndFail();
  return mockSettings.emptyPrescriptions ? [] : prescriptions;
}
