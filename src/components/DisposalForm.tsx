import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { useStore } from '../store/useStore';
import { todayStr } from '../lib/date';
import { money } from '../lib/calc';

interface Props {
  open: boolean;
  itemId?: string;
  onClose: () => void;
}

// 后续处理：例如旧手机卖掉换回 1000 元，记录后重新计算日均摊销
export function DisposalForm({ open, itemId, onClose }: Props) {
  const items = useStore((s) => s.items);
  const disposeItem = useStore((s) => s.disposeItem);

  const item = itemId ? items.find((it) => it.id === itemId) : undefined;

  const [disposalDate, setDisposalDate] = useState(todayStr());
  const [residualValue, setResidualValue] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    setDisposalDate(todayStr());
    setResidualValue('');
    setNote('');
  }, [open, itemId]);

  const submit = () => {
    if (!item) return;
    disposeItem(item.id, disposalDate, Number(residualValue) || 0, note.trim());
    onClose();
  };

  return (
    <Modal open={open} title="后续处理 / 处置" onClose={onClose}>
      {item && (
        <div className="form">
          <div className="disposal-info">
            物品：<b>{item.name}</b>
            <br />
            原购置价：{money(item.cost)}
          </div>

          <label className="field">
            <span>处置日期</span>
            <input type="date" value={disposalDate} onChange={(e) => setDisposalDate(e.target.value)} />
          </label>

          <label className="field">
            <span>回本金额（卖掉所得，元）</span>
            <input
              type="number"
              inputMode="decimal"
              value={residualValue}
              onChange={(e) => setResidualValue(e.target.value)}
              placeholder="例如 1000"
            />
          </label>

          <label className="field">
            <span>备注（可选）</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="例如：已二手卖给朋友"
            />
          </label>

          <div className="disposal-preview">
            实际摊销金额 = {money(item.cost)} − {money(Number(residualValue) || 0)} ={' '}
            <b>{money(Math.max(item.cost - (Number(residualValue) || 0), 0))}</b>
          </div>

          <div className="form-actions">
            <button className="btn btn-ghost" onClick={onClose}>
              取消
            </button>
            <button className="btn btn-primary" onClick={submit}>
              确认处置
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
