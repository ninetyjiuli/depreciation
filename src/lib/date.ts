// ===== 日期工具 =====

// 当前日期，格式 YYYY-MM-DD（本地时区）
export function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// 两个日期之间的天数差：b - a（按自然日，向下取整）
export function daysBetween(from: string, to: string): number {
  const a = new Date(from + 'T00:00:00').getTime();
  const b = new Date(to + 'T00:00:00').getTime();
  return Math.floor((b - a) / 86400000);
}

// 保质期信息
export function expiryInfo(expiryDate: string | null, today: string = todayStr()) {
  if (!expiryDate) return null;
  const d = daysBetween(today, expiryDate);
  return {
    daysRemaining: d, // 正数=未到期，负数=已过期，0=今天到期
    expired: d < 0,
    dueToday: d === 0,
  };
}

// 简单格式化（输入已是 YYYY-MM-DD，直接返回；可在此扩展）
export function formatDate(s: string | null): string {
  return s || '';
}
