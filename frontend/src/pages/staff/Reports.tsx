import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';

export default function StaffReports() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<any[]>([]);
  const [form, setForm] = useState({ prospectCount: '', counselContent: '', specialNotes: '' });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    if (user) api.get(`/activity-reports?employeeId=${user.employeeId}`).then((r) => setReports(r.data));
  };
  useEffect(() => { load(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/activity-reports', {
        projectId: user?.projectId,
        prospectCount: Number(form.prospectCount),
        counselContent: form.counselContent,
        specialNotes: form.specialNotes,
      });
      setForm({ prospectCount: '', counselContent: '', specialNotes: '' });
      setShowForm(false);
      load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">일일 활동 보고서</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all">
          {showForm ? '취소' : '+ 보고서 작성'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">만난 가망고객 수 *</label>
            <input type="number" value={form.prospectCount} onChange={(e) => setForm({ ...form, prospectCount: e.target.value })} required min="0"
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">주요 상담 내용</label>
            <textarea value={form.counselContent} onChange={(e) => setForm({ ...form, counselContent: e.target.value })} rows={3} placeholder="오늘 상담한 주요 내용을 기록하세요"
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">특이사항</label>
            <textarea value={form.specialNotes} onChange={(e) => setForm({ ...form, specialNotes: e.target.value })} rows={2} placeholder="특이사항이 있다면 기록하세요"
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="text-xs text-slate-500 bg-slate-800/50 rounded-xl px-4 py-3">
            💡 제출된 보고서에 대한 관리자 평가는 별도 통보됩니다.
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all">
            {loading ? '제출 중...' : '보고서 제출'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="text-center py-12 text-slate-600">제출한 보고서가 없습니다</div>
        ) : (
          reports.map((r) => (
            <div key={r.id} className="bg-slate-900 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{format(new Date(r.submittedAt), 'yyyy년 MM월 dd일 HH:mm')}</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">가망고객 {r.prospectCount}명</span>
              </div>
              {r.counselContent && <div className="text-sm text-white">{r.counselContent}</div>}
              {r.specialNotes && <div className="text-xs text-slate-400 mt-1">{r.specialNotes}</div>}
              {/* adminEvaluation 필드는 API에서 이미 제거되어 있음 (블라인드 정책) */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
