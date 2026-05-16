import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';

function fmt(n: number) { return `${n.toLocaleString('ko-KR')}원`; }

export default function StaffSales() {
  const { user } = useAuthStore();
  const [sales, setSales] = useState<any[]>([]);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    if (user) api.get(`/sales?employeeId=${user.employeeId}&month=${month}`).then((r) => setSales(r.data));
  }, [user, month]);

  const totalNet = sales.reduce((a, s) => a + s.netAmount, 0);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">내 판매 실적</h1>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
          className="bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-indigo-400 font-semibold mb-2">이번 달 순매출</div>
          <div className="text-2xl font-bold text-white">{fmt(totalNet)}</div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-emerald-400 font-semibold mb-2">유치 건수</div>
          <div className="text-2xl font-bold text-white">{sales.length}건</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        {sales.length === 0 ? (
          <div className="text-center py-12 text-slate-600">이번 달 실적이 없습니다</div>
        ) : (
          <div className="divide-y divide-white/5">
            {sales.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{s.customerName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.paymentMethod === 'CARD' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {s.paymentMethod === 'CARD' ? '카드' : '현금'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.product?.series}시리즈 {s.product?.language} · {format(new Date(s.saleDate), 'MM.dd')} · {s.salesWeek}주차</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-indigo-300">{fmt(s.netAmount)}</div>
                  {s.deductedFee > 0 && <div className="text-xs text-orange-400">수수료 -{fmt(s.deductedFee)}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
