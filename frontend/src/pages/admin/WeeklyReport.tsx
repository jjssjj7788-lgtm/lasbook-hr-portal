import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import html2canvas from 'html2canvas';

/* 주간 날짜 배열 생성 (startDate ~ endDate) */
function getDaysInRange(start: string, end: string): Date[] {
  const days: Date[] = [];
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  let cur = new Date(s);
  while (cur <= e) { days.push(new Date(cur)); cur = addDays(cur, 1); }
  return days;
}

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];
const DAY_COLORS: Record<number, string> = { 0: '#e05252', 6: '#5282e0' }; // 일=빨강, 토=파랑

/* ── 이미지 현황판 (흰 배경) ── */
function WeeklyBoard({ projectName, roomName, memberCount, days, employees, reportMap, salesMap }: {
  projectName: string; roomName: string; memberCount: number;
  days: Date[];
  employees: any[];
  reportMap: Record<string, Record<string, number>>;  // employeeId → dateStr → count
  salesMap: Record<string, { subscriber: number; storeOwner: number }>;
}) {
  const startLabel = format(days[0], 'yyyy. MM. dd (EEE)', { locale: ko });
  const endLabel   = format(days[days.length - 1], 'yyyy. MM. dd (EEE)', { locale: ko });

  const colStyle = (d: Date) => ({ color: DAY_COLORS[d.getDay()] ?? '#111', fontWeight: 700 });

  return (
    <div style={{ background: '#111', color: '#fff', fontFamily: "'Malgun Gothic','Apple SD Gothic Neo',sans-serif", width: '1100px', padding: '28px 32px', boxSizing: 'border-box' }}>
      {/* 타이틀 행 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
          {projectName}&nbsp;
          <span style={{ color: '#888', margin: '0 6px' }}>|</span>
          일일활동보고서 통계표(종합)
        </div>
        <div style={{ fontSize: '14px', color: '#aaa' }}>{startLabel} ~ {endLabel}</div>
      </div>

      {/* 룸 헤더 */}
      <div style={{ background: '#1e1e1e', border: '1px solid #333', borderRadius: '6px', padding: '10px 16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{roomName}</span>
        <span style={{ color: '#aaa', fontSize: '14px' }}>{memberCount}명</span>
      </div>

      {/* 테이블 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          {/* 그룹 헤더 */}
          <tr style={{ background: '#1a1a1a' }}>
            <th rowSpan={2} style={{ border: '1px solid #333', padding: '8px', width: '36px', color: '#888' }}>No.</th>
            <th rowSpan={2} style={{ border: '1px solid #333', padding: '8px', width: '80px', color: '#ddd' }}>이 름</th>
            <th colSpan={days.length} style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', color: '#ddd' }}>가망고객 상담 통계</th>
            <th colSpan={3} style={{ border: '1px solid #333', padding: '8px', textAlign: 'center', color: '#ddd' }}>전체 누적 통계</th>
          </tr>
          {/* 날짜 헤더 */}
          <tr style={{ background: '#1a1a1a' }}>
            {days.map((d, i) => (
              <th key={i} style={{ border: '1px solid #333', padding: '6px 4px', textAlign: 'center', minWidth: '52px' }}>
                <div style={colStyle(d)}>{DAY_KO[d.getDay()]}</div>
                <div style={{ color: '#888', fontSize: '11px' }}>{format(d, 'M/d')}</div>
              </th>
            ))}
            <th style={{ border: '1px solid #333', padding: '6px 4px', textAlign: 'center', color: '#ccc', fontSize: '12px' }}>가망고객<br/>상담 누적</th>
            <th style={{ border: '1px solid #333', padding: '6px 4px', textAlign: 'center', color: '#60a5fa', fontSize: '12px' }}>구독회원<br/>유치</th>
            <th style={{ border: '1px solid #333', padding: '6px 4px', textAlign: 'center', color: '#fbbf24', fontSize: '12px' }}>주인형점주<br/>유치</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, idx) => {
            const totalCounsel = days.reduce((s, d) => s + (reportMap[emp.employeeId]?.[format(d, 'yyyy-MM-dd')] ?? 0), 0);
            const sub   = salesMap[emp.employeeId]?.subscriber ?? 0;
            const owner = salesMap[emp.employeeId]?.storeOwner ?? 0;
            return (
              <tr key={emp.employeeId} style={{ background: idx % 2 === 0 ? '#161616' : '#1c1c1c' }}>
                <td style={{ border: '1px solid #2a2a2a', padding: '10px 6px', textAlign: 'center', color: '#666' }}>{idx + 1}</td>
                <td style={{ border: '1px solid #2a2a2a', padding: '10px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>{emp.name}</td>
                {days.map((d, i) => {
                  const cnt = reportMap[emp.employeeId]?.[format(d, 'yyyy-MM-dd')] ?? 0;
                  return (
                    <td key={i} style={{ border: '1px solid #2a2a2a', padding: '10px 4px', textAlign: 'center' }}>
                      {cnt > 0 ? <span style={{ fontWeight: 'bold', color: '#fff' }}>{cnt}</span> : <span style={{ color: '#333' }}>-</span>}
                    </td>
                  );
                })}
                <td style={{ border: '1px solid #2a2a2a', padding: '10px 6px', textAlign: 'center', fontWeight: 'bold' }}>{totalCounsel || <span style={{ color: '#333' }}>-</span>}</td>
                <td style={{ border: '1px solid #2a2a2a', padding: '10px 6px', textAlign: 'center', fontWeight: 'bold', color: sub > 0 ? '#60a5fa' : '#333' }}>{sub || '-'}</td>
                <td style={{ border: '1px solid #2a2a2a', padding: '10px 6px', textAlign: 'center', fontWeight: 'bold', color: owner > 0 ? '#fbbf24' : '#333' }}>{owner || '-'}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: '#111', borderTop: '2px solid #555' }}>
            <td colSpan={2} style={{ border: '1px solid #333', padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#ccc' }}>합 계</td>
            {days.map((d, i) => {
              const total = employees.reduce((s, emp) => s + (reportMap[emp.employeeId]?.[format(d, 'yyyy-MM-dd')] ?? 0), 0);
              return <td key={i} style={{ border: '1px solid #333', padding: '10px 4px', textAlign: 'center', fontWeight: 'bold', color: total > 0 ? '#fff' : '#333' }}>{total || '-'}</td>;
            })}
            <td style={{ border: '1px solid #333', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
              {employees.reduce((s, emp) => s + days.reduce((ss, d) => ss + (reportMap[emp.employeeId]?.[format(d, 'yyyy-MM-dd')] ?? 0), 0), 0)}
            </td>
            <td style={{ border: '1px solid #333', padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#60a5fa' }}>
              {Object.values(salesMap).reduce((s, v) => s + v.subscriber, 0) || '-'}
            </td>
            <td style={{ border: '1px solid #333', padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#fbbf24' }}>
              {Object.values(salesMap).reduce((s, v) => s + v.storeOwner, 0) || '-'}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ── 메인 주간보고서 페이지 ── */
export default function WeeklyReport() {
  const { selectedProjectId } = useAuthStore();
  const [projectName, setProjectName] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [capturing, setCapturing] = useState(false);

  // 이번 주 토~금 기본값
  const thisWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 6 }), 'yyyy-MM-dd');
  const thisWeekEnd   = format(endOfWeek(new Date(),   { weekStartsOn: 6 }), 'yyyy-MM-dd');

  const [startDate, setStartDate] = useState(thisWeekStart);
  const [endDate,   setEndDate]   = useState(thisWeekEnd);
  const [selectedRoom, setSelectedRoom] = useState(''); // '' = 전체
  const [previewRoom, setPreviewRoom] = useState('');   // 미리보기/다운로드용 룸
  const [showPreview, setShowPreview] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const month = startDate.slice(0, 7);
      const [projRes, roomsRes, empRes, repRes, salesRes] = await Promise.all([
        api.get(`/projects/${selectedProjectId}`),
        api.get(`/rooms?projectId=${selectedProjectId}`),
        api.get(`/users?projectId=${selectedProjectId}`),
        api.get(`/activity-reports?projectId=${selectedProjectId}&startDate=${startDate}&endDate=${endDate}`),
        api.get(`/sales?projectId=${selectedProjectId}&month=${month}`),
      ]);
      setProjectName(projRes.data?.name ?? '');
      setRooms(roomsRes.data);
      setAllEmployees(empRes.data.filter((u: any) => u.role === 'USER'));
      setReports(repRes.data);
      setSales(salesRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedProjectId]);

  /* 파생 계산 */
  const days = getDaysInRange(startDate, endDate);

  // 룸 필터 적용된 직원 목록
  const filteredEmployees = selectedRoom
    ? allEmployees.filter((e) => e.room?.id === Number(selectedRoom))
    : allEmployees;

  // 미리보기용 직원 목록
  const previewEmployees = previewRoom
    ? allEmployees.filter((e) => e.room?.id === Number(previewRoom))
    : allEmployees;

  const previewRoomObj = rooms.find((r) => r.id === Number(previewRoom));
  const previewRoomName = previewRoom ? (previewRoomObj?.name ?? '') : '전체';

  // reportMap: employeeId → dateStr → count
  const reportMap: Record<string, Record<string, number>> = {};
  reports.forEach((r) => {
    const eid = r.employeeId;
    const ds = format(new Date(r.submittedAt), 'yyyy-MM-dd');
    if (!reportMap[eid]) reportMap[eid] = {};
    reportMap[eid][ds] = (reportMap[eid][ds] ?? 0) + 1;
  });

  // previewSalesMap (기간 내 판매만)
  const previewSalesMap: Record<string, { subscriber: number; storeOwner: number }> = {};
  sales.forEach((s) => {
    const sd = s.saleDate?.slice(0, 10);
    if (sd < startDate || sd > endDate) return;
    const eid = s.employeeId;
    if (!previewSalesMap[eid]) previewSalesMap[eid] = { subscriber: 0, storeOwner: 0 };
    if (s.product?.memberType === '주인형 점주') previewSalesMap[eid].storeOwner += 1;
    else previewSalesMap[eid].subscriber += 1;
  });

  // 화면 테이블용 salesMap (필터된 직원만)
  const tableSalesMap: Record<string, { subscriber: number; storeOwner: number }> = {};
  filteredEmployees.forEach((e) => { if (previewSalesMap[e.employeeId]) tableSalesMap[e.employeeId] = previewSalesMap[e.employeeId]; });

  const handleCapture = async () => {
    if (!boardRef.current) return;
    setCapturing(true);
    try {
      const canvas = await html2canvas(boardRef.current, { backgroundColor: '#111', scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `주간보고서_${startDate}_${endDate}_${previewRoomName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally { setCapturing(false); }
  };

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">주간 활동보고서</h1>
          <p className="text-slate-400 text-sm mt-1">날짜 범위를 선택하면 직원별 상담 현황을 자동 집계합니다</p>
        </div>
        <button onClick={() => { setPreviewRoom(selectedRoom); setShowPreview(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-sm font-bold transition-all">
          📸 이미지로 내보내기
        </button>
      </div>

      {/* 날짜 범위 + 조회 */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">시작일</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="text-slate-500 self-center pb-0.5">~</div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">종료일</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        {/* 빠른 선택 */}
        <div className="flex gap-2 flex-wrap">
          {['이번 주', '지난 주'].map((label, i) => {
            const base = addDays(new Date(), i === 1 ? -7 : 0);
            const s = format(startOfWeek(base, { weekStartsOn: 6 }), 'yyyy-MM-dd');
            const e = format(endOfWeek(base, { weekStartsOn: 6 }), 'yyyy-MM-dd');
            return (
              <button key={label} onClick={() => { setStartDate(s); setEndDate(e); }}
                className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs transition-all">
                {label}
              </button>
            );
          })}
        </div>
        <button onClick={load} disabled={loading}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all">
          {loading ? '조회 중...' : '조회'}
        </button>
      </div>

      {/* 룸 필터 탭 */}
      {rooms.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {[{ id: '', name: '전체' }, ...rooms].map((r: any) => (
            <button key={r.id} onClick={() => setSelectedRoom(String(r.id === '' ? '' : r.id))}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${selectedRoom === String(r.id === '' ? '' : r.id) ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700'}`}>
              {r.id === '' ? '전체' : `💬 ${r.name}`}
            </button>
          ))}
        </div>
      )}

      {/* 화면 테이블 미리보기 */}
      {loading ? (
        <div className="h-48 bg-slate-800 rounded-2xl animate-pulse" />
      ) : (
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-slate-500 font-medium text-left w-10">No.</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-left">이름</th>
                {days.map((d, i) => (
                  <th key={i} className="px-3 py-3 text-center font-medium" style={{ color: d.getDay() === 0 ? '#f87171' : d.getDay() === 6 ? '#60a5fa' : '#94a3b8' }}>
                    <div>{DAY_KO[d.getDay()]}</div>
                    <div className="text-xs text-slate-600">{format(d, 'M/d')}</div>
                  </th>
                ))}
                <th className="px-3 py-3 text-center text-slate-400 font-medium">누적</th>
                <th className="px-3 py-3 text-center text-blue-400 font-medium">구독</th>
                <th className="px-3 py-3 text-center text-amber-400 font-medium">점주</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEmployees.length === 0 ? (
                <tr><td colSpan={days.length + 5} className="text-center py-12 text-slate-600">직원이 없습니다</td></tr>
              ) : filteredEmployees.map((emp, idx) => {
                const total = days.reduce((s, d) => s + (reportMap[emp.employeeId]?.[format(d, 'yyyy-MM-dd')] ?? 0), 0);
                const sub   = tableSalesMap[emp.employeeId]?.subscriber ?? 0;
                const owner = tableSalesMap[emp.employeeId]?.storeOwner ?? 0;
                return (
                  <tr key={emp.employeeId} className="hover:bg-white/2">
                    <td className="px-4 py-3 text-slate-600">{idx + 1}</td>
                    <td className="px-4 py-3 text-white font-semibold">{emp.name}</td>
                    {days.map((d, i) => {
                      const cnt = reportMap[emp.employeeId]?.[format(d, 'yyyy-MM-dd')] ?? 0;
                      return <td key={i} className="px-3 py-3 text-center">{cnt > 0 ? <span className="text-white font-bold">{cnt}</span> : <span className="text-slate-700">-</span>}</td>;
                    })}
                    <td className="px-3 py-3 text-center font-bold text-white">{total || <span className="text-slate-700">-</span>}</td>
                    <td className="px-3 py-3 text-center font-bold" style={{ color: sub > 0 ? '#60a5fa' : '#334155' }}>{sub || '-'}</td>
                    <td className="px-3 py-3 text-center font-bold" style={{ color: owner > 0 ? '#fbbf24' : '#334155' }}>{owner || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-white/10 bg-slate-800/40">
                <td colSpan={2} className="px-4 py-3 text-center text-slate-400 font-bold">합 계</td>
                {days.map((d, i) => {
                  const tot = filteredEmployees.reduce((s, emp) => s + (reportMap[emp.employeeId]?.[format(d, 'yyyy-MM-dd')] ?? 0), 0);
                  return <td key={i} className="px-3 py-3 text-center font-bold text-white">{tot || <span className="text-slate-600">-</span>}</td>;
                })}
                <td className="px-3 py-3 text-center font-bold text-white">
                  {filteredEmployees.reduce((s, emp) => s + days.reduce((ss, d) => ss + (reportMap[emp.employeeId]?.[format(d, 'yyyy-MM-dd')] ?? 0), 0), 0)}
                </td>
                <td className="px-3 py-3 text-center font-bold text-blue-400">
                  {filteredEmployees.reduce((s, emp) => s + (tableSalesMap[emp.employeeId]?.subscriber ?? 0), 0) || '-'}
                </td>
                <td className="px-3 py-3 text-center font-bold text-amber-400">
                  {filteredEmployees.reduce((s, emp) => s + (tableSalesMap[emp.employeeId]?.storeOwner ?? 0), 0) || '-'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* 이미지 내보내기 모달 */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-start justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-6xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">📸 주간보고서 이미지 저장</h3>
                <p className="text-slate-400 text-xs mt-0.5">{startDate} ~ {endDate}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* 룸 선택 */}
                <select value={previewRoom} onChange={(e) => setPreviewRoom(e.target.value)}
                  className="bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none">
                  <option value="">전체 (종합)</option>
                  {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <button onClick={handleCapture} disabled={capturing}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all disabled:opacity-50">
                  {capturing ? '저장 중...' : '💾 이미지 저장'}
                </button>
                <button onClick={() => setShowPreview(false)}
                  className="w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl">✕</button>
              </div>
            </div>
            <div className="p-6 overflow-x-auto">
              <p className="text-xs text-slate-500 mb-3">미리보기 — 저장 시 고해상도(2배)로 출력됩니다</p>
              <div ref={boardRef} className="inline-block">
                <WeeklyBoard
                  projectName={projectName}
                  roomName={previewRoomName}
                  memberCount={previewEmployees.length}
                  days={days}
                  employees={previewEmployees}
                  reportMap={reportMap}
                  salesMap={previewSalesMap}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
