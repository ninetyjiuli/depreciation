import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppData, Category, Item, LifespanUnit, Subcategory } from '../types';
import { newId } from '../lib/id';
import { todayStr } from '../lib/date';

// ===== 默认大/小分类（首次使用写入）=====
const defaultCategories: Category[] = [
  {
    id: 'cat-electronics',
    name: '电子设备',
    color: '#2f6fed',
    subcategories: [
      { id: 'sub-phone', name: '手机' },
      { id: 'sub-watch', name: '手表' },
      { id: 'sub-screen', name: '智慧屏' },
      { id: 'sub-other-elec', name: '其他' },
    ],
  },
  {
    id: 'cat-food',
    name: '食品',
    color: '#f0883e',
    subcategories: [
      { id: 'sub-snack', name: '零食' },
      { id: 'sub-drink', name: '饮料' },
      { id: 'sub-fresh', name: '生鲜' },
    ],
  },
  {
    id: 'cat-clothing',
    name: '服装饰品',
    color: '#9b59b6',
    subcategories: [
      { id: 'sub-clothes', name: '衣服' },
      { id: 'sub-bag', name: '包包' },
      { id: 'sub-shoes', name: '鞋子' },
      { id: 'sub-jewel', name: '饰品' },
    ],
  },
];

// ===== 物品录入参数（新增/编辑共用）=====
export interface ItemInput {
  name: string;
  categoryId: string;
  subcategoryId: string;
  cost: number;
  purchaseDate: string;
  method: 'days' | 'count';
  lifespanValue: number;
  lifespanUnit: LifespanUnit;
  expectedCount: number;
  usedCount: number;
  includeInDaily: boolean;
  hasExpiry: boolean;
  expiryDate: string | null;
  note: string;
}

interface StoreState {
  items: Item[];
  categories: Category[];

  // 物品
  addItem: (input: ItemInput) => void;
  updateItem: (id: string, input: ItemInput) => void;
  deleteItem: (id: string) => void;
  toggleInclude: (id: string) => void;
  recordUsage: (id: string) => void; // 次数法：记录一次使用
  disposeItem: (id: string, disposalDate: string, residualValue: number, note: string) => void;

  // 分类
  addCategory: (name: string, color: string) => void;
  renameCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => { ok: boolean; msg: string };
  addSubcategory: (categoryId: string, name: string) => void;
  renameSubcategory: (categoryId: string, subId: string, name: string) => void;
  deleteSubcategory: (categoryId: string, subId: string) => { ok: boolean; msg: string };

  // 数据
  exportData: () => string;
  importData: (json: string) => { ok: boolean; msg: string };
  resetAll: () => void;
}

