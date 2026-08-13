import { useRef, useState } from 'react';
import { useStore } from '../store/useStore';

export function Settings() {
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const resetAll = useStore((s) => s.resetAll);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `折旧管家备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash('已导出备份文件');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const r = importData(text);
      flash(r.msg);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('确定清空所有物品与分类？此操作不可恢复，建议先导出备份。')) {
      resetAll();
      flash('已重置为初始数据');
    }
  };

  return (
    <div className="page">
      <div className="settings-group">
        <h3>数据备份</h3>
        <p className="hint">数据保存在本机浏览器（localStorage）。换手机或清缓存前，请先导出备份。</p>
        <div className="settings-btns">
          <button className="btn btn-primary" onClick={handleExport}>
            导出备份（JSON）
          </button>
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            导入备份
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
        </div>
      </div>

      <div className="settings-group">
        <h3>危险操作</h3>
        <button className="btn btn-danger" onClick={handleReset}>
          清空所有数据
        </button>
      </div>

      <div className="settings-group">
        <h3>关于</h3>
        <p className="hint">
          资产折旧管家 v1.0 · 自用 PWA
          <br />
          支持按天数 / 按次数折旧、实时今日折旧、后续处置回本、保质期提醒。
          <br />
          可“添加到主屏幕”当作原生 App 使用。
        </p>
      </div>

      {msg && <div className="toast">{msg}</div>}
    </div>
  );
}
