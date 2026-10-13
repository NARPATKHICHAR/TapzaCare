export type Language = 'en' | 'hi';

const strings = {
  en: {
    hello: 'Hello, how can we care for you today?',
    home: 'Home',
    bookings: 'Bookings',
    prescriptions: 'Medicines',
    more: 'More',
    festivalOn: 'Diwali theme',
    festivalOff: 'Normal theme',
    loading: 'Loading your care…',
    retry: 'Try again',
    noPrescriptions: 'No prescriptions yet',
    noBookings: 'No bookings yet',
    taken: 'Taken',
    markTaken: 'Mark as taken',
    morning: 'Morning',
    afternoon: 'Afternoon',
    night: 'Night',
  },
  hi: {
    hello: 'नमस्ते, आज हम आपकी क्या मदद करें?',
    home: 'होम',
    bookings: 'बुकिंग',
    prescriptions: 'दवाइयाँ',
    more: 'और',
    festivalOn: 'दिवाली थीम',
    festivalOff: 'सामान्य थीम',
    loading: 'आपकी जानकारी लोड हो रही है…',
    retry: 'फिर कोशिश करें',
    noPrescriptions: 'अभी कोई प्रिस्क्रिप्शन नहीं है',
    noBookings: 'अभी कोई बुकिंग नहीं है',
    taken: 'ले ली',
    markTaken: 'ली गई मार्क करें',
    morning: 'सुबह',
    afternoon: 'दोपहर',
    night: 'रात',
  },
} as const;

export function t(language: Language, key: keyof typeof strings.en): string {
  return strings[language][key];
}
