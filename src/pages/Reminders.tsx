import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { expiryInfo } from '../lib/date';
import { CategoryBadge } from '../components/CategoryBadge';

interface Props {
  now: string;
}

// 提醒页：有保质期的物品，按剩余天数升序，临近/过期高亮
export function Reminders({ now }: Props) {
  const items = useStore((s) => s.items);

  const list = useMemo(() => {
    return items
      .filter((it) => it.hasExpiry && it.expiryDate)
      .map((it) => ({ it, info: expiryInfo(it.expiryDate, now)! }))
      .sort((a, b) => a.info.daysRemaining - b.info.daysRemaining);
  }, [items, now]);

  if (list.length === 0) {
    return (
      <div className="page">
        <div className="empty">
          暂无保质期提醒。
          <br />
          在新增/编辑物品时勾选“有保质期”并填写到期日即可。
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {list.map(({ it, info }) => {
        let cls = 'remind-normal';
        if (info.expired) cls = 'remind-expired';
        else if (info.daysRemaining <= 3) cls = 'remind-urgent';
        else if (info.daysRemaining <= 30) cls = 'remind-soon';

        let text = `还有 ${info.daysRemaining} 天到期`;
        if (info.expired) text = `已过期 ${Math.abs(info.daysRemaining)} 天`;
        else if (info.dueToday) text = '今天到期';

        return (
          <div key={it.id} className={'remind-card ' + cls}>
            <div className="remind-top">
              <span className="remind-name">{it.name}</span>
              <CategoryBadge categoryId={it.categoryId} subcategoryId={it.subcategoryId} />
            </div>
            <div className="remind-row">
              <span>到期日 {it.expiryDate}</span>
              <span className="remind-days">{text}</span>
            </div>
            {it.disposed && <div className="remind-note">（已处置）</div>}
          </div>
        );
      })}
    </div>
  );
}
