export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}天${remainingHours}小时` : `${days}天`;
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
  }
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`;
  }
  return `${seconds}秒`;
}

export function isTimeout(bookedAt: string, timeoutMin: number): boolean {
  const bookedTime = new Date(bookedAt).getTime();
  const now = Date.now();
  const diffMin = (now - bookedTime) / (1000 * 60);
  return diffMin >= timeoutMin;
}

export function getWeekDates(baseDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(baseDate);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  current.setDate(diff);

  for (let i = 0; i < 7; i++) {
    const d = new Date(current);
    d.setDate(current.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
