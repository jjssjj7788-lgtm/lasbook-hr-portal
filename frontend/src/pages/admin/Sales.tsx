import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';

function fmt(n: number) { return `${n.toLocaleString('ko-KR')}원`; }

export default function AdminSales() {
  const { selectedProjectId } = useAuthStore();
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // 신규 실적 폼 상태
  const [form, setForm] = useState({
    projectId: selectedProjectId ?? 1,
    saleDate: format(new Date(), 'yyyy-MM-dd'),
    employeeId: '',
    customerName: '',
    productId: '',
    paymentMethod: 'CARD',
    actualAmount: '',
    notes: '',
  });

  // 실시간 수수료 미리보기
  const previewFee = form.paymentMethod === 'CARD' ? Math.floor(Number(form.actualAmount) * 0.025) : 0;
  const previewNet = Number(form.actualAmount) - previewFee;

  const load = async () => {
    setLoading(true);
    try {
      const [salesRes, prodRes, usersRes] = await Promise.all([
        api.get(`/sales?projectId=${selectedProjectId}&month=${month}`),
        api.get('/products'),
        api.get(`/users?projectId=${selectedProjectId}`),
      ]);
      setSales(salesRes.data);
      setProducts(prodRes.data);
      setUsers(usersRes.data.filter((u: any) => u.role === 'USER'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (selectedProjectId) load(); }, [selectedProjectId, month]);

  const handleProductChange = (productId: string) => {
    const p = products.find((p) => p.id === Number(productId));
    setForm({ ...form, productId, actualAmount: p ? String(p.price) : '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/sales', { ...form, projectId: selectedProjectId, productId: Number(form.productId), actualAmount: Number(form.actualAmount) });
      setShowForm(false);
      setForm({ ...form, customerName: '', productId: '', actualAmount: '', notes: '' });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || '등록 실패');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return;
    await api.delete(`/sales/${id}`);
    load();
  };

  const totals = sales.reduce((a, s) => ({ actual: a.actual + s.actualAmount, fee: a.fee + s.deductedFee, net: a.net + s.netAmount }), { actual: 0, fee: 0, net: 0 });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">판매 실적 관리</h1>
        <div className="flex items-center gap-3">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button
            id="addSaleBtn"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-600/20"
          >
            + 실적 등록
          </button>
        </div>
      </div>

      {/* 월간 합계 카드 */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '실결제 합계', value: fmt(totals.actual), color: 'text-blue-400' },
          { label: '카드 수수료 (2.5%)', value: `-${fmt(totals.fee)}`, color: 'text-orange-400' },
          { label: '순매출 합계', value: fmt(totals.net), color: 'text-indigo-400' },
        ].map((c) => (
          <div key={c.label} className="bg-slate-900 border border-white/5 rounded-2xl p-5">
            <div className={`text-xs font-semibold uppercase tracking-widest ${c.color} mb-2`}>{c.label}</div>
            <div className="text-2xl font-bold text-white">{c.value}</div>
          </div>
        ))}
      </div>

      {/* 신규 등록 폼 */}
      {showForm && (
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">신규 실적 등록</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">유치일자 *</label>
                <input type="date" value={form.saleDate} onChange={(e) => setForm({ ...form, saleDate: e.target.value })} required
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">담당자 *</label>
                <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">선택</option>
                  {users.map((u) => <option key={u.employeeId} value={u.employeeId}>{u.name} ({u.position?.name})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">고객명 *</label>
                <input type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required placeholder="고객 이름"
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">상품 *</label>
                <select value={form.productId} onChange={(e) => handleProductChange(e.target.value)} required
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">선택</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.memberType} {p.series}시리즈 {p.language} ({fmt(p.price)})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">결제 수단 *</label>
                <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="CARD">카드 (2.5% 수수료)</option>
                  <option value="CASH">현금 (수수료 없음)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">실결제금액 *</label>
                <input type="number" value={form.actualAmount} onChange={(e) => setForm({ ...form, actualAmount: e.target.value })} required placeholder="0"
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            {/* 수수료 미리보기 */}
            {Number(form.actualAmount) > 0 && (
              <div className="flex items-center gap-6 py-3 px-4 bg-slate-800/60 rounded-xl mb-4 text-sm">
                <span className="text-slate-400">실결제: <span className="text-white font-medium">{fmt(Number(form.actualAmount))}</span></span>
                {previewFee > 0 && <span className="text-orange-400">수수료: -{fmt(previewFee)}</span>}
                <span className="text-indigo-300 font-bold">순매출: {fmt(previewNet)}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-all">취소</button>
              <button type="submit" className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all">등록</button>
            </div>
          </form>
        </div>
      )}

      {/* 실적 테이블 */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['유치일자', '담당자', '고객명', '상품', '결제', '실결제', '수수료', '순매출', '주차', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={10} className="text-center py-10 text-slate-600">로딩 중...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-10 text-slate-600">이번 달 실적이 없습니다</td></tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-300">{format(new Date(s.saleDate), 'MM.dd')}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{s.employee?.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{s.customerName}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{s.product?.series}시리즈 {s.product?.language}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.paymentMethod === 'CARD' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {s.paymentMethod === 'CARD' ? '카드' : '현금'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{fmt(s.actualAmount)}</td>
                    <td className="px-4 py-3 text-sm text-orange-400">{s.deductedFee > 0 ? `-${fmt(s.deductedFee)}` : '-'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-indigo-300">{fmt(s.netAmount)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{s.salesWeek}주차</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(s.id)} className="text-slate-600 hover:text-red-400 transition-colors text-xs">삭제</button>
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
