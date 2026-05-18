import { useEffect, useState } from 'react';
import api from '../../lib/axios';

function fmt(n: number) { return `${n.toLocaleString('ko-KR')}원`; }

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ memberType: '구독회원', series: 'K2', step: 'A', language: '한글', price: '' });

  const load = () => api.get('/products').then((r) => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/products', { ...form, step: form.step || null, price: Number(form.price) });
    setShowForm(false);
    load();
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">상품 관리</h1>
          <p className="text-slate-400 text-sm mt-1">판매 실적 등록 시 사용되는 상품 가격표</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all">
          {showForm ? '취소' : '+ 상품 추가'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-white/10 rounded-2xl p-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {[
              { label: '회원종류', key: 'memberType', type: 'select', opts: ['구독회원', '구매회원', '주인형 점주'] },
              { label: '시리즈', key: 'series', placeholder: 'K2, S, G, -' },
              { label: '분권(A/B)', key: 'step', placeholder: 'A 또는 B (없으면 빈칸)' },
              { label: '언어', key: 'language', type: 'select', opts: ['한글', '영어', '-'] },
              { label: '정가(원)', key: 'price', inputType: 'number' },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                {f.type === 'select' ? (
                  <select value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {f.opts?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.inputType || 'text'} value={(form as any)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} required={f.key === 'price'}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                )}
              </div>
            ))}
          </div>
          <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold">추가</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.filter((p) => p.isActive !== false).map((p) => {
          const isMaster = p.series === '-';
          const seriesLabel = isMaster ? '주인형 점주' : `${p.series}시리즈`;
          const stepLabel = p.step ? ` ${p.step}권 (48권)` : '';
          const langLabel = p.language !== '-' ? ` · ${p.language}` : '';
          return (
            <div key={p.id} className="bg-slate-900 border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 transition-all">
              <div className="text-xs text-indigo-400 font-semibold mb-1">{p.memberType}</div>
              <div className="text-white font-bold text-lg">{seriesLabel}{stepLabel}{langLabel}</div>
              <div className="text-2xl font-bold text-white mt-3">{fmt(p.price)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
