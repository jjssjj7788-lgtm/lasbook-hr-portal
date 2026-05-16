import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';

function fmt(n: number) { return `${n.toLocaleString('ko-KR')}원`; }

// 원터치 추출 버튼 컴포넌트
function PayoutExtractButton({ projectId, month, type }: { projectId: number; month: string; type: 'activity-fees' | 'monthly-commissions' }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExtract = async () => {
    setLoading(true);
    try {
      const path = type === 'activity-fees' ? '/activity-fees/payout' : '/monthly-commissions/payout';
      const { data } = await api.get(`${path}?projectId=${projectId}&month=${month}`);
      const text = data.lines.join('\n');
      if (text) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        alert('추출할 지급 대상이 없습니다.');
      }
    } catch (err) {
      alert('추출 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExtract}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        copied
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
          : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
      }`}
    >
      {loading ? '⏳ 처리 중...' : copied ? '✅ 복사 완료!' : '📋 원터치 이체 추출'}
    </button>
  );
}

export default function AdminActivityFees() {
  const { selectedProjectId } = useAuthStore();
  const [fees, setFees] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [feesRes, usersRes] = await Promise.all([
        api.get(`/activity-fees?projectId=${selectedProjectId}&month=${month}`),
        api.get(`/users?projectId=${selectedProjectId}`),
      ]);
      setFees(feesRes.data);
      setUsers(usersRes.data.filter((u: any) => u.role === 'USER' && u.position?.code !== 'TRAINEE'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (selectedProjectId) load(); }, [selectedProjectId, month]);

  const handleBulkCreate = async (round: 1 | 2) => {
    if (!confirm(`${month} ${round}차 활동비를 일괄 생성하시겠습니까?`)) return;
    setBulkLoading(true);
    try {
      await api.post('/activity-fees/bulk', { projectId: selectedProjectId, payMonth: month, paymentRound: round });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || '일괄 생성 실패');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleStatusToggle = async (id: number, current: string) => {
    await api.patch(`/activity-fees/${id}/status`, { status: current === 'PAID' ? 'PENDING' : 'PAID' });
    load();
  };

  const handleEligibility = async (id: number, current: boolean) => {
    await api.patch(`/activity-fees/${id}/eligibility`, { isEligible: !current });
    load();
  };

  const totalNet = fees.filter((f) => f.isEligible).reduce((a, f) => a + f.netAmount, 0);
  const paidCount = fees.filter((f) => f.paymentStatus === 'PAID').length;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">초기 정착 활동비</h1>
          <p className="text-slate-400 text-sm mt-1">위촉 후 1개월, 2주 단위 1차/2차 지급</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={() => handleBulkCreate(1)} disabled={bulkLoading}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-all">
            1차 일괄생성
          </button>
          <button onClick={() => handleBulkCreate(2)} disabled={bulkLoading}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-all">
            2차 일괄생성
          </button>
          <PayoutExtractButton projectId={selectedProjectId!} month={month} type="activity-fees" />
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-2">세후 지급 총액</div>
          <div className="text-2xl font-bold text-white">{fmt(totalNet)}</div>
          <div className="text-xs text-slate-500 mt-1">3.3% 원천징수 후</div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">지급 완료</div>
          <div className="text-2xl font-bold text-white">{paidCount}건</div>
          <div className="text-xs text-slate-500 mt-1">/{fees.length}건</div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2">대기 중</div>
          <div className="text-2xl font-bold text-white">{fees.length - paidCount}건</div>
        </div>
      </div>

      {/* 원터치 미리보기 박스 */}
      <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-amber-400 font-semibold text-sm">📋 이체 포맷 미리보기</span>
          <span className="text-xs text-slate-500">(이름 / 세후 실수령액 / 은행명 계좌번호 (예금주))</span>
        </div>
        <div className="space-y-1 font-mono text-xs text-slate-300 bg-slate-950 rounded-xl p-4 max-h-32 overflow-y-auto">
          {fees.filter((f) => f.isEligible && f.paymentStatus === 'PENDING').map((f) => (
            <div key={f.id}>
              {f.employee?.name} / {f.netAmount.toLocaleString('ko-KR')}원 / {f.employee?.bank || '-'} {f.employee?.accountNumber || '-'} ({f.employee?.accountHolder || f.employee?.name})
            </div>
          ))}
          {fees.filter((f) => f.isEligible && f.paymentStatus === 'PENDING').length === 0 && (
            <div className="text-slate-600">지급 대기 중인 항목 없음</div>
          )}
        </div>
      </div>

      {/* 정산 테이블 */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['이름', '직급', '회차', '발생액', '세후 실수령액', '성과 충족', '지급 상태', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-slate-600">로딩 중...</td></tr>
            ) : fees.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-slate-600">
                일괄 생성 버튼으로 활동비를 생성하세요
              </td></tr>
            ) : (
              fees.map((f) => (
                <tr key={f.id} className={`hover:bg-white/2 transition-colors ${!f.isEligible ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 text-sm text-white font-medium">{f.employee?.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{f.employee?.position?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${f.paymentRound === 1 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-purple-500/20 text-purple-300'}`}>
                      {f.paymentRound}차
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{fmt(f.grossAmount)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-indigo-300">{fmt(f.netAmount)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleEligibility(f.id, f.isEligible)}
                      className={`text-xs px-2.5 py-1 rounded-full transition-all ${f.isEligible ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}>
                      {f.isEligible ? '✅ 충족' : '❌ 미충족'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleStatusToggle(f.id, f.paymentStatus)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${f.paymentStatus === 'PAID' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                      {f.paymentStatus === 'PAID' ? '지급완료' : '지급 처리'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {f.employee?.bank} {f.employee?.accountNumber}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
