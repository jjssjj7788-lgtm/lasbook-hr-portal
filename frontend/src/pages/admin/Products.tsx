import { useEffect, useRef, useState } from 'react';
import api from '../../lib/axios';
import { format } from 'date-fns';
import { downloadExcel, parseExcel } from '../../lib/excel';

function fmt(n: number) { return `${n.toLocaleString('ko-KR')}원`; }

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ memberType: '구독회원', series: 'K2', step: 'A', language: '한글', price: '' });
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ ok: number; fail: string[] } | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const load = () => api.get('/products').then((r) => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/products', { ...form, step: form.step || null, price: Number(form.price) });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 상품을 삭제하시겠습니까?')) return;
    await api.delete(`/products/${id}`);
    load();
  };

  const handleDeleteZeroPriced = async () => {
    const zeroCount = products.filter((p) => p.price === 0).length;
    if (zeroCount === 0) { alert('0원인 상품이 없습니다.'); return; }
    if (!confirm(`0원 상품 ${zeroCount}개를 모두 삭제하시겠습니까?`)) return;
    setDeleting(true);
    await api.delete('/products/zero-price');
    await load();
    setDeleting(false);
  };

  // ── 엑셀 다운로드 ──
  const handleDownloadExcel = () => {
    const rows = products.filter((p) => p.isActive !== false).map((p) => ({
      'ID': p.id,
      '회원종류': p.memberType,
      '시리즈': p.series,
      '분권(A/B)': p.step ?? '',
      '언어': p.language,
      '정가(원)': p.price,
    }));
    downloadExcel(rows, `상품목록_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  // ── 업로드 양식 다운로드 ──
  const handleDownloadTemplate = () => {
    const template = [
      { '회원종류': '구독회원 (필수)', '시리즈': 'K2 (필수)', '분권(A/B)': 'A', '언어': '한글', '정가(원)': 1600000 },
      { '회원종류': '구매회원', '시리즈': 'K2', '분권(A/B)': 'B', '언어': '영어', '정가(원)': 1600000 },
      { '회원종류': '주인형 점주', '시리즈': '-', '분권(A/B)': '', '언어': '-', '정가(원)': 0 },
    ];
    downloadExcel(template, '상품_업로드양식.xlsx');
  };

  // ── 엑셀 업로드 ──
  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    setUploadResult(null);
    try {
      const rows = await parseExcel(file);
      let ok = 0;
      const fail: string[] = [];
      for (const row of rows) {
        const memberType = String(row['회원종류'] ?? '').trim().replace(' (필수)', '');
        const series = String(row['시리즈'] ?? '').trim().replace(' (필수)', '');
        const step = String(row['분권(A/B)'] ?? '').trim() || null;
        const language = String(row['언어'] ?? '한글').trim();
        const price = Number(row['정가(원)'] ?? 0);
        if (!memberType || !series) { fail.push(`행 오류 — 회원종류/시리즈 필수`); continue; }
        try {
          await api.post('/products', { memberType, series, step, language, price });
          ok++;
        } catch (err: any) {
          fail.push(`${memberType} ${series} — ${err.response?.data?.message ?? '등록 실패'}`);
        }
      }
      setUploadResult({ ok, fail });
      load();
    } finally {
      setUploading(false);
    }
  };

  const zeroPricedCount = products.filter((p) => p.price === 0).length;

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      {/* ── 헤더 ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">상품 관리</h1>
          <p className="text-slate-400 text-sm mt-1">판매 실적 등록 시 사용되는 상품 가격표</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {zeroPricedCount > 0 && (
            <button onClick={handleDeleteZeroPriced} disabled={deleting}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-medium transition-all">
              🗑 0원 {zeroPricedCount}개 삭제
            </button>
          )}
          <button onClick={handleDownloadTemplate}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-medium transition-all">
            📋 양식 다운
          </button>
          <button onClick={handleDownloadExcel}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-medium transition-all">
            ⬇ 엑셀 다운
          </button>
          <label className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
            uploading ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
          }`}>
            {uploading ? '업로드 중...' : '⬆ 엑셀 업로드'}
            <input ref={uploadRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUploadExcel} disabled={uploading} />
          </label>
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all">
            {showForm ? '취소' : '+ 상품 추가'}
          </button>
        </div>
      </div>

      {/* ── 업로드 결과 ── */}
      {uploadResult && (
        <div className={`rounded-xl px-4 py-3 text-sm flex items-start justify-between gap-3 ${
          uploadResult.fail.length > 0 ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          <div>
            <div className="font-semibold mb-1">업로드 완료: 성공 {uploadResult.ok}건{uploadResult.fail.length > 0 ? ` / 실패 ${uploadResult.fail.length}건` : ''}</div>
            {uploadResult.fail.map((f, i) => <div key={i} className="text-xs opacity-75">• {f}</div>)}
          </div>
          <button onClick={() => setUploadResult(null)} className="text-xs opacity-50 hover:opacity-100 flex-shrink-0">✕</button>
        </div>
      )}

      {/* ── 등록 폼 ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {[
              { label: '회원종류', key: 'memberType', type: 'select', opts: ['구독회원', '구매회원', '주인형 점주'] },
              { label: '시리즈', key: 'series', placeholder: 'K2, S, G, -' },
              { label: '분권(A/B)', key: 'step', placeholder: 'A 또는 B' },
              { label: '언어', key: 'language', type: 'select', opts: ['한글', '영어', '-'] },
              { label: '정가(원)', key: 'price', inputType: 'number' },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                {f.type === 'select' ? (
                  <select value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {f.opts?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.inputType || 'text'} value={(form as any)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} required={f.key === 'price'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                )}
              </div>
            ))}
          </div>
          <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold">추가</button>
        </form>
      )}

      {/* ── 0원 경고 ── */}
      {zeroPricedCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
          ⚠️ 가격이 0원인 상품이 <span className="font-bold">{zeroPricedCount}개</span> 있습니다.
        </div>
      )}

      {/* ── 상품 목록 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.filter((p) => p.isActive !== false).map((p) => {
          const isMaster = p.series === '-';
          const isZeroPrice = p.price === 0;
          const seriesLabel = isMaster ? '주인형 점주' : `${p.series}`;
          const stepLabel = p.step ? ` ${p.step}` : '';
          const langLabel = p.language !== '-' ? ` · ${p.language}` : '';
          return (
            <div key={p.id} className={`relative bg-white border rounded-2xl p-5 transition-all group shadow-sm ${
              isZeroPrice ? 'border-red-300' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
            }`}>
              {isZeroPrice && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">0원</span>
              )}
              <button onClick={() => handleDelete(p.id)}
                className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-200 text-red-600 text-xs px-2.5 py-1 rounded-lg">
                🗑 삭제
              </button>
              <div className="text-xs text-indigo-500 font-semibold mb-1">{p.memberType}</div>
              <div className="text-slate-900 font-bold text-lg">{seriesLabel}{stepLabel}{langLabel}</div>
              <div className={`text-2xl font-bold mt-3 ${isZeroPrice ? 'text-red-500' : 'text-slate-900'}`}>{fmt(p.price)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
