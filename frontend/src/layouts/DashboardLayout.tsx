import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import api from '../lib/axios';

const ADMIN_NAV = [
  { to: '/admin/dashboard',            icon: '📊', label: '대시보드' },
  { to: '/admin/users',                icon: '👥', label: '인사 관리' },
  { to: '/admin/sales',                icon: '💰', label: '판매 실적' },
  { to: '/admin/attendance',           icon: '📋', label: '출석 관리' },
  { to: '/admin/reports',              icon: '📝', label: '활동 보고서' },
  { to: '/admin/activity-fees',        icon: '💵', label: '초기 활동비' },
  { to: '/admin/monthly-commissions',  icon: '🏆', label: '월간 성과급' },
  { to: '/admin/products',             icon: '📦', label: '상품 관리' },
];

const STAFF_NAV = [
  { to: '/dashboard',         icon: '📊', label: '내 현황' },
  { to: '/dashboard/sales',   icon: '💰', label: '내 판매 실적' },
  { to: '/dashboard/reports', icon: '📝', label: '활동 보고서' },
];

export default function DashboardLayout() {
  const { user, token, logout, selectedProjectId, setSelectedProject } = useAuthStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (user?.role === 'ADMIN') {
      api.get('/projects').then((r) => {
        setProjects(r.data);
        if (!selectedProjectId && r.data.length > 0) setSelectedProject(r.data[0].id);
      });
    }
  }, [token, user]);

  const nav = user?.role === 'ADMIN' ? ADMIN_NAV : STAFF_NAV;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* 사이드바 */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} transition-all duration-300 flex flex-col bg-slate-900 border-r border-white/5 flex-shrink-0`}>
        {/* 로고 영역 */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-600/30">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">라스북</div>
              <div className="text-xs text-slate-400 truncate">인사·정산 포털</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-slate-500 hover:text-white transition-colors flex-shrink-0"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* 프로젝트 드롭다운 (Admin만) */}
        {user?.role === 'ADMIN' && sidebarOpen && projects.length > 0 && (
          <div className="px-3 py-3 border-b border-white/5">
            <label className="block text-xs text-slate-500 mb-1.5 font-medium">프로젝트 전환</label>
            <select
              id="projectSelector"
              value={selectedProjectId ?? ''}
              onChange={(e) => setSelectedProject(Number(e.target.value))}
              className="w-full bg-slate-800 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* 네비게이션 */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium group
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* 사용자 정보 */}
        <div className="p-3 border-t border-white/5">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-300 text-xs font-bold">{user?.name?.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user?.name}</div>
                <div className="text-xs text-slate-500 truncate">{user?.employeeId}</div>
              </div>
              <button
                id="logoutBtn"
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                title="로그아웃"
              >
                🚪
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 text-slate-500 hover:text-red-400 transition-colors"
              title="로그아웃"
            >
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <Outlet />
      </main>
    </div>
  );
}
