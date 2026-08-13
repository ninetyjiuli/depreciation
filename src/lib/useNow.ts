import { useEffect, useState } from 'react';
import { todayStr } from './date';

// 每 60 秒刷新一次“今天”的日期，保证跨天后卡片金额实时更新
export function useNow(): string {
  const [now, setNow] = useState(todayStr());
  useEffect(() => {
    const t = setInterval(() => setNow(todayStr()), 60 * 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}
