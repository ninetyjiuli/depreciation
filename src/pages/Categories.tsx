import { useState } from 'react';
import { useStore } from '../store/useStore';

const PRESET_COLORS = ['#2f6fed', '#f0883e', '#9b59b6', '#27ae60', '#e74c3c', '#16a2b8', '#f1c40f', '#34495e'];

export function Categories() {
  const categories = useStore((s) => s.categories);
  const addCategory = useStore((s) => s.addCategory);
  const renameCategory = useStore((s) => s.renameCategory);
  const deleteCategory = useStore((s) => s.deleteCategory);
  const addSubcategory = useStore((s) => s.addSubcategory);
  const renameSubcategory = useStore((s) => s.renameSubcategory);
  const deleteSubcategory = useStore((s) => s.deleteSubcategory);

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editingCat, setEditingCat] = useState<{ id: string; name: string } | null>(null);
  const [editingSub, setEditingSub] = useState<{ cat: string; sub: string; name: string } | null>(null);
  const [newSub, setNewSub] = useState<{ cat: string; name: string }>({ cat: '', name: '' });
  const [msg, setMsg] = useState('');

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 2500);
  };

  const handleAddCat = () => {
    if (!newName.trim()) return flash('请填写分类名称');
    addCategory(newName, newColor);
    setNewName('');
    flash('已新增大分类');
  };

  const handleDeleteCat = (id: string) => {
    const r = deleteCategory(id);
    flash(r.msg);
  };

  const handleDeleteSub = (cat: string, sub: string) => {
    const r = deleteSubcategory(cat, sub);
    flash(r.msg);
  };

  return (
    <div className="page">
      <div className="cat-add">
        <div className="field">
          <span>新增大分类</span>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="如：家具" />
        </div>
        <div className="color-row">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              className={'color-dot' + (newColor === c ? ' active' : '')}
              style={{ backgroundColor: c }}
              onClick={() => setNewColor(c)}
              aria-label={c}
            />
          ))}
        </div>
        <button className="btn btn-primary" onClick={handleAddCat}>
          添加大分类
        </button>
      </div>

      {msg && <div className="toast">{msg}</div>}

      <div className="cat-list">
        {categories.map((c) => (
          <div className="cat-block" key={c.id}>
            <div className="cat-head">
              <span className="cat-color" style={{ backgroundColor: c.color }} />
              {editingCat?.id === c.id ? (
                <input
                  className="cat-edit-input"
                  value={editingCat.name}
                  onChange={(e) => setEditingCat({ id: c.id, name: e.target.value })}
                  onBlur={() => {
                    renameCategory(c.id, editingCat.name);
                    setEditingCat(null);
                  }}
                  autoFocus
                />
              ) : (
                <span className="cat-name">{c.name}</span>
              )}
              <span className="cat-ops">
                <button
                  className="btn btn-mini btn-ghost"
                  onClick={() => setEditingCat({ id: c.id, name: c.name })}
                >
                  改名
                </button>
                <button className="btn btn-mini btn-danger-ghost" onClick={() => handleDeleteCat(c.id)}>
                  删除
                </button>
              </span>
            </div>

            <div className="sub-list">
              {c.subcategories.map((sub) => (
                <div className="sub-item" key={sub.id}>
                  {editingSub?.sub === sub.id ? (
                    <input
                      className="sub-edit-input"
                      value={editingSub.name}
                      onChange={(e) => setEditingSub({ cat: c.id, sub: sub.id, name: e.target.value })}
                      onBlur={() => {
                        renameSubcategory(c.id, sub.id, editingSub.name);
                        setEditingSub(null);
                      }}
                      autoFocus
                    />
                  ) : (
                    <span className="sub-name">{sub.name}</span>
                  )}
                  <span className="sub-ops">
                    <button
                      className="btn btn-mini btn-ghost"
                      onClick={() => setEditingSub({ cat: c.id, sub: sub.id, name: sub.name })}
                    >
                      改名
                    </button>
                    <button
                      className="btn btn-mini btn-danger-ghost"
                      onClick={() => handleDeleteSub(c.id, sub.id)}
                    >
                      删除
                    </button>
                  </span>
                </div>
              ))}
              {c.subcategories.length === 0 && <div className="sub-empty">暂无小分类</div>}
            </div>

            <div className="sub-add">
              <input
                placeholder="新增小分类，如：耳机"
                value={newSub.cat === c.id ? newSub.name : ''}
                onChange={(e) => setNewSub({ cat: c.id, name: e.target.value })}
              />
              <button
                className="btn btn-mini"
                onClick={() => {
                  const name = newSub.cat === c.id ? newSub.name : '';
                  if (!name.trim()) return flash('请填写小分类名称');
                  addSubcategory(c.id, name);
                  setNewSub({ cat: '', name: '' });
                }}
              >
                添加
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="hint">提示：分类只记录物品引用，重命名/删除不影响已有物品的历史数据。</p>
    </div>
  );
}
