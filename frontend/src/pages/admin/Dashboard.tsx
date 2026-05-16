import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface KpiData {
  totalNet: number;
  totalActual: number;
  totalFee: number;
  count: number;
}

function KpiCard({ title, value, sub, color }: { title: string; value: string; sub?: string; color: string }) {
  return (
    <div className={`bg-slate-900 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all`}>
      <div className={`text-xs font-semibold uppercase tracking-widest ${color} mb-3`}>{title}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {sub && <div className="text-sm text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const { selectedProjectId } = useAuthStore();
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    Promise.all([
      api.get(`/sales/summary?projectId=${selectedProjectId}&month=${month}`),
      api.get(`/users?projectId=${selectedProjectId}`),
      api.get(`/sales?projectId=${selectedProjectId}&month=${month}`),
    ])
      .then(([kpiRes, usersRes, salesRes]) => {
        setKpi(kpiRes.data);
        setUsers(usersRes.data);
        setRecentSales(salesRes.data.slice(0, 10));
      })
      .finally(() => setLoading(false));
  }, [selectedProjectId, month]);

  const fmt = (n: number) => `${n.toLocaleString('ko-KR')}원`;
  const positionColor: Record<string, string> = {
    TEBA: 'bg-purple-500/20 text-purple-300',
    DOJE: 'bg-blue-500/20 text-blue-300',
    TRAINEE: 'bg-emerald-500/20 text-emerald-300',
    MANAGER: 'bg-amber-500/20 text-amber-300',
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">대시보드</h1>
          <p className="text-slate-400 text-sm mt-1">실시간 영업 현황을 한눈에 확인하세요</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* KPI 카드 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-white/5 rounded-2xl p-6 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="당월 순매출" value={fmt(kpi?.totalNet ?? 0)} sub="수수료 차감 기준" color="text-indigo-400" />
          <KpiCard title="실결제 총액" value={fmt(kpi?.totalActual ?? 0)} sub="카드+현금 합산" color="text-blue-400" />
          <KpiCard title="카드 수수료" value={fmt(kpi?.totalFee ?? 0)} sub="공제 합계 (2.5%)" color="text-orange-400" />
          <KpiCard title="유치 건수" value={`${kpi?.count ?? 0}건`} sub={`${month} 기준`} color="text-emerald-400" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 인원 현황 */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">인원 현황</h2>
            <span className="text-xs text-slate-500">{users.filter((u) => u.isActive).length}명 재직 중</span>
          </div>
          {/* 직급별 집계 */}
          {['TEBA', 'DOJE', 'MANAGER', 'TRAINEE'].map((code) => {
            const cnt = users.filter((u) => u.position?.code === code).length;
            const labels: Record<string, string> = { TEBA: '테바', DOJE: '도제', MANAGER: '띠 매니저', TRAINEE: '수련생' };
            return cnt > 0 ? (
              <div key={code} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${positionColor[code]}`}>{labels[code]}</span>
                <span className="text-white font-semibold">{cnt}명</span>
              </div>
            ) : null;
          })}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-indigo-500/10 rounded-full h-1.5">
              <div
                className="bg-indigo-500 rounded-full h-1.5 transition-all"
                style={{ width: `${Math.min(100, (users.filter((u) => u.position?.code === 'TEBA').length / Math.max(1, users.length)) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">{users.length}명 총원</span>
          </div>
        </div>

        {/* 최근 판매 실적 */}
        <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">최근 판매 실적</h2>
          {recentSales.length === 0 ? (
            <div className="text-center py-10 text-slate-600 text-sm">이번 달 실적이 없습니다</div>
          ) : (
            <div className="space-y-2">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium truncate">{sale.customerName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${sale.paymentMethod === 'CARD' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {sale.paymentMethod === 'CARD' ? '카드' : '현금'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {sale.product?.series}시리즈 {sale.product?.language} · {sale.employee?.name} · {sale.salesWeek}주차
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-white font-semibold text-sm">{fmt(sale.netAmount)}</div>
                    {sale.deductedFee > 0 && (
                      <div className="text-xs text-orange-400">-{fmt(sale.deductedFee)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