function makeItem(input: ItemInput, id?: string): Item {
  const now = new Date().toISOString();
  return {
    id: id ?? newId(),
    name: input.name.trim(),
    categoryId: input.categoryId,
    subcategoryId: input.subcategoryId,
    cost: Number(input.cost) || 0,
    purchaseDate: input.purchaseDate,
    method: input.method,
    lifespanValue: Number(input.lifespanValue) || 0,
    lifespanUnit: input.lifespanUnit,
    expectedCount: Number(input.expectedCount) || 0,
    usedCount: Number(input.usedCount) || 0,
    todayUsedCount: 0,
    todayUsedDate: todayStr(),
    includeInDaily: input.includeInDaily,
    disposed: false,
    disposalDate: null,
    residualValue: 0,
    hasExpiry: input.hasExpiry,
    expiryDate: input.expiryDate,
    note: input.note,
    createdAt: now,
    updatedAt: now,
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],
      categories: defaultCategories,

      addItem: (input) => set((s) => ({ items: [makeItem(input), ...s.items] })),

      updateItem: (id, input) =>
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id
              ? {
                  ...it,
                  name: input.name.trim(),
                  categoryId: input.categoryId,
                  subcategoryId: input.subcategoryId,
                  cost: Number(input.cost) || 0,
                  purchaseDate: input.purchaseDate,
                  method: input.method,
                  lifespanValue: Number(input.lifespanValue) || 0,
                  lifespanUnit: input.lifespanUnit,
                  expectedCount: Number(input.expectedCount) || 0,
                  usedCount: Number(input.usedCount) || 0,
                  includeInDaily: input.includeInDaily,
                  hasExpiry: input.hasExpiry,
                  expiryDate: input.expiryDate,
                  note: input.note,
                  updatedAt: new Date().toISOString(),
                }
              : it
          ),
        })),

      deleteItem: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),

      toggleInclude: (id) =>
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id ? { ...it, includeInDaily: !it.includeInDaily } : it
          ),
        })),

      recordUsage: (id) =>
        set((s) => {
          const t = todayStr();
          return {
            items: s.items.map((it) => {
              if (it.id !== id) return it;
              const sameDay = it.todayUsedDate === t;
              return {
                ...it,
                usedCount: it.usedCount + 1,
                todayUsedCount: sameDay ? it.todayUsedCount + 1 : 1,
                todayUsedDate: t,
                updatedAt: new Date().toISOString(),
              };
            }),
          };
        }),

      disposeItem: (id, disposalDate, residualValue, note) =>
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id
              ? {
                  ...it,
                  disposed: true,
                  disposalDate,
                  residualValue: Number(residualValue) || 0,
                  note: note ? it.note + '\n' + note : it.note,
                  updatedAt: new Date().toISOString(),
                }
              : it
          ),
        })),

      addCategory: (name, color) =>
        set((s) => ({
          categories: [...s.categories, { id: newId(), name: name.trim(), color, subcategories: [] }],
        })),

      renameCategory: (id, name) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, name: name.trim() } : c
          ),
        })),

      deleteCategory: (id) => {
        const { items, categories } = get();
        const used = items.filter((it) => it.categoryId === id).length;
        if (used > 0) {
          return { ok: false, msg: `该分类下还有 ${used} 件物品，无法删除。请先转移或删除这些物品。` };
        }
        set({ categories: categories.filter((c) => c.id !== id) });
        return { ok: true, msg: '已删除' };
      },

      addSubcategory: (categoryId, name) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === categoryId
              ? { ...c, subcategories: [...c.subcategories, { id: newId(), name: name.trim() }] }
              : c
          ),
        })),

      renameSubcategory: (categoryId, subId, name) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === categoryId
              ? {
                  ...c,
                  subcategories: c.subcategories.map((sub) =>
                    sub.id === subId ? { ...sub, name: name.trim() } : sub
                  ),
                }
              : c
          ),
        })),

      deleteSubcategory: (categoryId, subId) => {
        const { items } = get();
        const used = items.filter((it) => it.categoryId === categoryId && it.subcategoryId === subId).length;
        if (used > 0) {
          return { ok: false, msg: `该小分类下还有 ${used} 件物品，无法删除。` };
        }
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === categoryId
              ? { ...c, subcategories: c.subcategories.filter((sub) => sub.id !== subId) }
              : c
          ),
        }));
        return { ok: true, msg: '已删除' };
      },

      exportData: () => {
        const { items, categories } = get();
        const data: AppData = { version: 1, items, categories };
        return JSON.stringify(data, null, 2);
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json) as AppData;
          if (!Array.isArray(data.items) || !Array.isArray(data.categories)) {
            return { ok: false, msg: '文件格式不正确：缺少 items 或 categories。' };
          }
          set({ items: data.items as Item[], categories: data.categories as Category[] });
          return { ok: true, msg: `导入成功：${data.items.length} 件物品、${data.categories.length} 个分类。` };
        } catch (e) {
          return { ok: false, msg: '解析失败：不是合法的 JSON 文件。' };
        }
      },

      resetAll: () => set({ items: [], categories: defaultCategories }),
    }),
    {
      name: 'depreciation-tracker', // localStorage 键名
      version: 1,
    }
  )
);
