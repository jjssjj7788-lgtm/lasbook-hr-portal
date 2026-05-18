import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

function fmt(n: number) { return `${n.toLocaleString('ko-KR')}원`; }

export default function StaffDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ salesCount: 0, netTotal: 0, reportCount: 0 });
  const [todayReport, setTodayReport] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const month = format(new Date(), 'yyyy-MM');
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get(`/sales?employeeId=${user.employeeId}&month=${month}`),
      api.get(`/activity-reports?employeeId=${user.employeeId}&month=${month}`),
    ]).then(([salesRes, reportsRes]) => {
      const sales = salesRes.data;
      const reports = reportsRes.data;
      setStats({
        salesCount: sales.length,
        netTotal: sales.reduce((a: number, s: any) => a + s.netAmount, 0),
        reportCount: reports.length,
      });
      setRecentSales(sales.slice(0, 3));
      // 오늘 보고서 확인
      const todayR = reports.find((r: any) => r.submittedAt?.startsWith(today));
      setTodayReport(todayR ?? null);
    });
  }, [user]);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* 인사말 */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-white">안녕하세요, {user?.name}님 👋</h1>
        <p className="text-slate-400 text-sm mt-1">{format(new Date(), 'yyyy년 MM월 dd일 (EEE)', { locale: ko })}</p>
      </div>

      {/* 오늘 보고서 알림 */}
      {!todayReport ? (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <div className="text-amber-300 font-semibold text-sm">오늘 보고서를 아직 작성하지 않았습니다</div>
              <div className="text-amber-500/70 text-xs mt-0.5">일일 활동 보고서를 제출해 주세요</div>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard/reports')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-xl transition-all flex-shrink-0">
            지금 작성
          </button>
        </div>
      ) : (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <div className="text-emerald-300 font-semibold text-sm">오늘 보고서 제출 완료</div>
            <div className="text-emerald-500/70 text-xs mt-0.5">가망고객 {todayReport.prospectCount}명 · {format(new Date(todayReport.submittedAt), 'HH:mm')} 제출</div>
          </div>
        </div>
      )}

      {/* 이번 달 통계 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-indigo-400 font-semibold mb-2">이번 달 유치건수</div>
          <div className="text-3xl font-bold text-white">{stats.salesCount}<span className="text-sm text-slate-500 ml-1">건</span></div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-emerald-400 font-semibold mb-2">이번 달 순매출</div>
          <div className="text-xl font-bold text-white">{fmt(stats.netTotal)}</div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-amber-400 font-semibold mb-2">보고서 제출</div>
          <div className="text-3xl font-bold text-white">{stats.reportCount}<span className="text-sm text-slate-500 ml-1">건</span></div>
        </div>
      </div>

      {/* 빠른 메뉴 */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate('/dashboard/sales')}
          className="p-6 bg-indigo-600/10 border-2 border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-600/20 rounded-2xl text-left transition-all group">
          <div className="text-3xl mb-3">💰</div>
          <div className="text-white font-bold text-lg group-hover:text-indigo-300 transition-colors">매출 등록</div>
          <div className="text-slate-500 text-sm mt-1">신규 계약 실적을 등록합니다</div>
        </button>
        <button onClick={() => navigate('/dashboard/reports')}
          className="p-6 bg-emerald-600/10 border-2 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-600/20 rounded-2xl text-left transition-all group">
          <div className="text-3xl mb-3">📝</div>
          <div className="text-white font-bold text-lg group-hover:text-emerald-300 transition-colors">일일 보고서</div>
          <div className="text-slate-500 text-sm mt-1">오늘의 활동을 기록합니다</div>
        </button>
      </div>

      {/* 최근 매출 */}
      {recentSales.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-slate-400 mb-3">최근 매출</div>
          <div className="bg-slate-900 border border-white/5 rounded-2xl divide-y divide-white/5">
            {recentSales.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-white text-sm font-medium">{s.customerName}</div>
                  <div className="text-slate-500 text-xs">{format(new Date(s.saleDate), 'MM.dd')} · {s.product?.series}시리즈</div>
                </div>
                <div className="text-indigo-300 font-semibold text-sm">{fmt(s.netAmount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
