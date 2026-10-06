import { lazy, Suspense, useState } from 'react';
import { useAppSelector } from './app/hooks';
import { selectFilterCounts } from './features/assignments/assignmentsSelectors';
import AssignmentForm from './features/assignments/AssignmentForm';
import AssignmentList from './features/assignments/AssignmentList';
import FilterTabs from './features/assignments/FilterTabs';
import { useTheme } from './context/ThemeContext';
import { FILTER_LABELS } from './types/assignment';
import { ListTodo, Calendar, AlertCircle, CheckCircle2, LayoutList, Circle, AlertTriangle, Moon, Sun, BarChart3 } from 'lucide-react';

// Nâng cấp Phần B — trang Thống kê được tải lười (code-split thành chunk riêng)
const StatisticsPanel = lazy(() => import('./features/statistics/StatisticsPanel'));

/** Skeleton hiện trong lúc chunk Thống kê đang tải */
function StatisticsFallback() {
  return (
    <div className="statistics" aria-busy="true" aria-label="Đang tải thống kê">
      <div className="statistics__cards">
        {[0, 1, 2].map((i) => (
          <div key={i} className="stat-card">
            <div className="skeleton skeleton--badge" />
            <div className="skeleton skeleton--subject" />
          </div>
        ))}
      </div>
      <div className="skeleton" style={{ width: '100%', height: 180 }} />
    </div>
  );
}

function StatCard({ label, value, tone, icon: Icon }: { label: string; value: number; tone: string; icon: React.ElementType }) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <Icon className="stat-card__icon" size={20} strokeWidth={2} />
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}

/**
 * Nâng cấp Phần A — nút đổi chủ đề: consumer DUY NHẤT của ThemeContext,
 * nên đổi theme không làm re-render bất kỳ component nào khác của app.
 */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-pressed={isDark}
      title={isDark ? 'Chuyển sang chủ đề sáng' : 'Chuyển sang chủ đề tối'}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
      {isDark ? 'Sáng' : 'Tối'}
    </button>
  );
}

export default function App() {
  const counts = useAppSelector(selectFilterCounts);
  // Nâng cấp Phần B — tab chuyển giữa danh sách và trang Thống kê (sẽ tải lười bằng React.lazy)
  const [view, setView] = useState<'list' | 'stats'>('list');

  return (
    <div className="page">
      <header className="page__header">
        <ThemeToggle />
        <h1>
          <span aria-hidden="true">📅</span> Student Deadline Tracker
        </h1>
        <p>Theo dõi deadline bài tập cá nhân — không bỏ lỡ, không nộp trễ</p>
      </header>

      <section className="stats" aria-label="Thống kê">
        <StatCard label="Tổng bài tập" value={counts.all} tone="all" icon={ListTodo} />
        <StatCard label={FILTER_LABELS.incomplete} value={counts.incomplete} tone="incomplete" icon={Calendar} />
        <StatCard label={FILTER_LABELS.overdue} value={counts.overdue} tone="overdue" icon={AlertCircle} />
        <StatCard label={FILTER_LABELS.completed} value={counts.completed} tone="completed" icon={CheckCircle2} />
      </section>

      <main className="page__main">
        <section className="panel">
          <h2>Thêm bài tập mới</h2>
          <AssignmentForm />
        </section>

        <div className="view-tabs" role="tablist" aria-label="Chế độ xem">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'list'}
            className={view === 'list' ? 'view-tab view-tab--active' : 'view-tab'}
            onClick={() => setView('list')}
          >
            <LayoutList size={15} /> Danh sách
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'stats'}
            className={view === 'stats' ? 'view-tab view-tab--active' : 'view-tab'}
            onClick={() => setView('stats')}
          >
            <BarChart3 size={15} /> Thống kê
          </button>
        </div>

        {view === 'list' ? (
          <section className="panel">
            <h2>Danh sách bài tập</h2>
            <FilterTabs>
              <FilterTabs.Tab value="all" icon={LayoutList}>{FILTER_LABELS.all}</FilterTabs.Tab>
              <FilterTabs.Tab value="incomplete" icon={Circle}>{FILTER_LABELS.incomplete}</FilterTabs.Tab>
              <FilterTabs.Tab value="overdue" icon={AlertTriangle}>{FILTER_LABELS.overdue}</FilterTabs.Tab>
              <FilterTabs.Tab value="completed" icon={CheckCircle2}>{FILTER_LABELS.completed}</FilterTabs.Tab>
            </FilterTabs>
            <AssignmentList />
          </section>
        ) : (
          <section className="panel">
            <h2>Thống kê bài tập</h2>
            <Suspense fallback={<StatisticsFallback />}>
              <StatisticsPanel />
            </Suspense>
          </section>
        )}
      </main>

      <footer className="page__footer">
       Lập trình Web Nâng Cao — TypeScript nâng cao · React Design Patterns · Redux Toolkit
      </footer>
    </div>
  );
}
