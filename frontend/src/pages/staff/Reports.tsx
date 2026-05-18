import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

/** UTC 날짜 문자열을 로컬(KST) yyyy-MM-dd로 변환 */
function toLocalDate(utcStr: string): string {
  if (!utcStr) return '';
  const d = new Date(utcStr);
  return format(d, 'yyyy-MM-dd');
}

const REACTION_OPTIONS = ['관심있음 👍', '재방문 예정 📅', '보류 🤔', '거절 ❌', '계약 완료 ✅'];

const EMPTY_FORM = {
  customerName: '',
  customerPhone: '',
  childBirth: '',
  counselContent: '',
  customerReaction: '',
  specialNotes: '',
};

type ViewMode = 'today' | 'date' | 'all';

export default function StaffReports() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const today = format(new Date(), 'yyyy-MM-dd');
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // 날짜 / 보기 모드
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [selectedDate, setSelectedDate] = useState(today);

  const load = async () => {
    if (!user) return;
    const res = await api.get(`/activity-reports?employeeId=${user.employeeId}`);
    setReports(res.data);
  };

  useEffect(() => { load(); }, [user]);

  const resetForm = () => { setForm({ ...EMPTY_FORM }); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) { setError('고객 이름을 입력해 주세요.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/activity-reports', {
        projectId: user?.projectId,
        prospectCount: 1,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        childAge: form.childBirth,
        counselContent: form.counselContent,
        customerReaction: form.customerReaction,
        specialNotes: form.specialNotes,
      });
      resetForm();
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || '제출 실패');
    } finally {
      setLoading(false);
    }
  };

  // 보기 모드별 필터링
  const todayReports = reports.filter((r) => toLocalDate(r.submittedAt) === today);
  const filteredReports = (() => {
    if (viewMode === 'today') return reports.filter((r) => toLocalDate(r.submittedAt) === today);
    if (viewMode === 'date') return reports.filter((r) => toLocalDate(r.submittedAt) === selectedDate);
    return reports; // 'all'
  })();

  const inputCls = 'w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-600';

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">📝 일일 활동 보고서</h1>
          <p className="text-slate-400 text-sm mt-1">{format(new Date(), 'yyyy년 MM월 dd일 (EEE)', { locale: ko })}</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); resetForm(); }}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            showForm
              ? 'bg-slate-700 text-slate-300'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
          }`}
        >
          {showForm ? '✕ 취소' : '+ 고객 기록 추가'}
        </button>
      </div>

      {/* 오늘 기록 현황 배너 */}
      {todayReports.length > 0 && !showForm && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <div className="text-emerald-300 font-semibold">오늘 {todayReports.length}명 상담 기록 완료</div>
            <div className="text-emerald-500/70 text-xs mt-0.5">추가 기록은 위 버튼을 누르세요</div>
          </div>
        </div>
      )}

      {/* 입력 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">상담 고객 정보 입력</h2>
            <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">1건 = 고객 1명</span>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 font-medium mb-2">상담 고객 이름 <span className="text-red-400">*</span></label>
              <input type="text" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })}
                placeholder="고객 성함" autoFocus className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-slate-300 font-medium mb-2">연락처</label>
              <input type="tel" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                placeholder="010-0000-0000" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 font-medium mb-2">자녀 출생년월일</label>
            <input type="date" value={form.childBirth} onChange={e => setForm({ ...form, childBirth: e.target.value })}
              max={format(new Date(), 'yyyy-MM-dd')} className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-slate-300 font-medium mb-2">상담 내용</label>
            <textarea value={form.counselContent} onChange={e => setForm({ ...form, counselContent: e.target.value })}
              rows={3} placeholder={"오늘 나눈 상담 내용을 기록하세요\n예) 3시리즈 관심, 가격 문의, 무료체험 신청 등"}
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none placeholder-slate-600" />
          </div>

          <div>
            <label className="block text-sm text-slate-300 font-medium mb-2">고객 반응</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {REACTION_OPTIONS.map(opt => (
                <button key={opt} type="button"
                  onClick={() => setForm({ ...form, customerReaction: form.customerReaction === opt ? '' : opt })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.customerReaction === opt
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700'
                  }`}>{opt}</button>
              ))}
            </div>
            <input type="text" value={form.customerReaction} onChange={e => setForm({ ...form, customerReaction: e.target.value })}
              placeholder="또는 직접 입력..." className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-slate-300 font-medium mb-2">특이사항 (선택)</label>
            <input type="text" value={form.specialNotes} onChange={e => setForm({ ...form, specialNotes: e.target.value })}
              placeholder="특이사항이 있다면 기록하세요" className={inputCls} />
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
            <span className="text-slate-500 flex-shrink-0">🔒</span>
            <p className="text-xs text-slate-500">관리자 평가는 제출 후 관리자만 볼 수 있으며 본인에게는 표시되지 않습니다.</p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-all">
              취소
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all">
              {loading ? '제출 중...' : '✓ 기록 제출'}
            </button>
          </div>
        </form>
      )}

      {/* ── 보기 모드 컨트롤 ── */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 space-y-3">
        {/* 모드 탭 */}
        <div className="flex gap-2">
          {([
            { key: 'today', label: `📅 오늘 (${todayReports.length}건)` },
            { key: 'date',  label: '🗓 날짜 선택' },
            { key: 'all',   label: `📋 전체보기 (${reports.length}건)` },
          ] as { key: ViewMode; label: string }[]).map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setViewMode(key)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                viewMode === key
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 text-slate-400 border-white/5 hover:bg-slate-700'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* 날짜 선택 인풋 */}
        {viewMode === 'date' && (
          <div className="flex items-center gap-3">
            <input type="date" value={selectedDate} max={today}
              onChange={e => setSelectedDate(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {filteredReports.length}건
            </span>
          </div>
        )}
      </div>

      {/* 제출 내역 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-slate-400">
            {viewMode === 'today' ? '오늘 기록' : viewMode === 'date' ? `${selectedDate} 기록` : '전체 기록'}
          </div>
          <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            {filteredReports.length}건
          </span>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            <div className="text-4xl mb-3">📋</div>
            <p>{viewMode === 'today' ? '오늘 제출한 보고서가 없습니다' : viewMode === 'date' ? '해당 날짜에 보고서가 없습니다' : '제출한 보고서가 없습니다'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((r) => {
              const isToday = toLocalDate(r.submittedAt) === today;
              return (
                <div key={r.id}
                  className={`bg-slate-900 border rounded-2xl p-5 transition-all ${isToday ? 'border-emerald-500/30' : 'border-white/5'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {isToday && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">오늘</span>
                      )}
                      <span className="text-xs text-slate-500">
                        {format(new Date(r.submittedAt), 'MM월 dd일 (EEE) HH:mm', { locale: ko })}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: '고객명', value: r.customerName },
                      { label: '연락처', value: r.customerPhone },
                      { label: '자녀 생년월일', value: r.childAge },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-800/60 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500 mb-0.5">{label}</div>
                        <div className="text-sm text-white font-medium">{value || '-'}</div>
                      </div>
                    ))}
                  </div>

                  {r.counselContent && (
                    <div className="text-sm text-slate-300 mb-2 leading-relaxed">
                      <span className="text-xs text-slate-500 mr-2">상담</span>{r.counselContent}
                    </div>
                  )}
                  {r.customerReaction && (
                    <div className="mb-2">
                      <span className="inline-block text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full">
                        {r.customerReaction}
                      </span>
                    </div>
                  )}
                  {r.specialNotes && (
                    <div className="text-xs text-slate-500 bg-slate-800/50 rounded-lg px-3 py-2">
                      <span className="text-slate-600 mr-1">특이사항</span>{r.specialNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
