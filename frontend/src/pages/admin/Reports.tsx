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

export default function AdminReports() {
  const { selectedProjectId } = useAuthStore();
  const [reports, setReports] = useState<any[]>([]);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(true);
  const [evalInputs, setEvalInputs] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [filterEmployee, setFilterEmployee] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [reportsRes, usersRes] = await Promise.all([
        api.get(`/activity-reports?projectId=${selectedProjectId}&month=${month}${filterEmployee ? `&employeeId=${filterEmployee}` : ''}`),
        api.get(`/users?projectId=${selectedProjectId}`),
      ]);
      setReports(reportsRes.data);
      setUsers(usersRes.data.filter((u: any) => u.role === 'USER'));
      const initEval: Record<number, string> = {};
      reportsRes.data.forEach((r: any) => { if (r.adminEvaluation) initEval[r.id] = r.adminEvaluation; });
      setEvalInputs(initEval);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (selectedProjectId) load(); }, [selectedProjectId, month, filterEmployee]);

  const handleSaveEval = async (id: number) => {
    setSaving({ ...saving, [id]: true });
    try {
      await api.patch(`/activity-reports/${id}/evaluation`, { adminEvaluation: evalInputs[id] || '' });
      load();
    } finally {
      setSaving({ ...saving, [id]: false });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return;
    await api.delete(`/activity-reports/${id}`);
    load();
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">일일 활동 보고서</h1>
          <p className="text-slate-400 text-sm mt-1">관리자 평가 (○/△/✕) 입력 전용 — User에게 노출 안 됨</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)}
            className="bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">전체 직원</option>
            {users.map((u) => <option key={u.employeeId} value={u.employeeId}>{u.name}</option>)}
          </select>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      {/* 보안 안내 */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3 flex items-start gap-3">
        <span className="text-red-400 text-lg flex-shrink-0">🔒</span>
        <div className="text-sm text-red-300">
          <strong>블라인드 정책 적용 중</strong> — 아래 관리자 평가 필드는 Admin 계정에만 표시됩니다. User 권한으로 접속한 화면 및 API 응답에서 완전히 숨겨집니다.
        </div>
      </div>

      {/* 보고서 목록 */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-slate-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 text-slate-600">
            <div className="text-4xl mb-3">📝</div>
            <div>제출된 보고서가 없습니다</div>
          </div>
        ) : (
          reports.map((r) => (
            <div key={r.id} className="bg-slate-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white font-semibold">{r.employee?.name}</span>
                    <span className="text-xs text-slate-500">{r.employee?.position?.name}</span>
                    <span className="text-xs text-slate-600">{format(new Date(r.submittedAt), 'MM월 dd일 (EEE) HH:mm', { locale: ko })}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">가망고객 {r.prospectCount}명</span>
                  </div>
                  {r.counselContent && (
                    <div className="text-sm text-slate-300 mb-2">
                      <span className="text-xs text-slate-500 mr-2">상담 내용</span>{r.counselContent}
                    </div>
                  )}
                  {r.specialNotes && (
                    <div className="text-sm text-slate-400">
                      <span className="text-xs text-slate-500 mr-2">특이사항</span>{r.specialNotes}
                    </div>
                  )}
                </div>

                {/* 관리자 평가 영역 (ADMIN only) */}
                <div className="flex-shrink-0 w-48">
                  <div className="text-xs text-amber-400 font-semibold mb-2 flex items-center gap-1">
                    🔒 관리자 평가
                  </div>
                  {/* 빠른 선택 버튼 */}
                  <div className="flex gap-1.5 mb-2">
                    {EVAL_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setEvalInputs({ ...evalInputs, [r.id]: (evalInputs[r.id] || '') + opt })}
                        className={`px-2.5 py-1.5 rounded-lg text-sm border transition-all hover:scale-110 ${EVAL_COLORS[opt] || ''}`}
                      >
                        {opt}
                      </button>
                    ))}
                    <button onClick={() => setEvalInputs({ ...evalInputs, [r.id]: '' })}
                      className="px-2 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-400 border border-white/5 hover:bg-slate-700">
                      초기화
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={evalInputs[r.id] ?? ''}
                      onChange={(e) => setEvalInputs({ ...evalInputs, [r.id]: e.target.value })}
                      placeholder="평가 입력..."
                      className="flex-1 px-2.5 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={() => handleSaveEval(r.id)}
                      disabled={saving[r.id]}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-semibold transition-all"
                    >
                      {saving[r.id] ? '...' : '저장'}
                    </button>
                  </div>
                  {r.adminEvaluation && (
                    <div className="mt-2 text-sm font-bold text-amber-300">현재: {r.adminEvaluation}</div>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button onClick={() => handleDelete(r.id)} className="text-xs text-slate-600 hover:text-red-400 transition-colors">삭제</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
