import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const EVAL_OPTIONS = ['○', '△', '✕'];
const EVAL_COLORS: Record<string, string> = {
  '○': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  '△': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  '✕': 'bg-red-500/20 text-red-300 border-red-500/30',
};

function ReportCard({ r, evalInputs, setEvalInputs, saving, onSaveEval, onDelete }: any) {
  return (
    <div className="bg-slate-800/60 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-white font-semibold text-sm">{r.employee?.name}</span>
            <span className="text-xs text-slate-500">{r.employee?.position?.name}</span>
            <span className="text-xs text-slate-600">{format(new Date(r.submittedAt), 'MM.dd (EEE) HH:mm', { locale: ko })}</span>
            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">가망고객 {r.prospectCount}명</span>
          </div>
          {r.counselContent && <div className="text-sm text-slate-300 mb-1"><span className="text-xs text-slate-500 mr-2">상담</span>{r.counselContent}</div>}
          {r.specialNotes && <div className="text-sm text-slate-400"><span className="text-xs text-slate-500 mr-2">특이</span>{r.specialNotes}</div>}
        </div>
        <div className="flex-shrink-0 w-44">
          <div className="text-xs text-amber-400 font-semibold mb-1.5">🔒 관리자 평가</div>
          <div className="flex gap-1 mb-1.5">
            {EVAL_OPTIONS.map((opt) => (
              <button key={opt} onClick={() => setEvalInputs((p: any) => ({ ...p, [r.id]: (p[r.id] || '') + opt }))}
                className={`px-2 py-1 rounded-lg text-sm border transition-all hover:scale-110 ${EVAL_COLORS[opt]}`}>{opt}</button>
            ))}
            <button onClick={() => setEvalInputs((p: any) => ({ ...p, [r.id]: '' }))}
              className="px-2 py-1 rounded-lg text-xs bg-slate-700 text-slate-400 border border-white/5">초기화</button>
          </div>
          <div className="flex gap-1.5">
            <input type="text" value={evalInputs[r.id] ?? ''} onChange={(e) => setEvalInputs((p: any) => ({ ...p, [r.id]: e.target.value }))}
              placeholder="평가..." className="flex-1 px-2 py-1 bg-slate-700 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 min-w-0" />
            <button onClick={() => onSaveEval(r.id)} disabled={saving[r.id]}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-semibold">{saving[r.id] ? '...' : '저장'}</button>
          </div>
          {r.adminEvaluation && <div className="mt-1 text-xs font-bold text-amber-300">현재: {r.adminEvaluation}</div>}
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <button onClick={() => onDelete(r.id)} className="text-xs text-slate-600 hover:text-red-400 transition-colors">삭제</button>
      </div>
    </div>
  );
}

