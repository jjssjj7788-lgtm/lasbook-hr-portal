import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';

function fmt(n: number) { return `${n.toLocaleString('ko-KR')}원`; }

export default function StaffSales() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    saleDate: format(new Date(), 'yyyy-MM-dd'),
    customerName: '',
    productId: '',
    paymentMethod: 'CARD',
    actualAmount: '',
    salesWeek: '1',
    notes: '',
  });

  const load = async () => {
    if (!user) return;
    const [salesRes, productsRes] = await Promise.all([
      api.get(`/sales?employeeId=${user.employeeId}&month=${month}`),
      api.get('/products'),
    ]);
    setSales(salesRes.data);
    setProducts(productsRes.data);
  };

  useEffect(() => { load(); }, [user, month]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) { setError('고객명을 입력해 주세요.'); return; }
    if (!form.productId) { setError('상품을 선택해 주세요.'); return; }
    if (!form.actualAmount || Number(form.actualAmount) <= 0) { setError('결제금액을 입력해 주세요.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/sales', {
        projectId: user?.projectId,
        saleDate: form.saleDate,
        customerName: form.customerName,
        productId: Number(form.productId),
        paymentMethod: form.paymentMethod,
        actualAmount: Number(form.actualAmount),
        salesWeek: Number(form.salesWeek),
        notes: form.notes,
      });
      setForm({ saleDate: format(new Date(), 'yyyy-MM-dd'), customerName: '', productId: '', paymentMethod: 'CARD', actualAmount: '', salesWeek: '1', notes: '' });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || '저장 실패');
    } finally {
      setLoading(false);
    }
  };

  const totalNet = sales.reduce((a, s) => a + s.netAmount, 0);
  const totalCount = sales.length;

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">💰 매출 등록</h1>
          <p className="text-slate-400 text-sm mt-1">신규 계약 실적을 등록합니다</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setError(''); }}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${showForm ? 'bg-slate-700 text-slate-300' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'}`}>
          {showForm ? '✕ 취소' : '+ 새 매출 등록'}
        </button>
      </div>

      {/* 등록 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-white mb-2">신규 계약 정보</h2>
          {error && <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            {/* 계약일 */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">계약일 *</label>
              <input type="date" value={form.saleDate} onChange={(e) => setForm({ ...form, saleDate: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {/* 주차 */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">영업 주차</label>
              <select value={form.salesWeek} onChange={(e) => setForm({ ...form, salesWeek: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {[1, 2, 3, 4, 5].map((w) => <option key={w} value={w}>{w}주차</option>)}
              </select>
            </div>
          </div>

          {/* 고객명 */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">고객명 *</label>
            <input type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              placeholder="고객 성함" autoFocus
              className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* 상품 */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">상품 *</label>
            <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">상품 선택</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.series}시리즈 {p.language} {p.step ? `[${p.step}]` : ''} · {fmt(p.price)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 결제 방식 */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">결제 방식 *</label>
              <div className="flex gap-2">
                {['CARD', 'CASH'].map((m) => (
                  <button key={m} type="button" onClick={() => setForm({ ...form, paymentMethod: m })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      form.paymentMethod === m
                        ? m === 'CARD' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700'
                    }`}>
                    {m === 'CARD' ? '💳 카드' : '💵 현금'}
                  </button>
                ))}
              </div>
            </div>
            {/* 실결제금액 */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">실결제금액 *</label>
              <input type="number" value={form.actualAmount} onChange={(e) => setForm({ ...form, actualAmount: e.target.value })}
                placeholder="0" min="0"
                className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">메모 (선택)</label>
            <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="특이사항 기록"
              className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20">
            {loading ? '등록 중...' : '✓ 매출 등록'}
          </button>
        </form>
      )}

      {/* 월간 요약 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
          <div className="text-xs text-slate-500 mb-1">유치 건수</div>
          <div className="text-2xl font-bold text-white">{totalCount}<span className="text-sm text-slate-500 ml-1">건</span></div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
          <div className="text-xs text-slate-500 mb-1">총 순매출</div>
          <div className="text-lg font-bold text-indigo-300">{fmt(totalNet)}</div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
          <div className="text-xs text-slate-500 mb-1">조회 월</div>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="bg-transparent text-white text-sm font-bold focus:outline-none cursor-pointer w-full text-center" />
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
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${s.paymentMethod === 'CARD' ? 'bg-blue-500/15' : 'bg-emerald-500/15'}`}>
                  {s.paymentMethod === 'CARD' ? '💳' : '💵'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm">{s.customerName}</div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    {s.product?.series}시리즈 {s.product?.language} · {format(new Date(s.saleDate), 'MM.dd')} · {s.salesWeek}주차
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
