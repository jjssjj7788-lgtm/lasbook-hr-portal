import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const POS_BADGE: Record<string, string> = {
  MANAGER: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  TEBA:    'bg-violet-500/20 text-violet-300 border-violet-500/30',
  DOJE:    'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  TRAINEE: 'bg-slate-600/30 text-slate-300 border-slate-500/30',
};

export default function AdminAttendance() {
  const { selectedProjectId } = useAuthStore();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [branchName, setBranchName] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  /* 데이터 로드 */
  const load = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const [usersRes, recRes] = await Promise.all([
        api.get(`/users?projectId=${selectedProjectId}`),
        api.get(`/attendance?projectId=${selectedProjectId}&date=${selectedDate}`),
      ]);
      setAllUsers(usersRes.data.filter((u: any) => u.isActive && u.role !== 'ADMIN'));
      setRecords(recRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedProjectId, selectedDate]);

  /* 날짜 이동 */
  const changeDate = (days: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(format(d, 'yyyy-MM-dd'));
  };

  /* 해당 날짜의 출석 기록 맵 (traineeId → record) */
  const recordMap = useMemo(() => {
    const m: Record<string, any> = {};
    records.forEach(r => { m[r.traineeId] = r; });
    return m;
  }, [records]);

  /* 출석 즉시 등록 */
  const handleAttend = async (user: any, isPresent: boolean) => {
    const key = user.employeeId;
    setSubmitting(p => ({ ...p, [key]: true }));
    try {
      const branch = branchName.trim() || '미지정';
      await api.post('/attendance', {
        projectId: selectedProjectId,
        educationDate: selectedDate,
        branchName: branch,
        traineeId: user.employeeId,
        mentorId: user.parentEmployeeId || user.employeeId,
        isPresent,
      });
      await load();
    } finally {
      setSubmitting(p => ({ ...p, [key]: false }));
    }
  };

  /* 출석 취소 (삭제) */
  const handleDelete = async (recordId: number) => {
    await api.delete(`/attendance/${recordId}`);
    await load();
  };

  /* 검색 필터 */
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return allUsers;
    const q = search.trim();
    return allUsers.filter(u => u.name.includes(q) || u.employeeId.includes(q));
  }, [allUsers, search]);

  /* 통계 */
  const presentCount = records.filter(r => r.isPresent).length;
  const absentCount  = records.filter(r => !r.isPresent).length;
  const totalFee     = records.filter(r => r.isPresent).reduce((s, r) => s + r.transportFee, 0);

  const dateLabel = format(new Date(selectedDate + 'T00:00:00'), 'yyyy년 MM월 dd일 (EEE)', { locale: ko });

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">출석 관리</h1>
        <p className="text-gray-500 text-sm mt-1">직원을 클릭하여 즉시 출석 체크합니다 · 출석 시 교통비 50,000원 자동 발생</p>
      </div>

      {/* 날짜 + 지점 */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => changeDate(-1)}
          className="w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-white/10 transition-all text-lg">
          &lt;
        </button>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          className="bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer" />
        <button onClick={() => changeDate(1)}
          className="w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-white/10 transition-all text-lg">
          &gt;
        </button>
        <button onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
          className="px-3 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-sm transition-all">
          오늘
        </button>
        <div className="h-6 w-px bg-white/10" />
        {/* 지점명 */}
        <div className="relative flex-1 min-w-[180px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">📍</span>
          <input value={branchName} onChange={e => setBranchName(e.target.value)}
            placeholder="지점명 입력 (예: 강동)"
            className="w-full bg-slate-800 border border-white/10 text-white rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <span className="text-slate-500 text-sm">{dateLabel}</span>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3">
          <div className="text-xs text-emerald-400 font-semibold mb-1">✅ 출석</div>
          <div className="text-2xl font-bold text-gray-900">{presentCount}<span className="text-sm font-normal text-gray-500 ml-1">명</span></div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
          <div className="text-xs text-red-500 font-semibold mb-1">❌ 결석</div>
          <div className="text-2xl font-bold text-gray-900">{absentCount}<span className="text-sm font-normal text-gray-500 ml-1">명</span></div>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-4 py-3">
          <div className="text-xs text-indigo-600 font-semibold mb-1">💰 교통비</div>
          <div className="text-xl font-bold text-gray-900">{totalFee.toLocaleString('ko-KR')}<span className="text-sm font-normal text-gray-500 ml-1">원</span></div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      {/* 검색 */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="이름 또는 사원번호로 검색..."
          className="w-full bg-slate-800 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">✕</button>
        )}
      </div>

      {/* 직원 목록 */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-slate-600">
          <div className="text-4xl mb-3">👥</div>
          <p>검색 결과가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map(user => {
            const rec = recordMap[user.employeeId];
            const isLoading = submitting[user.employeeId];
            const posCode = user.position?.code ?? '';
            const posName = user.position?.name ?? posCode;

            return (
              <div key={user.employeeId}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all
                  ${rec
                    ? rec.isPresent
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-red-500/10 border-red-500/20'
                    : 'bg-slate-900 border-white/5 hover:border-white/10'
                  }`}
              >
                {/* 아바타 */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 text-white
                  ${posCode === 'TEBA' ? 'bg-gradient-to-br from-violet-500 to-indigo-600'
                    : posCode === 'DOJE' ? 'bg-gradient-to-br from-indigo-500 to-blue-600'
                    : posCode === 'MANAGER' ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                    : 'bg-gradient-to-br from-slate-500 to-slate-700'}`}>
                  {user.name?.charAt(0)}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-900 font-semibold">{user.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${POS_BADGE[posCode] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {posName}
                    </span>
                    {user.room && <span className="text-xs text-indigo-600">💬 {user.room.name}</span>}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{user.employeeId}</div>
                </div>

                {/* 상태 + 버튼 */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {rec ? (
                    <>
                      {/* 상태 배지 */}
                      <div className="flex flex-col items-end gap-0.5">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${rec.isPresent ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                          {rec.isPresent ? '✅ 출석' : '❌ 결석'}
                        </span>
                        {/* 날짜 + 시각 */}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {(() => {
                            try {
                              const d = new Date(rec.educationDate);
                              const c2 = rec.createdAt ? new Date(rec.createdAt) : null;
                              const dateStr = `${d.getMonth()+1}월 ${d.getDate()}일`;
                              const timeStr = c2 ? ` ${String(c2.getHours()).padStart(2,'0')}:${String(c2.getMinutes()).padStart(2,'0')}` : '';
                              return dateStr + timeStr;
                            } catch { return ''; }
                          })()}
                        </span>
                      </div>
                      {rec.isPresent && (
                        <span className="text-xs text-indigo-600 font-semibold">{rec.transportFee.toLocaleString()}원</span>
                      )}
                      <button onClick={() => handleDelete(rec.id)}
                        className="text-xs text-slate-500 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 border border-slate-200 hover:border-red-200">
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAttend(user, true)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20">
                        {isLoading ? '...' : '✅ 출석'}
                      </button>
                      <button
                        onClick={() => handleAttend(user, false)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50">
                        {isLoading ? '...' : '❌ 결석'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 하단 요약 */}
      {!loading && allUsers.length > 0 && (
        <div className="text-center text-xs text-slate-600 pt-2">
          전체 {allUsers.length}명 중 출석 체크 완료 {records.length}명
          {search && ` · 검색 결과 ${filteredUsers.length}명`}
        </div>
      )}
    </div>
  );
}
