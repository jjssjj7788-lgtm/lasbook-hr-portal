import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import html2canvas from 'html2canvas';

const EVAL_O = '\u25cb';
const EVAL_T = '\u25b3';
const EVAL_X = '\u2715';
const EVAL_OPTIONS = [EVAL_O, EVAL_T, EVAL_X];

const EVAL_COLORS: Record<string, string> = {
  [EVAL_O]: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  [EVAL_T]: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  [EVAL_X]: 'bg-red-500/20 text-red-300 border-red-500/40',
};

function evalStyleColor(ev: string) {
  if (ev === EVAL_O) return '#4ade80';
  if (ev === EVAL_T) return '#fbbf24';
  if (ev === EVAL_X) return '#f87171';
  return '#888';
}

/* ========== 이미지 현황판 컴포넌트 ========== */
function ReportBoard({ date, projectName, roomName, groupedList, salesMap }: {
  date: string;
  projectName: string;
  roomName: string;
  groupedList: { employee: any; reports: any[] }[];
  salesMap: Record<string, { subscriber: number; storeOwner: number }>;
}) {
  const dateLabel = format(new Date(date + 'T00:00:00'), 'yyyy. MM. dd (EEE)', { locale: ko });
  const totalCounsel = groupedList.reduce((s, g) => s + g.reports.length, 0);
  const totalSub = groupedList.reduce((s, g) => s + (salesMap[g.employee?.employeeId]?.subscriber ?? 0), 0);
  const totalOwner = groupedList.reduce((s, g) => s + (salesMap[g.employee?.employeeId]?.storeOwner ?? 0), 0);

  return (
    <div style={{ background: '#1a1a1a', color: '#fff', fontFamily: 'Malgun Gothic, sans-serif', width: '960px', padding: '24px 32px' }}>
      {/* 타이틀 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px' }}>
          {projectName}
          <span style={{ color: '#888', margin: '0 8px' }}>|</span>
          일일 보고서 현황판
          <span style={{ color: '#888', margin: '0 8px' }}>|</span>
          {roomName || '전체'}
        </div>
        <div style={{ fontSize: '16px', color: '#bbb' }}>{dateLabel}</div>
      </div>

      {/* 표 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
        <thead>
          <tr style={{ borderTop: '1px solid #444', borderBottom: '1px solid #444' }}>
            {['No.', '이  름', '가망고객 상담', '구독회원 유치', '주인형점주 유치'].map((h) => (
              <th key={h} style={{ padding: '10px 12px', color: '#ccc', fontWeight: 'normal', textAlign: 'center' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groupedList.map(({ employee, reports }, idx) => {
            const counselCount = reports.length;
            const evals = reports.map((r) => r.adminEvaluation ?? '').filter(Boolean);
            const sub = salesMap[employee?.employeeId]?.subscriber ?? 0;
            const owner = salesMap[employee?.employeeId]?.storeOwner ?? 0;
            return (
              <tr key={employee?.employeeId} style={{ borderBottom: '1px solid #333', background: idx % 2 === 0 ? '#1e1e1e' : '#242424' }}>
                <td style={{ textAlign: 'center', padding: '12px', color: '#888', width: '48px' }}>{idx + 1}</td>
                <td style={{ textAlign: 'center', padding: '12px', fontWeight: 'bold', fontSize: '16px', width: '120px' }}>{employee?.name}</td>
                {/* 횟수(우정렬 고정) | 도형(좌정렬 고정) */}
                <td style={{ padding: '12px', width: '280px' }}>
                  {counselCount > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', display: 'inline-block', width: '48px', textAlign: 'right', flexShrink: 0 }}>{counselCount}회</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', minWidth: '80px', paddingLeft: '10px' }}>
                        {evals.length > 0
                          ? evals.map((ev, i) => (
                              <span key={i} style={{ color: evalStyleColor(ev), fontWeight: 'bold', fontSize: '17px', lineHeight: '1' }}>{ev}</span>
                            ))
                          : <span style={{ color: '#666', fontSize: '13px' }}>(미평가)</span>
                        }
                      </span>
                    </div>
                  ) : <div style={{ textAlign: 'center', color: '#555' }}>-</div>}
                </td>
                <td style={{ textAlign: 'center', padding: '12px', width: '180px' }}>
                  {sub > 0 ? <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{sub}</span> : <span style={{ color: '#555' }}>-</span>}
                </td>
                <td style={{ textAlign: 'center', padding: '12px', width: '180px' }}>
                  {owner > 0 ? <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{owner}</span> : <span style={{ color: '#555' }}>-</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '2px solid #555', background: '#1a1a1a' }}>
            <td colSpan={2} style={{ textAlign: 'center', padding: '14px', fontWeight: 'bold', color: '#ccc' }}>합  계</td>
            <td style={{ textAlign: 'center', padding: '14px', fontWeight: 'bold', color: '#fff' }}>{totalCounsel}회</td>
            <td style={{ textAlign: 'center', padding: '14px', fontWeight: 'bold', color: totalSub > 0 ? '#60a5fa' : '#555' }}>
              {totalSub > 0 ? totalSub : '-'}
            </td>
            <td style={{ textAlign: 'center', padding: '14px', fontWeight: 'bold', color: totalOwner > 0 ? '#fbbf24' : '#555' }}>
              {totalOwner > 0 ? totalOwner : '-'}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ========== 메인 페이지 ========== */
