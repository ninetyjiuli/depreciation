import { Item, LifespanUnit } from '../types';
import { daysBetween, todayStr } from './date';

// 把“预计使用期限”换算成天数
export function lifespanToDays(value: number, unit: LifespanUnit): number {
  const v = Number(value) || 0;
  switch (unit) {
    case 'year':
      return v * 365;
    case 'month':
      return v * 30;
    case 'day':
      return v;
    default:
      return v;
  }
}

// 实际需要摊销的成本：处置后扣减回本金额
export function effectiveCost(item: Item): number {
  const base = Number(item.cost) || 0;
  if (item.disposed) {
    const res = Number(item.residualValue) || 0;
    return Math.max(base - res, 0);
  }
  return base;
}

export interface DepreciationResult {
  lifespanDays: number; // 预计使用总天数
  elapsedDays: number; // 已使用天数
  plannedDaily: number; // 按预计年限均摊的日均（天数法）
  usedDaily: number; // 按已用天数均摊的日均（天数法）
  perUse: number; // 每次摊销金额（次数法）
  depreciatedAmount: number; // 已摊销总额
  remaining: number; // 剩余待摊销
  dailyContribution: number; // 计入“今日折旧总额”的金额
  // 卡片上展示的两个核心数字（随折旧方式不同含义不同）
  primaryA: number;
  primaryALabel: string;
  primaryB: number;
  primaryBLabel: string;
}

// 计算某物品的折旧明细
export function calcDepreciation(item: Item, today: string = todayStr()): DepreciationResult {
  const eff = effectiveCost(item);
  const lifespanDays = Math.max(lifespanToDays(item.lifespanValue, item.lifespanUnit), 1);
  const elapsedDays = Math.max(daysBetween(item.purchaseDate, today), 0);

  if (item.method === 'days') {
    const plannedDaily = eff / lifespanDays; // 按预计年限平均到每天
    const usedDaily = eff / Math.max(elapsedDays, 1); // 按已使用天数均摊
    const depreciatedAmount = plannedDaily * elapsedDays;
    const remaining = Math.max(eff - depreciatedAmount, 0);
    const dailyContribution = item.includeInDaily && !item.disposed ? plannedDaily : 0;
    return {
      lifespanDays,
      elapsedDays,
      plannedDaily,
      usedDaily,
      perUse: 0,
      depreciatedAmount,
      remaining,
      dailyContribution,
      primaryA: plannedDaily,
      primaryALabel: '预计日均摊销',
      primaryB: usedDaily,
      primaryBLabel: '已用天数日均',
    };
  } else {
    const expected = Math.max(Number(item.expectedCount) || 0, 1);
    const perUse = eff / expected; // 每次摊销
    const used = Math.max(Number(item.usedCount) || 0, 0);
    const depreciatedAmount = perUse * used;
    const remaining = Math.max(eff - depreciatedAmount, 0);
    // 今日使用次数（仅当天有效）
    const todayUsed = item.todayUsedDate === today ? Number(item.todayUsedCount) || 0 : 0;
    const dailyContribution =
      item.includeInDaily && !item.disposed ? perUse * todayUsed : 0;
    return {
      lifespanDays,
      elapsedDays,
      plannedDaily: 0,
      usedDaily: 0,
      perUse,
      depreciatedAmount,
      remaining,
      dailyContribution,
      primaryA: perUse,
      primaryALabel: '每次摊销',
      primaryB: depreciatedAmount,
      primaryBLabel: '已摊销金额',
    };
  }
}

// 金额格式化（保留两位小数，无小数时去尾）
export function fmtMoney(n: number): string {
  const v = Number(n) || 0;
  if (Math.abs(v - Math.round(v)) < 1e-9) return v.toFixed(0);
  return v.toFixed(2);
}

// 货币显示，带 ¥ 符号
export function money(n: number): string {
  return '¥' + fmtMoney(n);
}
