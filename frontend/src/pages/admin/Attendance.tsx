import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';

export default function AdminAttendance() {
  const { selectedProjectId } = useAuthStore();
  const [records, setRecords] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [trainees, setTrainees] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ educationDate: format(new Date(), 'yyyy-MM-dd'), branchName: '', traineeId: '', mentorId: '', isPresent: true, notes: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [recRes, usersRes] = await Promise.all([
        api.get(`/attendance?projectId=${selectedProjectId}&month=${month}`),
        api.get(`/users?projectId=${selectedProjectId}`),
      ]);
      setRecords(recRes.data);
      const allUsers = usersRes.data.filter((u: any) => u.role === 'USER');
      setTrainees(allUsers.filter((u: any) => u.position?.code === 'TRAINEE'));
      setMentors(allUsers.filter((u: any) => ['DOJE','TEBA','MANAGER'].includes(u.position?.code)));
      setUsers(allUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (selectedProjectId) load(); }, [selectedProjectId, month]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/attendance', { ...form, projectId: selectedProjectId });
    setShowForm(false);
    load();
  };

  const totalTransport = records.filter((r) => r.isPresent).reduce((a, r) => a + r.transportFee, 0);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">출석 관리</h1>
          <p className="text-slate-400 text-sm mt-1">출석 시 교통비 50,000원 자동 발생</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all">
            {showForm ? '취소' : '+ 출석 등록'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-2">총 출석 건수</div>
          <div className="text-2xl font-bold text-white">{records.filter((r) => r.isPresent).length}건</div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">교통비 발생액</div>
          <div className="text-2xl font-bold text-white">{totalTransport.toLocaleString('ko-KR')}원</div>
          <div className="text-xs text-slate-500 mt-1">세전 합계</div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2">세후 교통비</div>
          <div className="text-2xl font-bold text-white">{Math.floor(totalTransport * 0.967).toLocaleString('ko-KR')}원</div>
          <div className="text-xs text-slate-500 mt-1">3.3% 차감 후</div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold">출석 등록</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">교육일자 *</label>
              <input type="date" value={form.educationDate} onChange={(e) => setForm({ ...form, educationDate: e.target.value })} required
                className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">지점명 *</label>
              <input value={form.branchName} onChange={(e) => setForm({ ...form, branchName: e.target.value })} required placeholder="강동, 강서 등"
                className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">수련생 *</label>
              <select value={form.traineeId} onChange={(e) => setForm({ ...form, traineeId: e.target.value })} required
                className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">선택</option>
                {trainees.map((u) => <option key={u.employeeId} value={u.employeeId}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">담당 도제 *</label>
              <select value={form.mentorId} onChange={(e) => setForm({ ...form, mentorId: e.target.value })} required
                className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">선택</option>
                {mentors.map((u) => <option key={u.employeeId} value={u.employeeId}>{u.name} ({u.position?.name})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">출석 여부</label>
              <select value={form.isPresent ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isPresent: e.target.value === 'true' })}
                className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="true">✅ 출석 (+교통비 50,000원)</option>
                <option value="false">❌ 결석</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm">취소</button>
            <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold">등록</button>
          </div>
        </form>
      )}

      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['지점_날짜', '수련생', '담당 도제', '출석', '교통비', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-600">로딩 중...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-600">출석 기록이 없습니다</td></tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-slate-300">{r.branchLabel}</td>
                  <td className="px-4 py-3 text-sm text-white">{r.trainee?.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{r.mentor?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.isPresent ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'}`}>
                      {r.isPresent ? '출석' : '결석'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-indigo-300">{r.isPresent ? `${r.transportFee.toLocaleString('ko-KR')}원` : '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={async () => { await api.delete(`/attendance/${r.id}`); load(); }}
                      className="text-xs text-slate-600 hover:text-red-400 transition-colors">삭제</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
