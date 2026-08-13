import { Item } from '../types';
import { calcDepreciation, money } from '../lib/calc';
import { CategoryBadge } from './CategoryBadge';

interface Props {
  item: Item;
  now: string;
  onEdit: (id: string) => void;
  onDispose: (id: string) => void;
  onToggleInclude: (id: string) => void;
  onRecordUsage: (id: string) => void;
}

function lifetimeText(item: Item): string {
  const unitMap: Record<string, string> = { year: '年', month: '个月', day: '天' };
  return `${item.lifespanValue} ${unitMap[item.lifespanUnit] || ''}`;
}

export function ItemCard({ item, now, onEdit, onDispose, onToggleInclude, onRecordUsage }: Props) {
  const d = calcDepreciation(item, now);

  // 处置后，主数字含义调整为“最终日均摊销”
  const aLabel = item.disposed ? '最终日均摊销' : d.primaryALabel;
  const bLabel = d.primaryBLabel;

  return (
    <div className={'card' + (item.disposed ? ' card-disposed' : '')}>
      <div className="card-top">
        <div className="card-name">{item.name}</div>
        <CategoryBadge categoryId={item.categoryId} subcategoryId={item.subcategoryId} />
      </div>

      <div className="card-amounts">
        <div className="amount-box">
          <div className="amount-label">{aLabel}</div>
          <div className="amount-value">{money(d.primaryA)}</div>
        </div>
        <div className="amount-box">
          <div className="amount-label">{bLabel}</div>
          <div className="amount-value">{money(d.primaryB)}</div>
        </div>
      </div>

      <div className="card-meta">
        <span>购置 {money(item.cost)}</span>
        {item.disposed ? (
          <>
            <span>处置 {item.disposalDate}</span>
            <span>回本 {money(item.residualValue)}</span>
          </>
        ) : item.method === 'days' ? (
          <span>已用 {d.elapsedDays} 天 / 共 {d.lifespanDays} 天</span>
        ) : (
          <span>
            已用 {item.usedCount} / {item.expectedCount} 次
          </span>
        )}
      </div>

      {!item.disposed && (
        <div className="card-actions">
          <label className="switch">
            <input
              type="checkbox"
              checked={item.includeInDaily}
              onChange={() => onToggleInclude(item.id)}
            />
            <span className="switch-track" />
            <span className="switch-text">计入今日折旧</span>
          </label>

          {item.method === 'count' && (
            <button className="btn btn-mini" onClick={() => onRecordUsage(item.id)}>
              记录一次使用
            </button>
          )}

          <button className="btn btn-mini btn-ghost" onClick={() => onEdit(item.id)}>
            编辑
          </button>
          <button className="btn btn-mini btn-danger-ghost" onClick={() => onDispose(item.id)}>
            处置
          </button>
        </div>
      )}
    </div>
  );
}
