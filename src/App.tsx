import { useState } from 'react';
import { useNow } from './lib/useNow';
import { useStore } from './store/useStore';
import { Dashboard } from './pages/Dashboard';
import { Summary } from './pages/Summary';
import { Reminders } from './pages/Reminders';
import { Categories } from './pages/Categories';
import { Settings } from './pages/Settings';
import { ItemForm } from './components/ItemForm';
import { DisposalForm } from './components/DisposalForm';

type Tab = 'dashboard' | 'summary' | 'reminders' | 'categories' | 'settings';

const TABS: { key: Tab; label: string }[] = [
  { key: 'dashboard', label: '首页' },
  { key: 'summary', label: '汇总' },
  { key: 'reminders', label: '提醒' },
  { key: 'categories', label: '分类' },
  { key: 'settings', label: '设置' },
];

export default function App() {
  const now = useNow();
  const toggleInclude = useStore((s) => s.toggleInclude);
  const recordUsage = useStore((s) => s.recordUsage);

  const [tab, setTab] = useState<Tab>('dashboard');
  const [formOpen, setFormOpen] = useState(false);
  const [formItemId, setFormItemId] = useState<string | undefined>(undefined);
  const [disposeOpen, setDisposeOpen] = useState(false);
  const [disposeItemId, setDisposeItemId] = useState<string | undefined>(undefined);

  const openAdd = () => {
    setFormItemId(undefined);
    setFormOpen(true);
  };
  const openEdit = (id: string) => {
    setFormItemId(id);
    setFormOpen(true);
  };
  const openDispose = (id: string) => {
    setDisposeItemId(id);
    setDisposeOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setFormItemId(undefined);
  };
  const closeDispose = () => {
    setDisposeOpen(false);
    setDisposeItemId(undefined);
  };

  const cardHandlers = {
    now,
    onEdit: openEdit,
    onDispose: openDispose,
    onToggleInclude: toggleInclude,
    onRecordUsage: recordUsage,
  };

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-title">资产折旧管家</span>
      </header>

      <main className="app-main">
        {tab === 'dashboard' && <Dashboard {...cardHandlers} />}
        {tab === 'summary' && <Summary {...cardHandlers} />}
        {tab === 'reminders' && <Reminders now={now} />}
        {tab === 'categories' && <Categories />}
        {tab === 'settings' && <Settings />}
      </main>

      <button className="fab" onClick={openAdd} aria-label="新增物品">
        +
      </button>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={'tab' + (tab === t.key ? ' active' : '')}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <ItemForm open={formOpen} itemId={formItemId} onClose={closeForm} />
      <DisposalForm open={disposeOpen} itemId={disposeItemId} onClose={closeDispose} />
    </div>
  );
}
