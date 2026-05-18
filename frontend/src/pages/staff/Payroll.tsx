import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format, addMonths, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

function fmt(n: number) { return `${n.toLocaleString('ko-KR')}원`; }

/**
 * 활동수당 지급일 계산
 * 1차: 계약일 당일 바로 지급
 * 2차: 계약일 + 14일 (2주 후), 조건 달성 시 지급
 */
function calcFeePayDate(contractStart: string | null, paymentRound: number): string {
  if (!contractStart) return '미정';
  try {
    const base = parseISO(contractStart);
    if (paymentRound === 1) {
      return format(base, 'yyyy년 M월 d일 (EEE)', { locale: ko }) + ' (시작일)';
    }
    const twoWeeksLater = new Date(base);
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
    return format(twoWeeksLater, 'yyyy년 M월 d일 (EEE)', { locale: ko }) + ' (시작 후 2주)';
  } catch {
    return '미정';
  }
}

/**
 * 성과수당/보조금 정산 기간 계산
 * 계약일 기준 1달 단위: M월 d일 ~ M월+1 d일
 * payMonth(yyyy-MM) 기준으로 몇 번째 달인지 계산
 */
function calcCommPeriod(contractStart: string | null, payMonth: string): string {
  if (!contractStart) return payMonth;
  try {
    const base = parseISO(contractStart);
    const [y, m] = payMonth.split('-').map(Number);
    const baseY = base.getFullYear();
    const baseM = base.getMonth();
    const offset = (y - baseY) * 12 + (m - 1 - baseM);
    const periodStart = addMonths(base, offset);
    const periodEnd = addMonths(base, offset + 1);
    return `${format(periodStart, 'M월 d일', { locale: ko })} ~ ${format(periodEnd, 'M월 d일', { locale: ko })}`;
  } catch {
    return payMonth;
  }
}

