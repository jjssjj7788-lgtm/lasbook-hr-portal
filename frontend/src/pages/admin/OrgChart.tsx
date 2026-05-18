import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';

/* ── 직급 스타일 ── */
const POS: Record<string, { gradient: string; border: string; badge: string; badgeText: string; icon: string; rank: number; dot: string }> = {
  MANAGER: { gradient: 'from-amber-500/30 to-amber-600/10', border: 'border-amber-400/60', badge: 'bg-amber-500 text-black', badgeText: '매니저', icon: '⭐', rank: 0, dot: 'bg-amber-400' },
  TEBA:    { gradient: 'from-violet-500/30 to-violet-700/10', border: 'border-violet-400/60', badge: 'bg-violet-500 text-white', badgeText: '테바', icon: '👑', rank: 1, dot: 'bg-violet-400' },
  DOJE:    { gradient: 'from-indigo-500/25 to-indigo-700/5', border: 'border-indigo-400/50', badge: 'bg-indigo-500 text-white', badgeText: '도제', icon: '🎖️', rank: 2, dot: 'bg-indigo-400' },
  TRAINEE: { gradient: 'from-slate-600/30 to-slate-800/5', border: 'border-slate-500/40', badge: 'bg-slate-500 text-white', badgeText: '수련생', icon: '🌱', rank: 3, dot: 'bg-slate-400' },
};
const getPos = (code: string) => POS[code] ?? POS.TRAINEE;

/* ── 수련생 미니 카드 ── */
function TraineeCard({ user }: { user: any }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/30 hover:border-slate-500/50 transition-all min-w-[130px]">
      <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
        {user.name?.charAt(0)}
      </div>
      <div className="min-w-0">
        <div className="text-white text-xs font-medium truncate">{user.name}</div>
        <div className="text-slate-500 text-[10px] truncate">{user.employeeId}</div>
      </div>
    </div>
  );
}

/* ── 도제 행 (도제 + 소속 수련생) ── */
function DojeRow({ doje }: { doje: any }) {
  const [open, setOpen] = useState(true);
  const trainees = doje.subordinates ?? [];
  return (
    <div className="border border-indigo-500/20 rounded-2xl overflow-hidden bg-slate-900/40">
      {/* 도제 헤더 */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-500/5 transition-all text-left"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {doje.name?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">{doje.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500 text-white font-bold">도제</span>
            {doje.room && <span className="text-[10px] text-indigo-300">💬 {doje.room.name}</span>}
          </div>
          <div className="text-slate-500 text-[10px]">{doje.employeeId}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-slate-400">수련생 <b className="text-white">{trainees.length}</b>명</span>
          <span className="text-slate-500 text-sm">{open ? '▴' : '▾'}</span>
        </div>
      </button>
      {/* 수련생 그리드 */}
      {open && trainees.length > 0 && (
        <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2">
          {trainees.map((t: any) => <TraineeCard key={t.employeeId} user={t} />)}
        </div>
      )}
      {open && trainees.length === 0 && (
        <div className="px-4 pb-4 text-xs text-slate-600">수련생 없음</div>
      )}
    </div>
  );
}

/* ── 테바 카드 (접기/펼치기) ── */
function TebaCard({ teba }: { teba: any }) {
  const [open, setOpen] = useState(false);
  const dojes = teba.subordinates ?? [];
  const traineeTotal = dojes.reduce((s: number, d: any) => s + (d.subordinates?.length ?? 0), 0);

  return (
    <div className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden
      bg-gradient-to-b ${getPos(teba.position?.code ?? '').gradient}
      ${open ? 'border-violet-400/70 shadow-xl shadow-violet-500/20' : 'border-violet-500/30 hover:border-violet-400/60 hover:shadow-lg hover:shadow-violet-500/10'}
    `}>
      {/* 테바 헤더 (클릭으로 펼침) */}
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-4 px-5 py-4 text-left">
        {/* 아바타 */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
          {teba.name?.charAt(0)}
        </div>
        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold text-base">{teba.name}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500 text-white font-bold">👑 테바</span>
            {teba.room && <span className="text-xs text-indigo-300">💬 {teba.room.name}</span>}
          </div>
          <div className="text-slate-400 text-xs mt-0.5">{teba.employeeId}</div>
        </div>
        {/* 통계 */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <div className="text-white font-bold text-lg">{dojes.length}</div>
            <div className="text-[10px] text-slate-400">도제</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-white font-bold text-lg">{traineeTotal}</div>
            <div className="text-[10px] text-slate-400">수련생</div>
          </div>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all
            ${open ? 'bg-violet-500/30 text-violet-300' : 'bg-slate-700 text-slate-400'}`}>
            {open ? '▴' : '▾'}
          </div>
        </div>
      </button>

      {/* 펼쳐진 도제 목록 */}
      {open && (
        <div className="border-t border-white/5 px-5 py-4 space-y-3 bg-slate-950/30">
          {dojes.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-4">소속 도제가 없습니다</p>
          ) : (
            dojes.map((doje: any) => <DojeRow key={doje.employeeId} doje={doje} />)
          )}
        </div>
      )}
    </div>
  );
}

