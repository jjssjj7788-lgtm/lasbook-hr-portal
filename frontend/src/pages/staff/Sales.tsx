import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';

function fmt(n: number) { return `${n.toLocaleString('ko-KR')}원`; }

type PayEntry = { method: 'CARD' | 'CASH'; amount: string };

const EMPTY_FORM = {
  saleDate: format(new Date(), 'yyyy-MM-dd'),
  customerName: '',
  memberType: '',   // 관리자 DB의 memberType 그대로 사용
  series: '',       // 상품 series (K2, K3, S2 ...)
  step: '',         // 분권 A / B / '' (없음)
  language: '',     // 한글 / 영어
  notes: '',
};

export default function StaffSales() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [payments, setPayments] = useState<PayEntry[]>([{ method: 'CARD', amount: '' }]);

  const load = async () => {
    if (!user) return;
    const [salesRes, productsRes] = await Promise.all([
      api.get(`/sales?employeeId=${user.employeeId}&month=${month}`),
      api.get('/products'),
    ]);
    setSales(salesRes.data);
    setProducts(productsRes.data.filter((p: any) => p.isActive !== false));
  };

  useEffect(() => { load(); }, [user, month]);

  // 활성 회원 유형 목록 (DB 기준)
  const memberTypes = [...new Set(products.map((p: any) => p.memberType as string))].filter(Boolean);

  // 선택된 회원 유형의 시리즈 목록
  const seriesList = form.memberType
    ? [...new Set(products.filter((p: any) => p.memberType === form.memberType).map((p: any) => p.series as string))].filter(Boolean).sort()
    : [];

  // 선택된 시리즈의 분권 목록 (A, B, 또는 없음)
  const stepList = form.series
    ? [...new Set(
        products
          .filter((p: any) => p.memberType === form.memberType && p.series === form.series)
          .map((p: any) => p.step as string | null)
      )].filter((s) => s !== null && s !== undefined) as string[]
    : [];
  const hasStep = stepList.length > 0;

  // 선택된 시리즈+분권의 언어 목록
  const languageList = form.series
    ? [...new Set(
        products
          .filter((p: any) =>
            p.memberType === form.memberType &&
            p.series === form.series &&
            (hasStep ? p.step === (form.step || null) : true)
          )
          .map((p: any) => p.language as string)
      )].filter((l) => l && l !== '-')
    : [];

  // 최종 매칭 상품
  const matchedProduct = (() => {
    if (!form.memberType || !form.series || !form.language) return null;
    return products.find((p: any) =>
      p.memberType === form.memberType &&
      p.series === form.series &&
      p.language === form.language &&
      (hasStep ? p.step === (form.step || null) : true)
    ) ?? null;
  })();

  // 결제 계산
  const totalPayment = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const addPayment = () => setPayments([...payments, { method: 'CARD', amount: '' }]);
  const removePayment = (i: number) => setPayments(payments.filter((_, idx) => idx !== i));
  const updatePayment = (i: number, field: keyof PayEntry, val: string) =>
    setPayments(payments.map((p, idx) => idx === i ? { ...p, [field]: val } : p));

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setPayments([{ method: 'CARD', amount: '' }]);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) { setError('고객명을 입력해 주세요.'); return; }
    if (!form.memberType) { setError('고객 유형을 선택해 주세요.'); return; }
    if (!form.series) { setError('상품을 선택해 주세요.'); return; }
    if (languageList.length > 0 && !form.language) { setError('언어를 선택해 주세요.'); return; }
    if (!matchedProduct) { setError('해당 상품이 DB에 없습니다. 관리자에게 상품 등록을 요청하세요.'); return; }
    if (totalPayment <= 0) { setError('결제금액을 입력해 주세요.'); return; }
    if (payments.some((p) => !p.amount || Number(p.amount) <= 0)) { setError('모든 결제 항목의 금액을 입력해 주세요.'); return; }

    setLoading(true); setError('');
    try {
      const payMethods = [...new Set(payments.map((p) => p.method))];
      const paymentMethod = payMethods.length === 1 ? payMethods[0] : 'CARD';
      const payBreakdown = payments
        .map((p) => `${p.method === 'CARD' ? '카드' : '현금'} ${Number(p.amount).toLocaleString()}원`)
        .join(' + ');
      const notesVal = [
        payments.length > 1 ? `결제내역: ${payBreakdown}` : '',
        form.notes,
      ].filter(Boolean).join(' | ');

      await api.post('/sales', {
        projectId: user?.projectId,
        saleDate: form.saleDate,
        customerName: form.customerName,
        productId: matchedProduct.id,
        paymentMethod,
        actualAmount: totalPayment,
        notes: notesVal || undefined,
      });
      resetForm();
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || '저장 실패');
    } finally {
      setLoading(false);
    }
  };

  const totalNet = sales.reduce((a, s) => a + s.netAmount, 0);
  const inputCls = 'w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  const ChipBtn = ({
    label, active, onClick, color = 'indigo',
  }: { label: string; active: boolean; onClick: () => void; color?: string }) => {
    const activeStyle: Record<string, string> = {
      indigo: 'bg-indigo-600 text-white border-indigo-500',
      amber: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    };
    return (
      <button type="button" onClick={onClick}
        className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
          active ? activeStyle[color] : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
        }`}>
        {label}
      </button>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">💰 매출 등록</h1>
          <p className="text-slate-400 text-sm mt-1">신규 계약 실적을 등록합니다</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); resetForm(); }}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            showForm ? 'bg-slate-700 text-slate-300' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
          }`}>
          {showForm ? '✕ 취소' : '+ 새 매출 등록'}
        </button>
      </div>

      {/* 등록 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-semibold text-white">신규 계약 정보</h2>
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}

          {/* 계약일 + 고객명 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">계약일 *</label>
              <input type="date" value={form.saleDate} onChange={e => setForm({ ...form, saleDate: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">고객명 *</label>
              <input type="text" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })}
                placeholder="고객 성함" className={inputCls} />
            </div>
          </div>

          {/* ① 고객(회원) 유형 */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">① 회원 유형 *</label>
            {memberTypes.length === 0 ? (
              <p className="text-xs text-red-400">⚠ 등록된 상품이 없습니다. 관리자에게 상품 등록을 요청하세요.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {memberTypes.map(t => (
                  <ChipBtn key={t} label={t} active={form.memberType === t}
                    onClick={() => setForm({ ...form, memberType: t, series: '', step: '', language: '' })} />
                ))}
              </div>
            )}
          </div>

          {/* ② 시리즈(상품) 선택 */}
          {form.memberType && seriesList.length > 0 && (
            <div>
              <label className="block text-xs text-slate-400 mb-2">② 시리즈 *</label>
              <div className="flex flex-wrap gap-2">
                {seriesList.map(s => (
                  <ChipBtn key={s} label={s} active={form.series === s}
                    onClick={() => setForm({ ...form, series: s, step: '', language: '' })} />
                ))}
              </div>
            </div>
          )}

          {/* ③ 분권 선택 (A/B가 있을 때만) */}
          {form.series && hasStep && (
            <div>
              <label className="block text-xs text-slate-400 mb-2">③ 분권 *</label>
              <div className="flex flex-wrap gap-2">
                {stepList.map(s => (
                  <ChipBtn key={s} label={s} active={form.step === s}
                    onClick={() => setForm({ ...form, step: s, language: '' })} color="amber" />
                ))}
              </div>
            </div>
          )}

          {/* ④ 언어 선택 */}
          {form.series && (!hasStep || form.step) && languageList.length > 0 && (
            <div>
              <label className="block text-xs text-slate-400 mb-2">{hasStep ? '④' : '③'} 언어 *</label>
              <div className="flex gap-2">
                {languageList.map(lang => (
                  <ChipBtn key={lang} label={lang === '한글' ? '🇰🇷 한글' : '🇺🇸 영어'}
                    active={form.language === lang}
                    onClick={() => setForm({ ...form, language: lang })} color="green" />
                ))}
              </div>
            </div>
          )}

          {/* 자동 가격 표시 */}
          {matchedProduct && (
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-slate-300 text-sm">
                {matchedProduct.memberType} · {matchedProduct.series}{matchedProduct.step ? ` ${matchedProduct.step}` : ''} · {matchedProduct.language}
              </span>
              <span className="text-indigo-300 font-bold text-xl">{fmt(matchedProduct.price)}</span>
            </div>
          )}
          {form.language && !matchedProduct && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
              ⚠ 해당 조합의 상품이 DB에 없습니다. 관리자에게 상품 등록을 요청하세요.
            </div>
          )}

          {/* 결제 수단 (복수) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400">결제 수단 *</label>
              <button type="button" onClick={addPayment}
                className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
                + 결제 추가
              </button>
            </div>
            <div className="space-y-2">
              {payments.map((p, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="flex gap-1 flex-shrink-0">
                    {(['CARD', 'CASH'] as const).map(m => (
                      <button key={m} type="button" onClick={() => updatePayment(i, 'method', m)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                          p.method === m
                            ? m === 'CARD' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700'
                        }`}>
                        {m === 'CARD' ? '💳 카드' : '💵 현금'}
                      </button>
                    ))}
                  </div>
                  <input type="number" value={p.amount} onChange={e => updatePayment(i, 'amount', e.target.value)}
                    placeholder="금액 입력" min="0"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  {payments.length > 1 && (
                    <button type="button" onClick={() => removePayment(i)}
                      className="text-slate-600 hover:text-red-400 text-lg transition-colors px-1">✕</button>
                  )}
                </div>
              ))}
            </div>
            {payments.length > 1 && totalPayment > 0 && (
              <div className="mt-2 text-right text-sm text-slate-400">
                합계: <span className="text-white font-bold">{fmt(totalPayment)}</span>
              </div>
            )}
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">메모 (선택)</label>
            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="특이사항 기록" className={inputCls} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20">
            {loading ? '등록 중...' : '✓ 매출 등록'}
          </button>
        </form>
      )}

      {/* 월간 요약 */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 space-y-3">
        {/* 상단: 전체 집계 + 월 선택 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-slate-500">전체 유치</span>
              <span className="text-white font-bold text-lg ml-2">{sales.length}<span className="text-xs text-slate-500 ml-1">건</span></span>
            </div>
            <div className="w-px h-5 bg-white/10" />
            <div>
              <span className="text-xs text-slate-500">총 순매출</span>
              <span className="text-indigo-300 font-bold text-base ml-2">{fmt(totalNet)}</span>
            </div>
          </div>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="bg-transparent text-white text-sm font-bold focus:outline-none cursor-pointer text-right" />
        </div>

        {/* 하단: 회원 유형별 카운트 */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5">
          {[
            { type: '구독회원',    icon: '📦', color: 'indigo' },
            { type: '구매회원',    icon: '💳', color: 'blue' },
            { type: '주인형 점주', icon: '🏪', color: 'amber' },
            { type: '관리 회원',   icon: '👤', color: 'slate' },
          ].map(({ type, icon, color }) => {
            const typeSales = sales.filter((s: any) => s.product?.memberType === type);
            const count = typeSales.length;
            const netSum = typeSales.reduce((a: number, s: any) => a + (s.netAmount ?? 0), 0);
            const colorMap: Record<string, string> = {
              indigo: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
              blue:   'text-blue-300 bg-blue-500/10 border-blue-500/20',
              amber:  'text-amber-300 bg-amber-500/10 border-amber-500/20',
              slate:  'text-slate-300 bg-slate-700/50 border-white/10',
            };
            return (
              <div key={type} className={`rounded-xl border px-2 py-2.5 text-center ${colorMap[color]}`}>
                <div className="text-base mb-0.5">{icon}</div>
                <div className="text-lg font-bold">{count}<span className="text-xs font-normal ml-0.5">건</span></div>
                {count > 0 && (
                  <div className="text-xs opacity-80 mt-0.5 font-medium">
                    {netSum >= 10000000
                      ? `${(netSum / 10000000).toFixed(1)}천만`
                      : netSum >= 10000
                      ? `${Math.floor(netSum / 10000)}만`
                      : fmt(netSum)}
                  </div>
                )}
                <div className="text-xs opacity-50 truncate mt-0.5">{type}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 매출 목록 */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        {sales.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            <div className="text-4xl mb-3">💰</div>
            <p>이번 달 등록된 매출이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {sales.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${
                  s.paymentMethod === 'CARD' ? 'bg-blue-500/15' : 'bg-emerald-500/15'
                }`}>
                  {s.paymentMethod === 'CARD' ? '💳' : '💵'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm">{s.customerName}</div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    {s.product?.memberType && <span className="text-slate-600 mr-1">{s.product.memberType} ·</span>}
                    {s.product?.series}{s.product?.step ? ` ${s.product.step}` : ''} {s.product?.language} · {format(new Date(s.saleDate), 'MM.dd')}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-indigo-300 font-semibold text-sm">{fmt(s.netAmount)}</div>
                  {s.deductedFee > 0 && <div className="text-xs text-orange-400">수수료 -{fmt(s.deductedFee)}</div>}
                  <div className="text-xs text-slate-600">실결제 {fmt(s.actualAmount)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
