import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';

function fmt(n: number) { return `${n.toLocaleString('ko-KR')}원`; }

export default function StaffDashboard() {
  const { user } = useAuthStore();
  const [commissions, setCommissions] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const month = format(new Date(), 'yyyy-MM');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get(`/monthly-commissions?employeeId=${user.employeeId}&month=${month}`),
      api.get(`/activity-fees?employeeId=${user.employeeId}`),
      api.get(`/sales?employeeId=${user.employeeId}&month=${month}`),
    ]).then(([c, f, s]) => {
      setCommissions(c.data);
      setFees(f.data);
      setSales(s.data);
    });
  }, [user]);

  const thisMonthNet = sales.reduce((a, s) => a + s.netAmount, 0);
  const myCommission = commissions[0];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">안녕하세요, {user?.name}님 👋</h1>
        <p className="text-slate-400 text-sm mt-1">{user?.position?.name} · {user?.project?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-2">이번 달 순매출</div>
          <div className="text-2xl font-bold text-white">{fmt(thisMonthNet)}</div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">달성 등급</div>
          <div className="text-2xl font-bold text-white">{myCommission?.achievementGrade || '-'}</div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2">예상 세후 성과급</div>
          <div className="text-2xl font-bold text-white">{fmt(myCommission?.netAmount ?? 0)}</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">활동비 내역</h2>
        {fees.length === 0 ? (
          <div className="text-slate-600 text-sm text-center py-4">활동비 내역이 없습니다</div>
        ) : (
          fees.map((f) => (
            <div key={f.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
              <span className="text-sm text-white">{f.payMonth} ({f.paymentRound}차)</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-indigo-300">{fmt(f.netAmount)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${f.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                  {f.paymentStatus === 'PAID' ? '지급완료' : '대기'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