/* ── 통계 카드 ── */
function Stat({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 border ${color}`}>
      <span className="text-lg">{icon}</span>
      <div>
        <div className="text-xl font-bold text-white">{value}</div>
        <div className="text-[11px] text-slate-400">{label}</div>
      </div>
    </div>
  );
}

/* ── 메인 페이지 ── */
export default function AdminOrgChart() {
  const { selectedProjectId } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRoom, setFilterRoom] = useState('');
  const [search, setSearch] = useState('');
  const [expandAll, setExpandAll] = useState(false);
  const [expandKey, setExpandKey] = useState(0); // force re-render on expand all

  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    Promise.all([
      api.get(`/users?projectId=${selectedProjectId}`),
      api.get(`/rooms?projectId=${selectedProjectId}`),
    ]).then(([u, r]) => {
      setUsers(u.data.filter((x: any) => x.isActive));
      setRooms(r.data);
    }).finally(() => setLoading(false));
  }, [selectedProjectId]);

  /* 계층 트리 빌드 */
  const buildTree = (all: any[]) => {
    const map: Record<string, any> = {};
    all.forEach(u => { map[u.employeeId] = { ...u, subordinates: [] }; });
    const roots: any[] = [];
    all.forEach(u => {
      if (u.parentEmployeeId && map[u.parentEmployeeId]) {
        map[u.parentEmployeeId].subordinates.push(map[u.employeeId]);
      } else {
        roots.push(map[u.employeeId]);
      }
    });
    return roots;
  };

  let filtered = users;
  if (filterRoom) filtered = filtered.filter(u => u.room?.id === Number(filterRoom));
  if (search.trim()) filtered = filtered.filter(u => u.name.includes(search.trim()) || u.employeeId.includes(search.trim()));

  const tree = buildTree(filtered).sort((a, b) => getPos(a.position?.code).rank - getPos(b.position?.code).rank);

  // 테바/매니저 루트만 (도제·수련생 루트는 별도 표시)
  const rootTebas = tree.filter(u => ['TEBA', 'MANAGER'].includes(u.position?.code ?? ''));
  const orphans   = tree.filter(u => !['TEBA', 'MANAGER'].includes(u.position?.code ?? ''));

  const cnt = (code: string) => users.filter(u => u.position?.code === code).length;

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-violet-500/30">🗂️</div>
          <div>
            <h1 className="text-xl font-bold text-white">조직 구조 로드맵</h1>
            <p className="text-slate-500 text-xs mt-0.5">테바 카드를 클릭하면 팀 구성이 펼쳐집니다</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 검색 */}
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름/사원번호..."
              className="bg-slate-800 border border-white/10 text-white rounded-xl pl-7 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40" />
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div className="flex gap-3 flex-wrap">
        <Stat icon="⭐" label="매니저" value={cnt('MANAGER')} color="border-amber-500/30" />
        <Stat icon="👑" label="테바" value={cnt('TEBA')} color="border-violet-500/30" />
        <Stat icon="🎖️" label="도제" value={cnt('DOJE')} color="border-indigo-500/30" />
        <Stat icon="🌱" label="수련생" value={cnt('TRAINEE')} color="border-slate-500/30" />
        <Stat icon="👤" label="전체" value={users.length} color="border-white/10" />
      </div>

      {/* 팀 필터 */}
      {rooms.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterRoom('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${!filterRoom ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700'}`}>
            전체 팀
          </button>
          {rooms.map((r: any) => (
            <button key={r.id} onClick={() => setFilterRoom(String(r.id))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filterRoom === String(r.id) ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700'}`}>
              💬 {r.name}
            </button>
          ))}
        </div>
      )}

      {/* 구분선 */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

      {/* 테바 카드 그리드 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : rootTebas.length === 0 && orphans.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-slate-600">
          <div className="text-5xl mb-4 opacity-30">🗂️</div>
          <p className="font-medium">표시할 직원이 없습니다</p>
          <p className="text-sm mt-1 text-slate-700">필터를 변경하거나 직원을 먼저 등록해 주세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 테바별 카드 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {rootTebas.map(teba => (
              <TebaCard key={teba.employeeId + expandKey} teba={teba} />
            ))}
          </div>

          {/* 상위 없는 도제/수련생 */}
          {orphans.length > 0 && (
            <div className="mt-6">
              <div className="text-xs text-slate-500 font-medium mb-3 px-1">⚠️ 상위 관리자 미배정</div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {orphans.map(u => {
                  const p = getPos(u.position?.code ?? '');
                  return (
                    <div key={u.employeeId} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${p.border} bg-gradient-to-r ${p.gradient}`}>
                      <div className={`w-8 h-8 rounded-full ${p.dot} flex items-center justify-center text-white font-bold text-sm`}>{u.name?.charAt(0)}</div>
                      <div>
                        <div className="text-white text-sm font-semibold">{u.name}</div>
                        <div className="text-slate-400 text-xs">{u.employeeId} · {u.position?.name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
