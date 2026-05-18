import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import api from '../lib/axios';

const ADMIN_NAV = [
  { to: '/admin/home',                icon: '🏠', label: '홈 (프로젝트 선택)' },
  { to: '/admin/dashboard',           icon: '📊', label: '대시보드' },
  { to: '/admin/users',               icon: '👥', label: '인사 관리' },
  { to: '/admin/org-chart',           icon: '🗂️', label: '조직 구조' },
  { to: '/admin/rooms',               icon: '💬', label: '팀(Room) 관리' },
  { to: '/admin/sales',               icon: '💰', label: '판매 실적' },
  { to: '/admin/attendance',          icon: '📋', label: '출석 관리' },
  { to: '/admin/reports',             icon: '📝', label: '활동 보고서' },
  { to: '/admin/weekly-report',       icon: '📅', label: '주간 보고서' },
  { to: '/admin/activity-fees',       icon: '💵', label: '초기 활동비' },
  { to: '/admin/monthly-commissions', icon: '🏆', label: '월간 성과급' },
  { to: '/admin/products',            icon: '📦', label: '상품 관리' },
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
    <div style={{ display: 'flex', height: '100vh', background: '#F8FAFC', overflow: 'hidden' }}>

      {/* ── 사이드바 ── */}
      <aside style={{
        width: sidebarOpen ? '240px' : '64px',
        minWidth: sidebarOpen ? '240px' : '64px',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        background: '#1E293B',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        overflowX: 'hidden',
      }}>

        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{
            width: '36px', height: '36px', minWidth: '36px',
            background: 'linear-gradient(135deg, #14B8A6, #0F766E)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '15px', color: '#fff',
            boxShadow: '0 4px 12px rgba(20,184,166,0.35)',
          }}>L</div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#F1F5F9', fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap' }}>라스북</div>
              <div style={{ color: '#64748B', fontSize: '11px', whiteSpace: 'nowrap' }}>인사·정산 포털</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              marginLeft: 'auto', color: '#475569', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: '12px', padding: '4px', flexShrink: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#94A3B8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* 프로젝트 선택 */}
        {user?.role === 'ADMIN' && sidebarOpen && projects.length > 0 && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ color: '#475569', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>프로젝트</div>
            <select
              id="projectSelector"
              value={selectedProjectId ?? ''}
              onChange={(e) => setSelectedProject(Number(e.target.value))}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#E2E8F0',
                borderRadius: '8px', padding: '7px 10px', fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {projects.map((p) => <option key={p.id} value={p.id} style={{ background: '#1E293B', color: '#fff' }}>{p.name}</option>)}
            </select>
          </div>
        )}

        {/* 네비게이션 */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={!sidebarOpen ? item.label : undefined}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: sidebarOpen ? '9px 12px' : '10px',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                borderRadius: '8px',
                color: isActive ? '#14B8A6' : '#94A3B8',
                background: isActive ? 'rgba(20,184,166,0.1)' : 'transparent',
                textDecoration: 'none', fontSize: '13.5px', fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
                borderLeft: isActive ? '3px solid #14B8A6' : '3px solid transparent',
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.getAttribute('aria-current')) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = '#E2E8F0';
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.getAttribute('aria-current')) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* 사용자 정보 */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{
                width: '32px', height: '32px', minWidth: '32px',
                background: 'linear-gradient(135deg, #14B8A6, #0F766E)',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '13px',
              }}>
                {user?.name?.charAt(0)}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ color: '#F1F5F9', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <div style={{ color: '#475569', fontSize: '11px', whiteSpace: 'nowrap' }}>{user?.employeeId}</div>
              </div>
              <button id="logoutBtn" onClick={handleLogout} title="로그아웃"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '16px', padding: '2px', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
              >🚪</button>
            </div>
          ) : (
            <button onClick={handleLogout} title="로그아웃"
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '18px', padding: '8px', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
              onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
            >🚪</button>
          )}
        </div>
      </aside>

      {/* ── 메인 콘텐츠 ── */}
      <main style={{ flex: 1, overflowY: 'auto', background: '#F8FAFC' }}>
        <Outlet />
      </main>
    </div>
  );
}
