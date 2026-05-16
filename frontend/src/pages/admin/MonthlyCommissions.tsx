import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';

function fmt(n: number) { return `${n.toLocaleString('ko-KR')}원`; }

function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return <span className="text-slate-600 text-xs">미달성</span>;
  const isDdi = grade.includes('띠');
  const level = parseInt(grade);
  const intensity = Math.min(Math.floor(level / 3), 3);
  const colors = [
    'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'bg-red-500/20 text-red-300 border-red-500/30',
  ];
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${colors[intensity]}`}>
      {grade}
    </span>
  );
}

export default function AdminMonthlyCommissions() {
  const { selectedProjectId } = useAuthStore();
  const [commissions, setCommissions] = useState<any[]>([]);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/monthly-commissions?projectId=${selectedProjectId}&month=${month}`);
      setCommissions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (selectedProjectId) load(); }, [selectedProjectId, month]);

  const handleCalcAll = async () => {
    if (!confirm(`${month} 월 전체 성과급을 계산하시겠습니까?`)) return;
    setCalcLoading(true);
    try {
      await api.post('/monthly-commissions/calculate-project', { projectId: selectedProjectId, settlementMonth: month });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || '계산 실패');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleExtract = async () => {
    try {
      const { data } = await api.get(`/monthly-commissions/payout?projectId=${selectedProjectId}&month=${month}`);
      const text = data.lines.join('\n');
      if (text) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        alert('추출할 지급 대상이 없습니다.');
      }
    } catch {
      alert('추출 실패');
    }
  };

  const handleStatusToggle = async (id: number, current: string) => {
    await api.patch(`/monthly-commissions/${id}/status`, { status: current === 'PAID' ? 'PENDING' : 'PAID' });
    load();
  };

  const totalNet = commissions.reduce((a, c) => a + c.netAmount, 0);
  const totalGross = commissions.reduce((a, c) => a + c.totalGross, 0);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">월간 성과급</h1>
          <p className="text-slate-400 text-sm mt-1">순매출 기준 등급 자동 산정 (200만원 = 1건)</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={handleCalcAll} disabled={calcLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all">
            {calcLoading ? '⏳ 계산 중...' : '🔄 전체 재계산'}
          </button>
          <button onClick={handleExtract}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-amber-500 hover:bg-amber-400 text-black'}`}>
            {copied ? '✅ 복사 완료!' : '📋 원터치 이체 추출'}
          </button>
        </div>
      </div>

      {/* 월간 합계 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-2">세전 총발생액</div>
          <div className="text-2xl font-bold text-white">{fmt(totalGross)}</div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">세후 실수령액</div>
          <div className="text-2xl font-bold text-white">{fmt(totalNet)}</div>
          <div className="text-xs text-slate-500 mt-1">3.3% 원천징수 후</div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-2">정산 대상</div>
          <div className="text-2xl font-bold text-white">{commissions.filter((c) => c.totalGross > 0).length}명</div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2">지급 완료</div>
          <div className="text-2xl font-bold text-white">{commissions.filter((c) => c.paymentStatus === 'PAID').length}명</div>
        </div>
      </div>

      {/* 이체 포맷 미리보기 */}
      <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-amber-400 font-semibold text-sm">📋 경영진 보고용 이체 포맷</span>
          <span className="text-xs text-slate-500">이름 / 세후 실수령액 / 은행명 계좌번호 (예금주)</span>
        </div>
        <div className="space-y-1 font-mono text-xs text-slate-300 bg-slate-950 rounded-xl p-4 max-h-40 overflow-y-auto">
          {commissions.filter((c) => c.totalGross > 0 && c.paymentStatus === 'PENDING').map((c) => (
            <div key={c.id}>
              {c.employee?.name} / {c.netAmount.toLocaleString('ko-KR')}원 / {c.employee?.bank || '-'} {c.employee?.accountNumber || '-'} ({c.employee?.accountHolder || c.employee?.name})
            </div>
          ))}
          {commissions.filter((c) => c.totalGross > 0 && c.paymentStatus === 'PENDING').length === 0 && (
            <div className="text-slate-600">지급 대기 중인 항목 없음 · 전체 재계산 후 확인하세요</div>
          )}
        </div>
      </div>

      {/* 성과급 테이블 */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['이름', '유치건수', '순매출 합계', '등급', '성과수당', '보조금', '세전 총액', '세후 실수령액', '지급예정일', '지급상태'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={10} className="text-center py-10 text-slate-600">로딩 중...</td></tr>
              ) : commissions.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-slate-600">
                  <div className="text-4xl mb-3">🏆</div>
                  <div>전체 재계산 버튼을 클릭하여 성과급을 산정하세요</div>
                </td></tr>
              ) : (
                commissions.map((c) => (
                  <tr key={c.id} className={`hover:bg-white/2 transition-colors ${c.totalGross === 0 ? 'opacity-40' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="text-sm text-white font-medium">{c.employee?.name}</div>
                      {c.employee?.isStoreOwner && <div className="text-xs text-amber-400 mt-0.5">🏪 지급 지연</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{c.salesCount}건</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{fmt(c.netSalesTotal)}</td>
                    <td className="px-4 py-3"><GradeBadge grade={c.achievementGrade} /></td>
                    <td className="px-4 py-3 text-sm text-slate-300">{c.performanceBonus > 0 ? fmt(c.performanceBonus) : '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{c.subsidy > 0 ? fmt(c.subsidy) : '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{fmt(c.totalGross)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-indigo-300">{fmt(c.netAmount)}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {c.firstPaymentDue ? format(new Date(c.firstPaymentDue), 'yyyy.MM.dd') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleStatusToggle(c.id, c.paymentStatus)}
                        disabled={c.totalGross === 0}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
                          c.paymentStatus === 'PAID'
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : c.totalGross === 0 ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {c.paymentStatus === 'PAID' ? '지급완료' : '지급 처리'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
