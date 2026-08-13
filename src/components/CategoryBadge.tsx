import { useStore } from '../store/useStore';

interface Props {
  categoryId: string;
  subcategoryId: string;
}

// 根据分类 id 渲染带颜色的徽标（大分类名 / 小分类名）
export function CategoryBadge({ categoryId, subcategoryId }: Props) {
  const categories = useStore((s) => s.categories);
  const cat = categories.find((c) => c.id === categoryId);
  const sub = cat?.subcategories.find((s) => s.id === subcategoryId);
  const color = cat?.color || '#888';

  return (
    <span className="badge" style={{ backgroundColor: color + '22', color }}>
      {cat?.name || '未分类'}
      {sub ? <span className="badge-sub"> / {sub.name}</span> : null}
    </span>
  );
}