export default function StaffPayroll() {
  const { user } = useAuthStore();
  const [fees, setFees] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [myUser, setMyUser] = useState<any>(null);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [feeRes, commRes, userRes, eligRes] = await Promise.all([
        api.get(`/activity-fees?employeeId=${user.employeeId}&month=${month}`),
        api.get(`/monthly-commissions?projectId=${user.projectId}&month=${month}`),
        api.get(`/users/${user.employeeId}`).catch(() => ({ data: null })),
        api.get('/activity-fees/my-eligibility').catch(() => ({ data: null })),
      ]);
      setFees(feeRes.data);
      setCommissions(commRes.data.filter((c: any) =>
        c.employee?.employeeId === user.employeeId || c.employeeId === user.employeeId
      ));
      setMyUser(userRes.data);
      setEligibility(eligRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user, month]);

  const contractStart: string | null = myUser?.contractStart ?? user?.contractStart ?? null;
  const myFees = fees.filter((f: any) =>
    f.employee?.employeeId === user?.employeeId || f.employeeId === user?.employeeId
  );
  // 활동비는 합계에 포함하지 않음 — 성과급(monthly commission)만 집계
  const myComm = commissions[0] ?? null;
  const grandTotal = myComm?.netAmount ?? 0;

  // 총합 카드에 표시할 기간: 시작일 ~ 시작일+1달
  const commPeriodLabel = (() => {
    if (!contractStart) return month;
    try {
      const base = parseISO(contractStart);
      const [y, m] = month.split('-').map(Number);
      const offset = (y - base.getFullYear()) * 12 + (m - 1 - base.getMonth());
      const s = addMonths(base, offset);
      const e = addMonths(base, offset + 1);
      return `${format(s, 'M월 d일', { locale: ko })} ~ ${format(e, 'M월 d일', { locale: ko })}`;
    } catch { return month; }
  })();

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">💰 내 수당 내역</h1>
          <p className="text-slate-400 text-sm mt-1">활동수당 및 성과급 내역을 확인합니다</p>
        </div>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer" />
      </div>

      {/* 계약일 정보 */}
      {contractStart && (
        <div className="bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-slate-400 text-sm">📅 계약 시작일</span>
          <span className="text-white font-semibold text-sm">
            {format(parseISO(contractStart), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
          </span>
          <span className="text-slate-500 text-xs ml-auto">수당은 계약일 기준 1개월 단위 지급</span>
        </div>
      )}

      {/* 총합 카드 — 성과급(월간 성과급)만 표시, 활동비 제외 */}
      <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 border border-indigo-500/30 rounded-2xl p-6">
        <div className="text-xs text-indigo-300 font-semibold mb-1">성과수당 + 보조금 예상 수령액</div>
        <div className="text-xs text-slate-500 mb-3">
          {contractStart ? commPeriodLabel : month}
        </div>
        <div className="text-4xl font-bold text-white">{loading ? '...' : fmt(grandTotal)}</div>
        <div className="text-xs text-slate-500 mt-2">* 세후 기준 (3.3% 원천징수 공제 후) · 활동비 별도</div>
      </div>

      {/* 활동 수당 */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">📋 활동 수당</span>
          <span className="text-xs text-slate-500">{myFees.length}건</span>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-600 text-sm">로딩 중...</div>
        ) : myFees.length === 0 ? (
          <div className="p-10 text-center text-slate-600">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm">이번 달 활동 수당 내역이 없습니다</p>
            {!contractStart && (
              <p className="text-xs text-amber-400 mt-2">⚠ 계약 시작일이 등록되지 않았습니다. 관리자에게 문의하세요.</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {myFees.map((f: any) => {
              const payDate = calcFeePayDate(contractStart, f.paymentRound);
              return (
                <div key={f.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* 회차 */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">
                          {f.paymentRound}차 활동수당
                        </span>
                        {/* 1차: 항상 지급 / 2차: 조건 달성 여부 배지 */}
                        {f.paymentRound === 1 ? (
                          <span className="text-xs text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          시작일 지급
                          </span>
                        ) : eligibility?.eligible2nd ? (
                          <span className="text-xs text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            ✅ 지급 조건 달성
                          </span>
                        ) : (
                          <span className="text-xs text-red-300 bg-red-500/15 border border-red-500/20 px-2 py-0.5 rounded-full">
                            ❌ 지급 조건 미달성
                          </span>
                        )}
                      </div>

                      {/* 2차 조건 상세 */}
                      {f.paymentRound === 2 && eligibility && (
                        <div className="mt-1.5 text-xs">
                          {eligibility.eligible2nd ? (
                            <span className="text-emerald-400">{eligibility.detail}</span>
                          ) : (
                            <div className="space-y-0.5">
                              <div className="text-slate-500">
                                구독회원 200만원+ 판매: <span className={eligibility.subSaleCount >= 1 ? 'text-emerald-400' : 'text-red-400'}>{eligibility.subSaleCount}건</span>
                                {' / '}
                                동그라미 보고서: <span className={eligibility.circleCount >= 1 ? 'text-emerald-400' : 'text-red-400'}>{eligibility.circleCount}건</span>
                              </div>
                              {eligibility.need && (
                                <div className="text-amber-400">→ {eligibility.need}</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 지급 예정일 */}
                      <div className="text-xs text-slate-500 mt-1.5">
                        지급 예정일: <span className="text-slate-400">{f.paymentStatus === 'PAID' ? '지급 완료' : payDate}</span>
                      </div>

                      {/* 상태 배지 */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                          f.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : f.paymentRound === 1
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : eligibility?.eligible2nd
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : 'bg-slate-700 text-slate-400 border-slate-600'
                        }`}>
                          {f.paymentStatus === 'PAID'
                            ? '✅ 지급완료'
                            : f.paymentRound === 1
                            ? '✅ 지급 (시작일)'
                            : eligibility?.eligible2nd
                            ? '⏳ 지급 대기'
                            : '🔒 조건 미달성'}
                        </span>
                      </div>
                    </div>

                    {/* 금액 */}
                    <div className="text-right flex-shrink-0">
                      <div className={`font-bold text-xl ${eligibility?.eligible2nd || f.paymentRound === 1 || f.paymentStatus === 'PAID' ? 'text-indigo-300' : 'text-slate-600'}`}>
                        {fmt(f.netAmount ?? 0)}
                      </div>
                      {f.grossAmount !== f.netAmount && (
                        <div className="text-xs text-slate-600 mt-0.5">세전 {fmt(f.grossAmount)}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        )}
      </div>

      {/* 성과급 */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">🏆 월간 성과급</span>
          <span className="text-xs text-slate-500">{month}</span>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-600 text-sm">로딩 중...</div>
        ) : !myComm || myComm.totalGross === 0 ? (
          <div className="p-10 text-center text-slate-600">
            <div className="text-3xl mb-2">🏅</div>
            <p className="text-sm">이번 달 성과급 내역이 없습니다</p>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {/* 성과급 정산 기간 */}
            {contractStart && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-slate-400">정산 기간</span>
                <span className="text-sm font-semibold text-indigo-300">
                  {calcCommPeriod(contractStart, month)}
                </span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '유치건수', value: `${myComm.salesCount}건` },
                { label: '등급', value: myComm.achievementGrade ?? '미달성' },
                { label: '순매출', value: fmt(myComm.netSalesTotal ?? 0) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-800/60 rounded-xl px-3 py-2.5 text-center">
                  <div className="text-xs text-slate-500 mb-1">{label}</div>
                  <div className="text-sm text-white font-semibold">{value}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-2 border-t border-white/5">
              {[
                { label: '성과수당', value: myComm.performanceBonus },
                { label: '보조금', value: myComm.subsidy },
                { label: '세전 총액', value: myComm.totalGross },
              ].filter(i => i.value > 0).map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-white">{fmt(value)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/5">
                <span className="text-slate-300">세후 실수령액 (3.3% 공제)</span>
                <span className="text-indigo-300 text-base">{fmt(myComm.netAmount)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                지급예정일: {myComm.firstPaymentDue
                  ? format(parseISO(myComm.firstPaymentDue), 'yyyy년 M월 d일', { locale: ko })
                  : '미정'}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                myComm.paymentStatus === 'PAID'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {myComm.paymentStatus === 'PAID' ? '✅ 지급완료' : '⏳ 지급 대기'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
