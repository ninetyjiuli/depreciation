import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { ItemCard } from '../components/ItemCard';

interface Props {
  now: string;
  onEdit: (id: string) => void;
  onDispose: (id: string) => void;
  onToggleInclude: (id: string) => void;
  onRecordUsage: (id: string) => void;
}

// 汇总页：所有卡片，在用排前面、已处置排后面（灰色），可按分类筛选
export function Summary({ now, onEdit, onDispose, onToggleInclude, onRecordUsage }: Props) {
  const items = useStore((s) => s.items);
  const categories = useStore((s) => s.categories);
  const [filter, setFilter] = useState('');

  const sorted = useMemo(() => {
    const list = items.filter((it) => (filter ? it.categoryId === filter : true));
    return [...list].sort((a, b) => {
      if (a.disposed !== b.disposed) return a.disposed ? 1 : -1; // 在用在前
      const da = a.disposed ? a.disposalDate || '' : a.purchaseDate;
      const db = b.disposed ? b.disposalDate || '' : b.purchaseDate;
      return da < db ? 1 : -1;
    });
  }, [items, filter]);

  const inUseCount = items.filter((it) => !it.disposed).length;
  const disposedCount = items.filter((it) => it.disposed).length;

  return (
    <div className="page">
      <div className="summary-stats">
        <div className="stat">
          <div className="stat-num">{inUseCount}</div>
          <div className="stat-label">在用</div>
        </div>
        <div className="stat">
          <div className="stat-num">{disposedCount}</div>
          <div className="stat-label">已处置</div>
        </div>
        <div className="stat">
          <div className="stat-num">{items.length}</div>
          <div className="stat-label">总计</div>
        </div>
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

      {sorted.length === 0 ? (
        <div className="empty">暂无记录。</div>
      ) : (
        <div className="card-list">
          {sorted.map((it) => (
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
