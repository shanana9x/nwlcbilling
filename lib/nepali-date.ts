// Nepali Date Converter Utility
// This is a simplified converter - in production, you'd use a proper library like nepali-date-converter

interface NepaliDate {
  year: number;
  month: number;
  day: number;
}

interface EnglishDate {
  year: number;
  month: number;
  day: number;
}

// Simplified conversion tables (partial implementation)
// In production, use a complete library like 'nepali-date-converter'
const nepaliMonths = [
  'बैशाख', 'जेठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
  'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
];

const englishMonths = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Basic conversion functions (simplified)
export function adToBs(adDate: string): string {
  const date = new Date(adDate);
  // Simplified conversion - add approximately 56-57 years
  const bsYear = date.getFullYear() + 56;
  const bsMonth = date.getMonth() + 1;
  const bsDay = date.getDate();
  
  return `${bsYear}-${bsMonth.toString().padStart(2, '0')}-${bsDay.toString().padStart(2, '0')}`;
}

export function bsToAd(bsDate: string): string {
  const [year, month, day] = bsDate.split('-').map(Number);
  // Simplified conversion - subtract approximately 56-57 years
  const adYear = year - 56;
  const adMonth = month;
  const adDay = day;
  
  return `${adYear}-${adMonth.toString().padStart(2, '0')}-${adDay.toString().padStart(2, '0')}`;
}

export function formatNepaliDate(bsDate: string): string {
  const [year, month, day] = bsDate.split('-').map(Number);
  return `${nepaliMonths[month - 1]} ${day}, ${year}`;
}

export function formatEnglishDate(adDate: string): string {
  const date = new Date(adDate);
  return `${englishMonths[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function getCurrentBsDate(): string {
  const today = new Date().toISOString().split('T')[0];
  return adToBs(today);
}

export function formatNepaliCurrency(amount: number): string {
  return `रू ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}