export default function AdminReports() {
  const { selectedProjectId } = useAuthStore();
  const [reports, setReports] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [evalInputs, setEvalInputs] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [showExport, setShowExport] = useState(false);
  const [exportRoom, setExportRoom] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [salesMap, setSalesMap] = useState<Record<string, { subscriber: number; storeOwner: number }>>({});
  const [filterRoom, setFilterRoom] = useState('');
  const boardRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const month = selectedDate.slice(0, 7);
      const [reportsRes, roomsRes, projRes, salesRes] = await Promise.all([
        api.get(`/activity-reports?projectId=${selectedProjectId}&date=${selectedDate}`),
        api.get(`/rooms?projectId=${selectedProjectId}`),
        api.get(`/projects/${selectedProjectId}`),
        api.get(`/sales?projectId=${selectedProjectId}&month=${month}`),
      ]);
      setReports(reportsRes.data);
      setRooms(roomsRes.data);
      setProjectName(projRes.data?.name ?? '');

      const init: Record<number, string> = {};
      (reportsRes.data as any[]).forEach((r) => { if (r.adminEvaluation) init[r.id] = r.adminEvaluation; });
      setEvalInputs(init);

      // 당일 매출 필터 -> 직원별 구독/주인형 카운트
      const daySales = (salesRes.data as any[]).filter((s) => s.saleDate?.startsWith(selectedDate));
      const map: Record<string, { subscriber: number; storeOwner: number }> = {};
      daySales.forEach((s) => {
        const eid = s.employeeId;
        if (!map[eid]) map[eid] = { subscriber: 0, storeOwner: 0 };
        if (s.product?.memberType === '주인형 점주') map[eid].storeOwner += 1;
        else map[eid].subscriber += 1;
      });
      setSalesMap(map);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedProjectId, selectedDate]);

  const handleSaveEval = async (id: number) => {
    setSaving((p) => ({ ...p, [id]: true }));
    try {
      await api.patch(`/activity-reports/${id}/evaluation`, { adminEvaluation: evalInputs[id] ?? '' });
      load();
    } finally {
      setSaving((p) => ({ ...p, [id]: false }));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 보고서를 삭제할까요?')) return;
    await api.delete(`/activity-reports/${id}`);
    load();
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(format(d, 'yyyy-MM-dd'));
  };

  // 직원별 그룹핑
  const grouped: Record<string, { employee: any; reports: any[] }> = {};
  reports.forEach((r) => {
    if (!grouped[r.employeeId]) grouped[r.employeeId] = { employee: r.employee, reports: [] };
    grouped[r.employeeId].reports.push(r);
  });
  const groupedList = Object.values(grouped);

  // 팀 필터 적용
  const filteredGroupedList = filterRoom
    ? groupedList.filter(({ employee }) => employee?.room?.id === Number(filterRoom))
    : groupedList;

  const exportGroupedList = exportRoom
    ? groupedList.filter(({ employee }) => employee?.room?.id === Number(exportRoom))
    : groupedList;
  const exportRoomName = exportRoom
    ? rooms.find((r) => r.id === Number(exportRoom))?.name ?? ''
    : '전체';

  const handleCapture = async () => {
    if (!boardRef.current) return;
    setCapturing(true);
    try {
      const canvas = await html2canvas(boardRef.current, { backgroundColor: '#1a1a1a', scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `일일보고서_${selectedDate}_${exportRoomName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">일일 활동 보고서</h1>
          <p className="text-slate-400 text-sm mt-1">관리자 평가 전용 — 직원에게 노출 안 됨</p>
        </div>
        <button onClick={() => setShowExport(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-sm font-bold transition-all">
          📸 이미지로 내보내기
        </button>
      </div>

      {/* 날짜 선택 */}
      <div className="flex items-center gap-3">
        <button onClick={() => changeDate(-1)}
          className="w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-white/10 transition-all text-lg">
          &lt;
        </button>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer" />
        <button onClick={() => changeDate(1)}
          className="w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-white/10 transition-all text-lg">
          &gt;
        </button>
        <button onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
          className="px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-sm transition-all">
          오늘
        </button>
        <span className="ml-auto text-sm text-slate-400">
          {format(new Date(selectedDate + 'T00:00:00'), 'yyyy년 MM월 dd일 (EEE)', { locale: ko })}
          {reports.length > 0 && <span className="ml-2 text-white font-semibold">{reports.length}건</span>}
        </span>
      </div>


      {/* 팀 필터 */}
      {rooms.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setFilterRoom('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${!filterRoom ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700'}`}>
            전체
          </button>
          {rooms.map((room: any) => (
            <button key={room.id} onClick={() => setFilterRoom(String(room.id))}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${filterRoom === String(room.id) ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700'}`}>
              💬 {room.name}
            </button>
          ))}
        </div>
      )}

      {/* 보고서 목록 */}
      {loading ? (
        <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="h-48 bg-slate-800 rounded-2xl animate-pulse" />)}</div>
      ) : filteredGroupedList.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-lg font-medium">이 날의 보고서가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredGroupedList.map(({ employee, reports: empReports }) => (
            <div key={employee?.employeeId} className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
              {/* 직원 헤더 */}
              <div className="flex items-center gap-4 px-5 py-4 bg-slate-800/40 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-300 font-bold">{employee?.name?.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold">{employee?.name}</span>
                    {employee?.position && <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">{employee.position.name}</span>}
                    {employee?.room && <span className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">💬 {employee.room.name}</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{employee?.employeeId}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-white">{empReports.length}</div>
                  <div className="text-xs text-slate-500">건 상담</div>
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {empReports.map((r, idx) => (
                  <div key={r.id} className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-500">#{idx + 1} · {format(new Date(r.submittedAt), 'HH:mm')} 제출</span>
                      <button onClick={() => handleDelete(r.id)} className="text-xs text-slate-700 hover:text-red-400 transition-colors">삭제</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[{ label: '고객명', value: r.customerName }, { label: '연락처', value: r.customerPhone }, { label: '자녀 나이', value: r.childAge }].map(({ label, value }) => (
                        <div key={label} className="bg-slate-800 rounded-xl px-3 py-2.5">
                          <div className="text-xs text-slate-500 mb-1">{label}</div>
                          <div className="text-sm text-white font-semibold">{value || '-'}</div>
                        </div>
                      ))}
                    </div>
                    {r.counselContent && (
                      <div className="text-sm text-slate-300 mb-2 bg-slate-800/50 rounded-xl px-4 py-3 leading-relaxed">
                        <span className="text-xs text-slate-500 mr-2">상담내용</span>{r.counselContent}
                      </div>
                    )}
                    {r.customerReaction && (
                      <div className="mb-3">
                        <span className="text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full">반응: {r.customerReaction}</span>
                      </div>
                    )}
                    {r.specialNotes && (
                      <div className="text-xs text-slate-500 bg-slate-800/40 rounded-lg px-3 py-2 mb-3">
                        <span className="text-slate-600 mr-1">특이사항</span>{r.specialNotes}
                      </div>
                    )}
                    {/* 개별 평가 */}
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-amber-400 font-semibold">평가</span>
                      {EVAL_OPTIONS.map((opt) => (
                        <button key={opt} onClick={() => setEvalInputs((p) => ({ ...p, [r.id]: opt }))}
                          className={`w-9 h-9 rounded-xl text-base border-2 transition-all font-bold ${evalInputs[r.id] === opt ? EVAL_COLORS[opt] + ' scale-110' : 'bg-slate-800 text-slate-500 border-white/10 hover:border-white/20'}`}>
                          {opt}
                        </button>
                      ))}
                      <button onClick={() => setEvalInputs((p) => ({ ...p, [r.id]: '' }))}
                        className="px-2 h-9 rounded-xl text-xs bg-slate-800 text-slate-500 border border-white/10 hover:bg-slate-700 transition-all">
                        초기화
                      </button>
                      <button onClick={() => handleSaveEval(r.id)} disabled={saving[r.id]}
                        className="px-4 h-9 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all disabled:opacity-50 ml-auto">
                        {saving[r.id] ? '저장 중...' : '저장'}
                      </button>
                      {r.adminEvaluation && (
                        <span className={`text-sm font-bold px-2 py-0.5 rounded-lg border ml-2 ${EVAL_COLORS[r.adminEvaluation] ?? ''}`}>
                          {r.adminEvaluation}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 이미지 내보내기 모달 */}
      {showExport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-5xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">📸 이미지로 내보내기</h3>
                <p className="text-slate-400 text-xs mt-0.5">현황판을 .png 파일로 저장합니다</p>
              </div>
              <div className="flex items-center gap-3">
                <select value={exportRoom} onChange={(e) => setExportRoom(e.target.value)}
                  className="bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none">
                  <option value="">전체 팀</option>
                  {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <button onClick={handleCapture} disabled={capturing}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all disabled:opacity-50">
                  {capturing ? '저장 중...' : '💾 이미지 저장'}
                </button>
                <button onClick={() => setShowExport(false)}
                  className="w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all">
                  X
                </button>
              </div>
            </div>
            <div className="p-6 overflow-x-auto">
              <p className="text-xs text-slate-500 mb-3">미리보기</p>
              <div ref={boardRef} className="inline-block">
                <ReportBoard
                  date={selectedDate}
                  projectName={projectName}
                  roomName={exportRoomName}
                  groupedList={exportGroupedList}
                  salesMap={salesMap}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
