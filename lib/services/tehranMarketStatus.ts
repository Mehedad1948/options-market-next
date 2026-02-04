export function getTehranMarketStatus(): string {
  // Get current time in Tehran
  const now = new Date();
  const tehranTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    hour12: false,
  });

  const parts = tehranTime.formatToParts(now);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value;

  const weekday = getPart('weekday'); // e.g., "Sat", "Sun", "Thu", "Fri"
  const hour = parseInt(getPart('hour') || '0', 10);
  const minute = parseInt(getPart('minute') || '0', 10);

  // 1. Check Weekend (Thursday & Friday in Iran)
  if (weekday === 'Thu' || weekday === 'Fri') {
    return 'CLOSED (WEEKEND)';
  }

  // 2. Check Market Hours (09:00 to 12:30)
  // Converting time to minutes for easier comparison
  const currentMinutes = hour * 60 + minute;
  const startMinutes = 9 * 60;       // 09:00
  const endMinutes = 12 * 60 + 30;   // 12:30

  if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
    return 'OPEN';
  }

  return 'CLOSED';
}