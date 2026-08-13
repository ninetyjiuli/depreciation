import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { useStore, ItemInput } from '../store/useStore';
import { todayStr } from '../lib/date';

interface Props {
  open: boolean;
  itemId?: string; // 有值=编辑，无值=新增
  onClose: () => void;
}

const UNIT_OPTIONS: { value: 'year' | 'month' | 'day'; label: string }[] = [
  { value: 'year', label: '年' },
  { value: 'month', label: '月' },
  { value: 'day', label: '日' },
];

export function ItemForm({ open, itemId, onClose }: Props) {
  const categories = useStore((s) => s.categories);
  const items = useStore((s) => s.items);
  const addItem = useStore((s) => s.addItem);
  const updateItem = useStore((s) => s.updateItem);

  const editing = itemId ? items.find((it) => it.id === itemId) : undefined;

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [cost, setCost] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(todayStr());
  const [method, setMethod] = useState<'days' | 'count'>('days');
  const [lifespanValue, setLifespanValue] = useState('3');
  const [lifespanUnit, setLifespanUnit] = useState<'year' | 'month' | 'day'>('year');
  const [expectedCount, setExpectedCount] = useState('');
  const [usedCount, setUsedCount] = useState('0');
  const [includeInDaily, setIncludeInDaily] = useState(true);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // 打开时初始化表单
  useEffect(() => {
    if (!open) return;
    setError('');
    if (editing) {
      setName(editing.name);
      setCategoryId(editing.categoryId);
      setSubcategoryId(editing.subcategoryId);
      setCost(String(editing.cost));
      setPurchaseDate(editing.purchaseDate);
      setMethod(editing.method);
      setLifespanValue(String(editing.lifespanValue));
      setLifespanUnit(editing.lifespanUnit);
      setExpectedCount(String(editing.expectedCount));
      setUsedCount(String(editing.usedCount));
      setIncludeInDaily(editing.includeInDaily);
      setHasExpiry(editing.hasExpiry);
      setExpiryDate(editing.expiryDate || '');
      setNote(editing.note);
    } else {
      const firstCat = categories[0];
      setName('');
      setCategoryId(firstCat ? firstCat.id : '');
      setSubcategoryId(firstCat && firstCat.subcategories[0] ? firstCat.subcategories[0].id : '');
      setCost('');
      setPurchaseDate(todayStr());
      setMethod('days');
      setLifespanValue('3');
      setLifespanUnit('year');
      setExpectedCount('');
      setUsedCount('0');
      setIncludeInDaily(true);
      setHasExpiry(false);
      setExpiryDate('');
      setNote('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, itemId]);

  const selectedCat = categories.find((c) => c.id === categoryId);

  // 切换大分类时，若小分类不在其中则重置
  useEffect(() => {
    if (selectedCat && !selectedCat.subcategories.find((s) => s.id === subcategoryId)) {
      setSubcategoryId(selectedCat.subcategories[0]?.id || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const submit = () => {
    if (!name.trim()) return setError('请填写物品名称');
    if (!categoryId) return setError('请选择分类');
    if (!subcategoryId) return setError('请选择小分类');
    if (!(Number(cost) > 0)) return setError('购置价格需大于 0');

    const input: ItemInput = {
      name,
      categoryId,
      subcategoryId,
      cost: Number(cost),
      purchaseDate,
      method,
      lifespanValue: method === 'days' ? Number(lifespanValue) || 0 : 0,
      lifespanUnit,
      expectedCount: method === 'count' ? Number(expectedCount) || 0 : 0,
      usedCount: method === 'count' ? Number(usedCount) || 0 : 0,
      includeInDaily,
      hasExpiry,
      expiryDate: hasExpiry ? expiryDate : null,
      note,
    };

    if (editing) updateItem(editing.id, input);
    else addItem(input);
    onClose();
  };

  return (
    <Modal open={open} title={editing ? '编辑物品' : '新增物品'} onClose={onClose}>
      <div className="form">
        <label className="field">
          <span>物品名称</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：iPhone 手机" />
        </label>

        <div className="field-row">
          <label className="field">
            <span>大分类</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>小分类</span>
            <select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)}>
              {selectedCat?.subcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
              {(!selectedCat || selectedCat.subcategories.length === 0) && (
                <option value="">（无小分类）</option>
              )}
            </select>
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>购置价格（元）</span>
            <input
              type="number"
              inputMode="decimal"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="10000"
            />
          </label>
          <label className="field">
            <span>购置日期</span>
            <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
          </label>
        </div>

        <div className="field">
          <span>折旧方式</span>
          <div className="seg">
            <button
              type="button"
              className={'seg-btn' + (method === 'days' ? ' active' : '')}
              onClick={() => setMethod('days')}
            >
              按天数
            </button>
            <button
              type="button"
              className={'seg-btn' + (method === 'count' ? ' active' : '')}
              onClick={() => setMethod('count')}
            >
              按次数
            </button>
          </div>
        </div>

        {method === 'days' ? (
          <div className="field-row">
            <label className="field">
              <span>预计使用期限</span>
              <input
                type="number"
                inputMode="decimal"
                value={lifespanValue}
                onChange={(e) => setLifespanValue(e.target.value)}
                placeholder="3"
              />
            </label>
            <label className="field">
              <span>单位</span>
              <select
                value={lifespanUnit}
                onChange={(e) => setLifespanUnit(e.target.value as 'year' | 'month' | 'day')}
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <div className="field-row">
            <label className="field">
              <span>预计使用次数</span>
              <input
                type="number"
                inputMode="numeric"
                value={expectedCount}
                onChange={(e) => setExpectedCount(e.target.value)}
                placeholder="例如 500"
              />
            </label>
            <label className="field">
              <span>已用次数</span>
              <input
                type="number"
                inputMode="numeric"
                value={usedCount}
                onChange={(e) => setUsedCount(e.target.value)}
                placeholder="0"
              />
            </label>
          </div>
        )}

        <label className="check">
          <input
            type="checkbox"
            checked={includeInDaily}
            onChange={(e) => setIncludeInDaily(e.target.checked)}
          />
          <span>计入今日折旧总额</span>
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={hasExpiry}
            onChange={(e) => setHasExpiry(e.target.checked)}
          />
          <span>有保质期（用于提醒）</span>
        </label>

        {hasExpiry && (
          <label className="field">
            <span>到期日</span>
            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </label>
        )}

        <label className="field">
          <span>备注</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
        </label>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={submit}>
            {editing ? '保存' : '添加'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