export default function AdminReports() {
  const { selectedProjectId } = useAuthStore();
  const [reports, setReports] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(true);
  const [evalInputs, setEvalInputs] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'byRoom'>('all');
  const [users, setUsers] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [reportsRes, usersRes, roomsRes] = await Promise.all([
        api.get(`/activity-reports?projectId=${selectedProjectId}&month=${month}${filterEmployee ? `&employeeId=${filterEmployee}` : ''}`),
        api.get(`/users?projectId=${selectedProjectId}`),
        api.get(`/rooms?projectId=${selectedProjectId}`),
      ]);
      setReports(reportsRes.data);
      setUsers(usersRes.data.filter((u: any) => u.role === 'USER'));
      setRooms(roomsRes.data);
      const initEval: Record<number, string> = {};
      reportsRes.data.forEach((r: any) => { if (r.adminEvaluation) initEval[r.id] = r.adminEvaluation; });
      setEvalInputs(initEval);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (selectedProjectId) load(); }, [selectedProjectId, month, filterEmployee]);

  const handleSaveEval = async (id: number) => {
    setSaving((p) => ({ ...p, [id]: true }));
    try {
      await api.patch(`/activity-reports/${id}/evaluation`, { adminEvaluation: evalInputs[id] || '' });
      load();
    } finally {
      setSaving((p) => ({ ...p, [id]: false }));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return;
    await api.delete(`/activity-reports/${id}`);
    load();
  };

  // 팀별 그룹핑
  const groupByRoom = () => {
    const roomMap: Record<string, { room: any; reports: any[] }> = {};
    // 팀이 있는 직원들
    rooms.forEach((room) => {
      const memberIds = room.members?.map((m: any) => m.employeeId) ?? [];
      const roomReports = reports.filter((r) => memberIds.includes(r.employeeId));
      if (filterRoom && room.id !== Number(filterRoom)) return;
      roomMap[room.id] = { room, reports: roomReports };
    });
    // 팀 미배정 직원
    const assignedIds = rooms.flatMap((r) => r.members?.map((m: any) => m.employeeId) ?? []);
    const unassigned = reports.filter((r) => !assignedIds.includes(r.employeeId));
    return { roomMap, unassigned };
  };

  const cardProps = { evalInputs, setEvalInputs, saving, onSaveEval: handleSaveEval, onDelete: handleDelete };
  const { roomMap, unassigned } = groupByRoom();

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">일일 활동 보고서</h1>
          <p className="text-slate-400 text-sm mt-1">관리자 평가 (○/△/✕) 입력 전용 — User에게 노출 안 됨</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* 보기 모드 */}
          <div className="flex bg-slate-800 border border-white/10 rounded-xl p-1">
            <button onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              전체
            </button>
            <button onClick={() => setViewMode('byRoom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'byRoom' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              💬 팀별
            </button>
          </div>
          {viewMode === 'byRoom' && rooms.length > 0 && (
            <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)}
              className="bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none">
              <option value="">전체 팀</option>
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          )}
          {viewMode === 'all' && (
            <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)}
              className="bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none">
              <option value="">전체 직원</option>
              {users.map((u) => <option key={u.employeeId} value={u.employeeId}>{u.name}</option>)}
            </select>
          )}
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none" />
        </div>
      </div>

      {/* 보안 안내 */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-red-400">🔒</span>
        <span className="text-sm text-red-300"><strong>블라인드 정책</strong> — 관리자 평가는 Admin 계정에만 표시됩니다</span>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-slate-800 rounded-xl animate-pulse" />)}</div>
      ) : viewMode === 'all' ? (
        /* 전체 보기 */
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-16 text-slate-600"><div className="text-4xl mb-3">📝</div>제출된 보고서가 없습니다</div>
          ) : (
            reports.map((r) => <ReportCard key={r.id} r={r} {...cardProps} />)
          )}
        </div>
      ) : (
        /* 팀별 보기 */
        <div className="space-y-6">
          {Object.values(roomMap).map(({ room, reports: rReports }) => (
            <div key={room.id} className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
              {/* 팀 헤더 */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <span className="text-lg">💬</span>
                  <div>
                    <h3 className="text-white font-bold">{room.name}</h3>
                    <p className="text-xs text-slate-500">{rReports.length}건의 보고서</p>
                  </div>
                </div>
                {/* 팀 통계 */}
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-400">가망고객 합계: <strong className="text-white">{rReports.reduce((s: number, r: any) => s + (r.prospectCount || 0), 0)}명</strong></span>
                  <span className="text-emerald-400">○ {rReports.filter((r: any) => r.adminEvaluation?.includes('○')).length}</span>
                  <span className="text-amber-400">△ {rReports.filter((r: any) => r.adminEvaluation?.includes('△')).length}</span>
                  <span className="text-red-400">✕ {rReports.filter((r: any) => r.adminEvaluation?.includes('✕')).length}</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {rReports.length === 0 ? (
                  <div className="text-center py-8 text-slate-600 text-sm">이 팀에 제출된 보고서가 없습니다</div>
                ) : (
                  rReports.map((r: any) => <ReportCard key={r.id} r={r} {...cardProps} />)
                )}
              </div>
            </div>
          ))}
          {/* 팀 미배정 직원 보고서 */}
          {unassigned.length > 0 && (
            <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-slate-800/30">
                <span>👤</span>
                <div>
                  <h3 className="text-slate-400 font-bold">팀 미배정</h3>
                  <p className="text-xs text-slate-600">{unassigned.length}건</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {unassigned.map((r: any) => <ReportCard key={r.id} r={r} {...cardProps} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
