import { useState, useEffect, useRef } from 'react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import api from '../../lib/axios';

interface Session {
  id: number; title: string | null; topic: string | null;
  location: string | null; startTime: string; endTime: string;
  maxAttendees: number | null; posters: string | null;
  course: { id: number; title: string; maxAttendees: number | null; targetJobTypes: string | null };
  attendances: { id: number }[];
}

interface JobType {
  id: number;
  name: string;
}

const EMPTY_FORM = { title: '', topic: '', location: '', date: '', startHour: '09', startMin: '00', endHour: '18', endMin: '00', maxAttendees: '' };


export default function ScheduleViewer() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<Session | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [posterFiles, setPosterFiles] = useState<File[]>([]);
  const [posterPreviews, setPosterPreviews] = useState<string[]>([]);
  const [targetJobTypes, setTargetJobTypes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSessions();
    api.get('/job-types').then(res => setJobTypes(res.data)).catch(console.error);
  }, []);

  const fetchSessions = () => {
    api.get('/sessions').then(res => setSessions(res.data)).catch(console.error);
  };

  const calendarDays = (() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    const days: Date[] = [];
    let d = start;
    while (d <= end) { days.push(d); d = addDays(d, 1); }
    return days;
  })();

  const sessionsByDate = (day: Date) =>
    sessions.filter(s => isSameDay(new Date(s.startTime), day));

  const openCreate = (day: Date) => {
    setForm({ ...EMPTY_FORM, date: format(day, 'yyyy-MM-dd') });
    setPosterFiles([]); setPosterPreviews([]);
    setTargetJobTypes([]);
    setShowCreate(true);
  };

  const toggleJobType = (t: string) => {
    setTargetJobTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPosterFiles(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPosterPreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removePoster = (idx: number) => {
    setPosterFiles(prev => prev.filter((_, i) => i !== idx));
    setPosterPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!form.title || !form.date) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      if (form.topic) fd.append('topic', form.topic);
      if (form.location) fd.append('location', form.location);
      fd.append('startTime', `${form.date}T${form.startHour}:${form.startMin}:00`);
      fd.append('endTime', `${form.date}T${form.endHour}:${form.endMin}:00`);
      if (form.maxAttendees) fd.append('maxAttendees', form.maxAttendees);
      if (targetJobTypes.length > 0) fd.append('targetJobTypes', JSON.stringify(targetJobTypes));
      posterFiles.forEach(f => fd.append('posters', f));
      await api.post('/sessions/lecture', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowCreate(false);
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || '강의 생성 실패');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 강의를 삭제하시겠습니까?')) return;
    await api.delete(`/sessions/${id}`);
    setShowDetail(null);
    fetchSessions();
  };

  const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const MIN_OPTIONS = ['00', '10', '20', '30', '40', '50'];

  const posterList = (s: Session): string[] => {
    try { return JSON.parse(s.posters || '[]'); } catch { return []; }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">교육 강의 캘린더</h1>
          <p className="text-sm text-gray-400 mt-0.5">날짜를 클릭하여 강의를 등록하세요</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">‹ 이전</button>
          <span className="text-lg font-bold text-gray-800 min-w-[130px] text-center">
            {format(currentMonth, 'yyyy년 M월', { locale: ko })}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">다음 ›</button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">오늘</button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Day names */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <div key={d} className={`py-3 text-center text-xs font-bold tracking-wide ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'}`}>{d}</div>
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7 divide-x divide-gray-100">
          {calendarDays.map((day, idx) => {
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const daySessions = sessionsByDate(day);
            const isWeekend = idx % 7 === 0 || idx % 7 === 6;
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] p-2 border-b border-gray-100 cursor-pointer transition-colors group relative
                  ${!inMonth ? 'bg-gray-50/70' : 'hover:bg-blue-50/30'}
                  ${today ? 'bg-blue-50/40' : ''}`}
                onClick={() => inMonth && openCreate(day)}
              >
                <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold mb-1
                  ${today ? 'bg-blue-600 text-white' : ''}
                  ${!inMonth ? 'text-gray-300' : isWeekend ? (idx % 7 === 0 ? 'text-red-400' : 'text-blue-500') : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {daySessions.slice(0, 3).map(s => (
                    <div
                      key={s.id}
                      onClick={e => { e.stopPropagation(); setShowDetail(s); }}
                      className="px-2 py-1 rounded-md text-[11px] font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 truncate cursor-pointer leading-tight"
                      title={s.title || '강의'}
                    >
                      <span className="opacity-70">{format(new Date(s.startTime), 'HH:mm')}</span> {s.title}
                    </div>
                  ))}
                  {daySessions.length > 3 && (
                    <div className="text-[10px] text-gray-400 pl-1">+{daySessions.length - 3}개 더</div>
                  )}
                </div>
                {inMonth && (
                  <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 text-lg leading-none">+</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">새 강의 등록</h2>
                <p className="text-xs text-gray-400 mt-0.5">{form.date}</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">강의 이름 *</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="예) 1분기 기초 교육" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">주제</label>
                <input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="예) 리더십 개발" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">장소</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="예) 서울 본사 3층 대강당" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">시작 시간</label>
                  <div className="flex gap-2">
                    <select value={form.startHour} onChange={e => setForm({ ...form, startHour: e.target.value })} className="flex-1 border border-gray-200 rounded-lg px-2 py-2.5 text-sm outline-none focus:border-blue-400">
                      {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}시</option>)}
                    </select>
                    <select value={form.startMin} onChange={e => setForm({ ...form, startMin: e.target.value })} className="flex-1 border border-gray-200 rounded-lg px-2 py-2.5 text-sm outline-none focus:border-blue-400">
                      {MIN_OPTIONS.map(m => <option key={m} value={m}>{m}분</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">종료 시간</label>
                  <div className="flex gap-2">
                    <select value={form.endHour} onChange={e => setForm({ ...form, endHour: e.target.value })} className="flex-1 border border-gray-200 rounded-lg px-2 py-2.5 text-sm outline-none focus:border-blue-400">
                      {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}시</option>)}
                    </select>
                    <select value={form.endMin} onChange={e => setForm({ ...form, endMin: e.target.value })} className="flex-1 border border-gray-200 rounded-lg px-2 py-2.5 text-sm outline-none focus:border-blue-400">
                      {MIN_OPTIONS.map(m => <option key={m} value={m}>{m}분</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">참석 인원 제한</label>
                <input type="number" min="1" value={form.maxAttendees} onChange={e => setForm({ ...form, maxAttendees: e.target.value })} placeholder="제한 없음" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
              </div>
              {/* 대상 직군 선택 */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2">
                  대상 직군 제한
                  <span className="ml-1 font-normal text-gray-400">(선택 안 하면 전체 직군 허용)</span>
                </label>
                {jobTypes.length === 0 ? (
                  <p className="text-xs text-gray-400">직군 관리에서 직군을 먼저 추가해 주세요.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {jobTypes.map(jt => (
                      <button
                        key={jt.id}
                        type="button"
                        onClick={() => toggleJobType(jt.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          targetJobTypes.includes(jt.name)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        {targetJobTypes.includes(jt.name) ? '✓ ' : ''}{jt.name}
                      </button>
                    ))}
                  </div>
                )}
                {targetJobTypes.length > 0 && (
                  <p className="text-xs text-indigo-500 mt-2 font-medium">
                    🎯 선택된 대상: {targetJobTypes.join(', ')}
                  </p>
                )}
                {targetJobTypes.length === 0 && (
                  <p className="text-xs text-emerald-600 mt-1">✓ 전체 직군 허용 (제한 없음)</p>
                )}
              </div>
              {/* Poster Upload */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">포스터 이미지 (최대 10장)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                >
                  <p className="text-sm text-gray-400">클릭하여 이미지 추가</p>
                  <p className="text-xs text-gray-300 mt-1">JPG, PNG, GIF 지원</p>
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handlePosterChange} />
                {posterPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {posterPreviews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                        <button type="button" onClick={() => removePoster(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">취소</button>
              <button onClick={() => handleSubmit()} disabled={submitting} className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-60">
                {submitting ? '등록 중...' : '강의 등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 truncate pr-4">{showDetail.title}</h2>
              <button onClick={() => setShowDetail(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0">&times;</button>
            </div>
            <div className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 font-medium mb-1">날짜 / 시간</div>
                  <div className="text-gray-800 font-semibold">{format(new Date(showDetail.startTime), 'yyyy.MM.dd')}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{format(new Date(showDetail.startTime), 'HH:mm')} ~ {format(new Date(showDetail.endTime), 'HH:mm')}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 font-medium mb-1">장소</div>
                  <div className="text-gray-800 font-semibold">{showDetail.location || '미설정'}</div>
                </div>
                {showDetail.topic && (
                  <div className="bg-indigo-50 rounded-xl p-3 col-span-2">
                    <div className="text-xs text-indigo-400 font-medium mb-1">주제</div>
                    <div className="text-indigo-800 font-medium">{showDetail.topic}</div>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 font-medium mb-1">참석 인원 제한</div>
                  <div className="text-gray-800 font-semibold">{showDetail.maxAttendees ? `${showDetail.maxAttendees}명` : '제한 없음'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 font-medium mb-1">신청자 수</div>
                  <div className="text-gray-800 font-semibold">{showDetail.attendances?.length ?? 0}명</div>
                </div>
                {/* 대상 직군 표시 */}
                {showDetail.course?.targetJobTypes && (() => {
                  try {
                    const targets: string[] = JSON.parse(showDetail.course.targetJobTypes);
                    if (targets.length > 0) return (
                      <div className="bg-indigo-50 rounded-xl p-3 col-span-2">
                        <div className="text-xs text-indigo-400 font-medium mb-2">대상 직군 제한</div>
                        <div className="flex flex-wrap gap-1.5">
                          {targets.map(t => (
                            <span key={t} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-semibold">{t}</span>
                          ))}
                        </div>
                      </div>
                    );
                  } catch {}
                  return null;
                })()}
              </div>
              {/* Poster images */}
              {posterList(showDetail).length > 0 && (
                <div>
                  <div className="text-xs text-gray-400 font-medium mb-2">포스터</div>
                  <div className="flex flex-wrap gap-2">
                    {posterList(showDetail).map((src, i) => (
                      <img key={i} src={`${api.defaults.baseURL}${src}`} alt="" className="w-24 h-24 object-cover rounded-xl border border-gray-200 cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(`${api.defaults.baseURL}${src}`, '_blank')} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
              <button onClick={() => handleDelete(showDetail.id)} className="px-4 py-2 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50">강의 삭제</button>
              <button onClick={() => setShowDetail(null)} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
