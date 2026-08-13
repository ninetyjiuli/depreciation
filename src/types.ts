// ===== 数据模型定义 =====

// 预计使用期限单位：年 / 月 / 日
export type LifespanUnit = 'year' | 'month' | 'day';

// 折旧方式：按天数 / 按次数
export type DepreciationMethod = 'days' | 'count';

// 小分类
export interface Subcategory {
  id: string;
  name: string;
}

// 大分类（含若干小分类，以及用于标识的颜色）
export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
  color: string; // 十六进制颜色，用于卡片徽标
}

// 资产物品
export interface Item {
  id: string;
  name: string;

  // 分类（只存 id，重命名分类不影响历史记录）
  categoryId: string;
  subcategoryId: string;

  // 购置信息
  cost: number; // 购置价格（元）
  purchaseDate: string; // 购置日期 YYYY-MM-DD

  // 折旧方式
  method: DepreciationMethod;

  // 天数法参数
  lifespanValue: number; // 预计使用期限数值
  lifespanUnit: LifespanUnit; // 年 / 月 / 日

  // 次数法参数
  expectedCount: number; // 预计使用总次数
  usedCount: number; // 已使用次数
  todayUsedCount: number; // 今日已记录使用次数（用于计入今日折旧）
  todayUsedDate: string; // 今日使用记录对应的日期 YYYY-MM-DD

  // 是否计入当天折旧总额
  includeInDaily: boolean;

  // 后续处理（处置）
  disposed: boolean;
  disposalDate: string | null; // 处置日期
  residualValue: number; // 后续处理回本金额（如二手卖掉所得）

  // 保质期提醒（食品等）
  hasExpiry: boolean;
  expiryDate: string | null; // 到期日 YYYY-MM-DD

  note: string; // 备注

  createdAt: string;
  updatedAt: string;
}

// 导出 / 导入的数据结构
export interface AppData {
  version: number;
  items: Item[];
  categories: Category[];
}
