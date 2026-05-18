import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';

function fmt(n: number) { return `${n.toLocaleString('ko-KR')}원`; }

/* ── 원터치 추출 버튼 ── */
function PayoutExtractButton({ projectId, month }: { projectId: number; month: string }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleExtract = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/activity-fees/payout?projectId=${projectId}&month=${month}`);
      const text = data.lines.join('\n');
      if (text) { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 3000); }
      else alert('추출할 지급 대상이 없습니다.');
    } catch { alert('추출 실패'); } finally { setLoading(false); }
  };
  return (
    <button onClick={handleExtract} disabled={loading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-amber-500 hover:bg-amber-400 text-black'}`}>
      {loading ? '⏳ 처리 중...' : copied ? '✅ 복사 완료!' : '📋 원터치 이체 추출'}
    </button>
  );
}

/* ── 조건 배지 ── */
function CondBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium
      ${ok ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
      {ok ? '✅' : '❌'} {label}
    </span>
  );
}

/* ── 메인 ── */
export default function AdminActivityFees() {
  const { selectedProjectId } = useAuthStore();
  const [fees, setFees] = useState<any[]>([]);
  const [eligibility, setEligibility] = useState<any[]>([]);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [tab, setTab] = useState<'fees' | 'check'>('check');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const load = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    setError('');
    try {
      const [feesRes, eligRes] = await Promise.all([
        api.get(`/activity-fees?projectId=${selectedProjectId}&month=${month}`),
        api.get(`/activity-fees/check-eligibility?projectId=${selectedProjectId}`),
      ]);
      setFees(feesRes.data);
      setEligibility(Array.isArray(eligRes.data) ? eligRes.data : []);
    } catch (e: any) {
      setError(e.response?.data?.message || '데이터 로드 실패. 백엔드 서버를 확인해주세요.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [selectedProjectId, month]);

  const handleBulkCreate = async (round: 1 | 2) => {
    if (!confirm(`${month} ${round}차 활동비를 일괄 생성하시겠습니까?`)) return;
    setBulkLoading(true);
    try {
      await api.post('/activity-fees/bulk', { projectId: selectedProjectId, payMonth: month, paymentRound: round });
      load();
    } catch (err: any) { alert(err.response?.data?.message || '일괄 생성 실패'); }
    finally { setBulkLoading(false); }
  };

  const handleStatusToggle = async (id: number, current: string) => {
    await api.patch(`/activity-fees/${id}/status`, { status: current === 'PAID' ? 'PENDING' : 'PAID' }); load();
  };
  const handleEligibility = async (id: number, current: boolean) => {
    await api.patch(`/activity-fees/${id}/eligibility`, { isEligible: !current }); load();
  };

  const totalNet  = fees.filter(f => f.isEligible).reduce((a, f) => a + f.netAmount, 0);
  const paidCount = fees.filter(f => f.paymentStatus === 'PAID').length;

  /* 조건 충족 통계 */
  const ok2nd = eligibility.filter(e => e.eligible2nd).length;
  const no2nd = eligibility.filter(e => !e.eligible2nd).length;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">초기 정착 활동비</h1>
          <p className="text-slate-400 text-sm mt-1">
            1차 선지급 (계약 시작일 즉시) · 2차 지급 = 판매실적 + 일일활동보고서 ○ 평가
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={() => handleBulkCreate(1)} disabled={bulkLoading}
            className="px-4 py-2.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 rounded-xl text-sm transition-all">
            1차 일괄생성
          </button>
          <button onClick={() => handleBulkCreate(2)} disabled={bulkLoading}
            className="px-4 py-2.5 bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 border border-violet-500/30 rounded-xl text-sm transition-all">
            2차 일괄생성
          </button>
          <PayoutExtractButton projectId={selectedProjectId!} month={month} />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/15 border border-red-500/30 rounded-2xl px-5 py-3 flex items-center justify-between">
          <span className="text-red-300 text-sm">{error}</span>
          <button onClick={load} className="text-xs px-3 py-1.5 bg-red-500/20 text-red-300 rounded-lg">
            다시 시도
          </button>
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-1 bg-slate-900 border border-white/5 rounded-2xl p-1.5 w-fit">
        {[
          { key: 'check', label: '📋 2차 조건 확인' },
          { key: 'fees',  label: '💰 정산 관리' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 탭 1: 2차 조건 확인 ── */}
      {tab === 'check' && (
        <div className="space-y-4">
          {/* 요약 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-4">
              <div className="text-xs text-slate-400 mb-1">전체 대상</div>
              <div className="text-2xl font-bold text-white">{eligibility.length}<span className="text-sm text-slate-400 ml-1">명</span></div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
              <div className="text-xs text-emerald-400 mb-1">✅ 2차 충족</div>
              <div className="text-2xl font-bold text-white">{ok2nd}<span className="text-sm text-slate-400 ml-1">명</span></div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <div className="text-xs text-red-400 mb-1">❌ 2차 미충족</div>
              <div className="text-2xl font-bold text-white">{no2nd}<span className="text-sm text-slate-400 ml-1">명</span></div>
            </div>
          </div>

          {/* 조건 설명 */}
          <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-4">
            <div className="text-sm font-semibold text-indigo-300 mb-2">📌 2차 지급 조건</div>
            <div className="flex gap-4 flex-wrap text-xs text-slate-400">
              <span>✅ <b className="text-white">조건 1</b>: 판매 실적 1건 이상 (주인형 점주 OR 구독회원)</span>
              <span>✅ <b className="text-white">조건 2</b>: 일일활동보고서 ○ 평가 1개 이상</span>
              <span className="text-slate-500">→ 두 조건 모두 충족 시 2차 지급 가능</span>
            </div>
          </div>

          {/* 직원별 조건 목록 */}
          {loading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-800 rounded-2xl animate-pulse" />)}</div>
          ) : eligibility.length === 0 ? (
            <div className="text-center py-12 text-slate-600">대상 직원이 없습니다</div>
          ) : (
            <div className="space-y-2">
              {eligibility.map(e => (
                <div key={e.employeeId}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all
                    ${e.eligible2nd
                      ? 'bg-emerald-500/8 border-emerald-500/25'
                      : 'bg-slate-900 border-white/5'}`}
                >
                  {/* 아바타 */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {e.name?.charAt(0)}
                  </div>
                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold">{e.name}</span>
                      <span className="text-xs text-slate-500">{e.position}</span>
                      {e.contractStart && (
                        <span className="text-xs text-slate-600">
                          계약: {new Date(e.contractStart).toLocaleDateString('ko-KR')}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {/* 1차: 항상 충족 */}
                      <CondBadge ok={true} label="1차 선지급 가능" />
                      {/* 2차 조건 */}
                      <CondBadge ok={e.conditions.hasSale} label={`판매실적 ${e.conditions.saleCount}건`} />
                      <CondBadge ok={e.conditions.hasCircle} label={`○평가 ${e.conditions.circleCount}개`} />
                    </div>
                  </div>
                  {/* 2차 결과 */}
                  <div className="flex-shrink-0">
                    <div className={`text-sm font-bold px-4 py-2 rounded-xl border
                      ${e.eligible2nd
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500 border-white/5'}`}>
                      {e.eligible2nd ? '✅ 2차 가능' : '⏳ 2차 대기'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 탭 2: 정산 관리 ── */}
      {tab === 'fees' && (
        <div className="space-y-4">
          {/* 요약 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-4">
              <div className="text-xs text-indigo-400 font-semibold mb-1">세후 지급 총액</div>
              <div className="text-xl font-bold text-white">{fmt(totalNet)}</div>
              <div className="text-xs text-slate-500 mt-0.5">3.3% 원천징수 후</div>
            </div>
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-4">
              <div className="text-xs text-emerald-400 font-semibold mb-1">지급 완료</div>
              <div className="text-xl font-bold text-white">{paidCount}<span className="text-sm text-slate-400 ml-1">/ {fees.length}건</span></div>
            </div>
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-4">
              <div className="text-xs text-amber-400 font-semibold mb-1">대기 중</div>
              <div className="text-xl font-bold text-white">{fees.length - paidCount}건</div>
            </div>
          </div>

          {/* 이체 포맷 */}
          <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-4">
            <div className="text-xs text-amber-400 font-semibold mb-2">📋 이체 포맷 미리보기</div>
            <div className="space-y-1 font-mono text-xs text-slate-300 bg-slate-950 rounded-xl p-3 max-h-28 overflow-y-auto">
              {fees.filter(f => f.isEligible && f.paymentStatus === 'PENDING').map(f => (
                <div key={f.id}>{f.employee?.name} / {f.netAmount.toLocaleString()}원 / {f.employee?.bank || '-'} {f.employee?.accountNumber || '-'} ({f.employee?.accountHolder || f.employee?.name})</div>
              ))}
              {fees.filter(f => f.isEligible && f.paymentStatus === 'PENDING').length === 0 && (
                <div className="text-slate-600">지급 대기 중인 항목 없음</div>
              )}
            </div>
          </div>

          {/* 테이블 */}
          <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['이름', '직급', '회차', '발생액', '세후 실수령액', '성과 충족', '지급 상태', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-600">로딩 중...</td></tr>
                ) : fees.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-600">일괄 생성 버튼으로 활동비를 생성하세요</td></tr>
                ) : (
                  fees.map(f => (
                    <tr key={f.id} className={`hover:bg-white/2 transition-colors ${!f.isEligible ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3 text-sm text-white font-medium">{f.employee?.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{f.employee?.position?.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${f.paymentRound === 1 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-violet-500/20 text-violet-300'}`}>
                          {f.paymentRound}차
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{fmt(f.grossAmount)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-indigo-300">{fmt(f.netAmount)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleEligibility(f.id, f.isEligible)}
                          className={`text-xs px-2.5 py-1 rounded-full transition-all ${f.isEligible ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'}`}>
                          {f.isEligible ? '✅ 충족' : '❌ 미충족'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleStatusToggle(f.id, f.paymentStatus)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${f.paymentStatus === 'PAID' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                          {f.paymentStatus === 'PAID' ? '지급완료' : '지급 처리'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{f.employee?.bank} {f.employee?.accountNumber}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
