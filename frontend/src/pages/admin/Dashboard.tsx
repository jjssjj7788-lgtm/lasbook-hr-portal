import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';

const fmt  = (n: number) => n.toLocaleString('ko-KR') + '원';
const fmtS = (n: number) => { if (n >= 100000000) return (n / 100000000).toFixed(1) + '억'; if (n >= 10000) return Math.round(n / 10000) + '만'; return n.toLocaleString('ko-KR'); };

/* ── KPI 카드 ── */
function KpiCard({ label, value, sub, gradient, icon }: any) {
  return (
    <div className={`rounded-2xl p-5 flex items-start justify-between text-white ${gradient} shadow-lg`}>
      <div>
        <div className="text-xs opacity-70 mb-2 font-medium">{label}</div>
        <div className="text-2xl font-bold leading-tight">{value}</div>
        {sub && <div className="text-xs opacity-60 mt-1">{sub}</div>}
      </div>
      <div className="text-3xl opacity-80 mt-1">{icon}</div>
    </div>
  );
}

/* ── 시리즈 미니 바 차트 ── */
function SeriesChart({ title, data, accent }: { title: string; data: { label: string; value: number }[]; accent: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-3">
        <span className={`text-xs font-bold ${accent}`}>🔸 {title}</span>
        <span className="text-xs text-slate-500 ml-auto">판매 {fmt(data.reduce((s, d) => s + d.value, 0))}</span>
      </div>
      <div className="flex items-end gap-1 h-16">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="text-[9px] text-slate-500">{fmtS(d.value)}</div>
            <div className="w-full rounded-t-sm transition-all duration-700" style={{ height: `${Math.max(4, (d.value / max) * 48)}px`, background: accent.includes('violet') ? '#7c3aed' : accent.includes('blue') ? '#2563eb' : '#dc2626' }} />
            <div className="text-[9px] text-slate-400">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Top 12 랭킹 ── */
function Top12({ title, items }: { title: string; items: { name: string; value: number }[] }) {
  const medals = ['🥇', '🥈', '🥉'];
  const colors = ['text-yellow-300', 'text-slate-300', 'text-amber-600'];
  const colIdx = (i: number) => Math.floor(i / 4); // 3열 × 4행
  const cols = [items.slice(0, 4), items.slice(4, 8), items.slice(8, 12)];
  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-white mb-4">🏆 {title}</h3>
      <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
        {cols.map((col, ci) => (
          <div key={ci} className="space-y-1.5">
            {col.map((item, ri) => {
              const rank = ci * 4 + ri;
              return (
                <div key={rank} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-all">
                  <span className={`text-sm font-bold w-5 text-center flex-shrink-0 ${rank < 3 ? colors[rank] : 'text-slate-500'}`}>
                    {rank < 3 ? medals[rank] : rank + 1}
                  </span>
                  <span className="text-white text-xs font-semibold truncate flex-1">{item.name}</span>
                  <span className="text-indigo-300 text-xs font-bold flex-shrink-0">{fmtS(item.value)}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════ 메인 ════════ */
export default function AdminDashboard() {
  const { selectedProjectId } = useAuthStore();
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [allSales, setAllSales] = useState<any[]>([]);
  const [users, setUsers]   = useState<any[]>([]);
  const [rooms, setRooms]   = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 필터
  const [filterRoom,   setFilterRoom]   = useState('');
  const [filterSeries, setFilterSeries] = useState('');
  const [filterStep,   setFilterStep]   = useState('');
  const [filterStart,  setFilterStart]  = useState('');
  const [filterEnd,    setFilterEnd]    = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    Promise.all([
      api.get(`/sales?projectId=${selectedProjectId}&month=${month}`),
      api.get(`/users?projectId=${selectedProjectId}`),
      api.get(`/rooms?projectId=${selectedProjectId}`),
      api.get(`/projects/${selectedProjectId}`),
    ]).then(([sRes, uRes, rRes, pRes]) => {
      setAllSales(sRes.data);
      setUsers(uRes.data);
      setRooms(rRes.data);
      setProject(pRes.data);
    }).finally(() => setLoading(false));
  }, [selectedProjectId, month]);

  // 누계 (전기간)
  const [totalSales, setTotalSales] = useState<any[]>([]);
  useEffect(() => {
    if (!selectedProjectId) return;
    api.get(`/sales?projectId=${selectedProjectId}`).then(r => setTotalSales(r.data)).catch(() => {});
  }, [selectedProjectId]);

  /* ── 파생 계산 ── */
  // 시리즈별 바 차트 데이터 (유니크 시리즈 목록에서 상위 5개)
  const seriesGroups = useMemo(() => {
    const map: Record<string, number> = {};
    allSales.forEach(s => { const k = s.product?.series ?? '-'; map[k] = (map[k] ?? 0) + s.netAmount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [allSales]);

  // memberType + series 기준 바 차트 데이터
  const makeSeriesData = (keys: string[], memberType: string) =>
    keys.map(k => ({
      label: k,
      value: allSales
        .filter(s => s.product?.series === k && s.product?.memberType === memberType)
        .reduce((sum, s) => sum + s.netAmount, 0),
    }));

  // 구매회원
  const buy_kData = useMemo(() => makeSeriesData(['K2','K3','K4','K5','K6','K7'], '구매회원'), [allSales]);
  const buy_sData = useMemo(() => makeSeriesData(['S2','S3','S4','S5','S6','S7'], '구매회원'), [allSales]);
  const buy_gData = useMemo(() => makeSeriesData(['G1','G2','G3','G4','G5','G6'], '구매회원'), [allSales]);
  // 구독회원
  const sub_kData = useMemo(() => makeSeriesData(['K2','K3','K4','K5','K6','K7'], '구독회원'), [allSales]);
  const sub_sData = useMemo(() => makeSeriesData(['S2','S3','S4','S5','S6','S7'], '구독회원'), [allSales]);
  const sub_gData = useMemo(() => makeSeriesData(['G1','G2','G3','G4','G5','G6'], '구독회원'), [allSales]);

  // 필터 적용된 판매 목록
  const filtered = useMemo(() => {
    return allSales.filter(s => {
      if (filterRoom   && s.employee?.room?.id !== Number(filterRoom))   return false;
      if (filterSeries && s.product?.series !== filterSeries)              return false;
      if (filterStep   && s.product?.step   !== filterStep)               return false;
      if (filterStart  && s.saleDate < filterStart)                        return false;
      if (filterEnd    && s.saleDate > filterEnd)                          return false;
      return true;
    });
  }, [allSales, filterRoom, filterSeries, filterStep, filterStart, filterEnd]);

  const pagedSales = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // 룸별 Top12
  const roomTop12 = useMemo(() => {
    const map: Record<string, { name: string; value: number }> = {};
    allSales.forEach(s => {
      const rName = s.employee?.room?.name ?? '미배정';
      if (!map[rName]) map[rName] = { name: rName, value: 0 };
      map[rName].value += s.netAmount;
    });
    return Object.values(map).sort((a, b) => b.value - a.value).slice(0, 12);
  }, [allSales]);

  // 개인별 Top12
  const personalTop12 = useMemo(() => {
    const map: Record<string, { name: string; value: number }> = {};
    allSales.forEach(s => {
      const eid = s.employeeId;
      if (!map[eid]) map[eid] = { name: s.employee?.name ?? eid, value: 0 };
      map[eid].value += s.netAmount;
    });
    return Object.values(map).sort((a, b) => b.value - a.value).slice(0, 12);
  }, [allSales]);

  // KPI
  const totalNet    = allSales.reduce((s, x) => s + x.netAmount,    0);
  const monthNet    = allSales.reduce((s, x) => s + x.netAmount,    0); // 이미 month 필터됨
  const cumulNet    = totalSales.reduce((s, x) => s + x.netAmount,  0);
  const custCount   = new Set(allSales.map(s => s.customerName)).size;
  const uniqueSeries = [...new Set(allSales.map(s => s.product?.series).filter(Boolean))].sort();
  const uniqueSteps  = [...new Set(allSales.map(s => s.product?.step).filter(Boolean))].sort();

  const resetFilter = () => { setFilterRoom(''); setFilterSeries(''); setFilterStep(''); setFilterStart(''); setFilterEnd(''); setPage(1); };

  return (
    <div className="p-5 space-y-5 max-w-[1400px] mx-auto">
      {/* ── 헤더 ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-lg">📊</div>
          <div>
            <h1 className="text-xl font-bold text-white">{project?.name ?? ''} 판매 매출 현황</h1>
            <p className="text-xs text-slate-500">이번 달 기준 · {month}</p>
          </div>
        </div>
        <input type="month" value={month} onChange={(e) => { setMonth(e.target.value); setPage(1); }}
          className="bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      {/* ── KPI 4카드 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="순누계 매출"    value={fmt(cumulNet)}          sub="전체 기간 기준"  gradient="bg-gradient-to-br from-teal-400 to-cyan-600"      icon="📈" />
        <KpiCard label="이번 달 순매출" value={fmt(monthNet)}          sub="수수료 차감 후"  gradient="bg-gradient-to-br from-violet-500 to-purple-700"   icon="🗓" />
        <KpiCard label="유치 건수"      value={`${allSales.length}건`} sub={`${month} 기준`} gradient="bg-gradient-to-br from-orange-400 to-amber-600"    icon="📋" />
        <KpiCard label="고객 수"        value={`${custCount}명`}       sub="유니크 고객"     gradient="bg-gradient-to-br from-rose-400 to-pink-600"       icon="👤" />
      </div>

      {/* ── 시리즈별 미니 차트 ── 구매회원 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">🛒 구매회원</span>
          <span className="text-xs text-slate-500">{allSales.filter(s => s.product?.memberType === '구매회원').length}건 · {fmt(allSales.filter(s => s.product?.memberType === '구매회원').reduce((a, s) => a + s.netAmount, 0))}</span>
        </div>
        <div className="flex gap-3">
          <SeriesChart title="K (K2~K7)" data={buy_kData} accent="text-violet-400" />
          <SeriesChart title="S (S2~S7)" data={buy_sData} accent="text-rose-400" />
          <SeriesChart title="G (G1~G6)" data={buy_gData} accent="text-blue-400" />
        </div>
      </div>

      {/* ── 시리즈별 미니 차트 ── 구독회원 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">📅 구독회원</span>
          <span className="text-xs text-slate-500">{allSales.filter(s => s.product?.memberType === '구독회원').length}건 · {fmt(allSales.filter(s => s.product?.memberType === '구독회원').reduce((a, s) => a + s.netAmount, 0))}</span>
        </div>
        <div className="flex gap-3">
          <SeriesChart title="K (K2~K7)" data={sub_kData} accent="text-violet-400" />
          <SeriesChart title="S (S2~S7)" data={sub_sData} accent="text-rose-400" />
          <SeriesChart title="G (G1~G6)" data={sub_gData} accent="text-blue-400" />
        </div>
      </div>

      {/* ── 룸별 / 개인별 Top 12 ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Top12 title="룸별 매출 Top 12"  items={roomTop12.length > 0 ? roomTop12 : [{ name: '데이터 없음', value: 0 }]} />
        <Top12 title="개인별 매출 Top 12" items={personalTop12.length > 0 ? personalTop12 : [{ name: '데이터 없음', value: 0 }]} />
      </div>

      {/* ── 필터 행 ── */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">룸 선택</label>
            <select value={filterRoom} onChange={e => { setFilterRoom(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none w-36">
              <option value="">전체 룸</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">시리즈</label>
            <select value={filterSeries} onChange={e => { setFilterSeries(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none w-28">
              <option value="">전체</option>
              {uniqueSeries.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">A/B</label>
            <select value={filterStep} onChange={e => { setFilterStep(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none w-24">
              <option value="">전체</option>
              {uniqueSteps.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">시작일</label>
            <input type="date" value={filterStart} onChange={e => { setFilterStart(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">종료일</label>
            <input type="date" value={filterEnd} onChange={e => { setFilterEnd(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none" />
          </div>
          <button onClick={resetFilter}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm transition-all">
            초기화
          </button>
        </div>
      </div>

      {/* ── 결과 요약 + 테이블 ── */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        {/* 테이블 헤더 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
          <span className="text-sm text-slate-400">
            총 <span className="text-white font-bold">{filtered.length}</span>건 ·
            순매출 <span className="text-indigo-300 font-bold">{fmt(filtered.reduce((s, x) => s + x.netAmount, 0))}</span>
          </span>
          <div className="flex gap-2">
            <span className="text-xs text-slate-500">{page}/{totalPages} 페이지</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-slate-800/40">
                {['No.', '날짜', '룸', '직급', '담당자', '고객명', '연락처', '상품', 'A/B', '결제', '실결제', '수수료', '순매출', '주차'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[11px] text-slate-500 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={14} className="px-4 py-3"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td></tr>
                ))
              ) : pagedSales.length === 0 ? (
                <tr><td colSpan={14} className="text-center py-12 text-slate-600">조회된 실적이 없습니다</td></tr>
              ) : (
                pagedSales.map((s, i) => (
                  <tr key={s.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-3 py-3 text-slate-600 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-3 py-3 text-slate-400 text-xs whitespace-nowrap">{format(new Date(s.saleDate), 'MM.dd')}</td>
                    <td className="px-3 py-3 text-slate-300 text-xs whitespace-nowrap">{s.employee?.room?.name ?? '-'}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                        s.employee?.position?.code === 'TEBA'    ? 'bg-amber-500/20 text-amber-300' :
                        s.employee?.position?.code === 'DOJE'    ? 'bg-blue-500/20 text-blue-300'   :
                        s.employee?.position?.code === 'TRAINEE' ? 'bg-emerald-500/20 text-emerald-300' :
                        s.employee?.position?.code === 'MANAGER' ? 'bg-violet-500/20 text-violet-300' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>{s.employee?.position?.name ?? '-'}</span>
                    </td>
                    <td className="px-3 py-3 text-white font-medium whitespace-nowrap">{s.employee?.name ?? '-'}</td>
                    <td className="px-3 py-3 text-slate-300 whitespace-nowrap">{s.customerName}</td>
                    <td className="px-3 py-3 text-slate-500 text-xs whitespace-nowrap">{s.customerPhone ?? '-'}</td>
                    <td className="px-3 py-3 text-slate-300 text-xs whitespace-nowrap">
                      {s.product?.memberType === '주인형 점주' ? '주인형점주' : `${s.product?.series ?? ''}`}
                      {s.product?.language && s.product.language !== '-' ? ` ${s.product.language}` : ''}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {s.product?.step ? (
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-lg">{s.product.step}</span>
                      ) : <span className="text-slate-700">-</span>}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.paymentMethod === 'CARD' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {s.paymentMethod === 'CARD' ? '카드' : '현금'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-300 text-xs whitespace-nowrap text-right">{s.actualAmount.toLocaleString('ko-KR')}</td>
                    <td className="px-3 py-3 text-orange-400 text-xs whitespace-nowrap text-right">{s.deductedFee > 0 ? `-${s.deductedFee.toLocaleString('ko-KR')}` : '-'}</td>
                    <td className="px-3 py-3 text-indigo-300 font-bold text-sm whitespace-nowrap text-right">{s.netAmount.toLocaleString('ko-KR')}</td>
                    <td className="px-3 py-3 text-slate-500 text-xs text-center">{s.salesWeek}주</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-5 py-4 border-t border-white/5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-30 transition-all text-sm">‹</button>
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 3, totalPages - 6)) + i;
              return p <= totalPages ? (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all ${p === page ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  {p}
                </button>
              ) : null;
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-30 transition-all text-sm">›</button>
          </div>
        )}
      </div>
    </div>
  );
}
