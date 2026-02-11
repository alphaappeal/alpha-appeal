/**
 * South African date and time formatting utilities
 */

export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
};

export const formatBusinessHours = (hours: string): string => {
  // Parse hours like "09:00 - 18:00" and format for South African context
  const [start, end] = hours.split(' - ');
  
  if (!start || !end) return hours;
  
  const startDate = new Date();
  const endDate = new Date();
  
  const [startHours, startMinutes] = start.split(':').map(Number);
  const [endHours, endMinutes] = end.split(':').map(Number);
  
  startDate.setHours(startHours, startMinutes);
  endDate.setHours(endHours, endMinutes);
  
  return `${formatTime(startDate)} - ${formatTime(endDate)}`;
};

export const getBusinessHoursStatus = (hours: string): { isOpen: boolean; nextOpening?: string } => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // For simplicity, assume same hours for all weekdays
  const [start, end] = hours.split(' - ');
  const [startHours, startMinutes] = start.split(':').map(Number);
  const [endHours, endMinutes] = end.split(':').map(Number);
  
  const openTime = new Date();
  openTime.setHours(startHours, startMinutes, 0, 0);
  
  const closeTime = new Date();
  closeTime.setHours(endHours, endMinutes, 0, 0);
  
  const isOpen = now >= openTime && now <= closeTime && currentDay >= 1 && currentDay <= 5;
  
  if (!isOpen) {
    // Calculate next opening time
    const nextOpening = new Date();
    if (currentDay === 5 && now > closeTime) {
      // It's Friday after closing, next opening is Monday
      nextOpening.setDate(now.getDate() + (8 - currentDay));
    } else if (currentDay === 6 || currentDay === 0) {
      // Weekend, next opening is Monday
      nextOpening.setDate(now.getDate() + (8 - currentDay));
    } else {
      // Weekday before opening or after closing
      if (now < openTime) {
        // Before opening today
        nextOpening.setDate(now.getDate());
      } else {
        // After closing today, next opening is tomorrow
        nextOpening.setDate(now.getDate() + 1);
      }
    }
    
    nextOpening.setHours(startHours, startMinutes, 0, 0);
    
    return {
      isOpen: false,
      nextOpening: formatDateTime(nextOpening),
    };
  }
  
  return { isOpen: true };
};

export const formatDeliveryEstimate = (days: number): string => {
  if (days === 1) {
    return '1 business day';
  } else if (days <= 3) {
    return `${days} business days`;
  } else if (days <= 7) {
    return '3-7 business days';
  } else {
    return '7+ business days';
  }
};

// South African public holidays (simplified)
export const getPublicHolidays = (year: number) => {
  const holidays = [
    { name: 'New Year\'s Day', date: new Date(year, 0, 1) },
    { name: 'Human Rights Day', date: new Date(year, 2, 21) },
    { name: 'Good Friday', date: getEasterDate(year, -2) },
    { name: 'Family Day', date: getEasterDate(year, 1) },
    { name: 'Freedom Day', date: new Date(year, 3, 27) },
    { name: 'Workers\' Day', date: new Date(year, 4, 1) },
    { name: 'Youth Day', date: new Date(year, 5, 16) },
    { name: 'National Women\'s Day', date: new Date(year, 7, 9) },
    { name: 'Heritage Day', date: new Date(year, 8, 24) },
    { name: 'Day of Reconciliation', date: new Date(year, 11, 16) },
    { name: 'Christmas Day', date: new Date(year, 11, 25) },
    { name: 'Day of Goodwill', date: new Date(year, 11, 26) },
  ];
  
  return holidays;
};

// Helper function to calculate Easter date
function getEasterDate(year: number, offsetDays: number = 0): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + offsetDays);
  return date;
}