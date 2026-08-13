import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { calcDepreciation, money } from '../lib/calc';
import { ItemCard } from '../components/ItemCard';

interface Props {
  now: string;
  onEdit: (id: string) => void;
  onDispose: (id: string) => void;
  onToggleInclude: (id: string) => void;
  onRecordUsage: (id: string) => void;
}

export function Dashboard({ now, onEdit, onDispose, onToggleInclude, onRecordUsage }: Props) {
  const items = useStore((s) => s.items);
  const categories = useStore((s) => s.categories);
  const [filter, setFilter] = useState('');

  const inUse = items.filter((it) => !it.disposed);

  const total = useMemo(() => {
    return inUse.reduce((sum, it) => sum + calcDepreciation(it, now).dailyContribution, 0);
  }, [inUse, now]);

  const byDays = useMemo(
    () =>
      inUse
        .filter((it) => it.method === 'days')
        .reduce((s, it) => s + calcDepreciation(it, now).dailyContribution, 0),
    [inUse, now]
  );
  const byCount = useMemo(
    () =>
      inUse
        .filter((it) => it.method === 'count')
        .reduce((s, it) => s + calcDepreciation(it, now).dailyContribution, 0),
    [inUse, now]
  );

  const visible = inUse
    .filter((it) => (filter ? it.categoryId === filter : true))
    .sort((a, b) => (a.purchaseDate < b.purchaseDate ? 1 : -1));

  return (
    <div className="page">
      <div className="summary-hero">
        <div className="summary-label">今日折旧总额</div>
        <div className="summary-total">{money(total)}</div>
        <div className="summary-sub">
          按天数法 {money(byDays)} · 按次数法 {money(byCount)}
        </div>
        <div className="summary-sub">在用物品 {inUse.length} 件</div>
      </div>

      <div className="filter-bar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">全部分类</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="empty">还没有在用物品，点右下角 + 添加第一件吧。</div>
      ) : (
        <div className="card-list">
          {visible.map((it) => (
            <ItemCard
              key={it.id}
              item={it}
              now={now}
              onEdit={onEdit}
              onDispose={onDispose}
              onToggleInclude={onToggleInclude}
              onRecordUsage={onRecordUsage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
