import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';

const POSITION_LABELS: Record<string, string> = { TEBA: '테바', DOJE: '도제', TRAINEE: '수련생', MANAGER: '띠 매니저' };
const POSITION_COLORS: Record<string, string> = {
  TEBA: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  DOJE: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  TRAINEE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  MANAGER: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

function Badge({ code }: { code: string }) {
  return (
    <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full border font-medium ${POSITION_COLORS[code] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}>
      {POSITION_LABELS[code] || code}
    </span>
  );
}

function fmt(n: number) { return `${n.toLocaleString('ko-KR')}원`; }

// ─── 직원 생성/수정 모달 ───────────────────────────────────────
function UserModal({ user, positions, projects, onClose, onSave }: any) {
  const [form, setForm] = useState(
    user
      ? { ...user, contractStart: user.contractStart?.split('T')[0] ?? '' }
      : { employeeId: '', projectId: projects[0]?.id ?? 1, positionId: '', name: '', password: '', parentEmployeeId: '', contractStart: format(new Date(), 'yyyy-MM-dd'), isStoreOwner: false, phone: '', bank: '', accountNumber: '', accountHolder: '', role: 'USER' }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const projectPositions = positions.filter((p: any) => p.projectId === Number(form.projectId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (user) {
        await api.put(`/users/${user.employeeId}`, form);
      } else {
        await api.post('/users', form);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || '저장 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{user ? '직원 정보 수정' : '신규 직원 등록'}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>}

          {!user && (
            <div className="grid grid-cols-2 gap-4">
              <InputField label="사원번호 *" value={form.employeeId} onChange={(v: string) => setForm({ ...form, employeeId: v })} placeholder="예: LAS-001" required />
              <InputField label="초기 비밀번호 *" type="password" value={form.password} onChange={(v: string) => setForm({ ...form, password: v })} placeholder="초기 비밀번호" required />
            </div>
          )}

          <InputField label="이름 *" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} required />

          <div className="grid grid-cols-2 gap-4">
            <SelectField label="프로젝트 *" value={form.projectId} onChange={(v: string) => setForm({ ...form, projectId: Number(v), positionId: '' })}>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </SelectField>
            <SelectField label="직급 *" value={form.positionId} onChange={(v: string) => setForm({ ...form, positionId: Number(v) })} required>
              <option value="">선택</option>
              {projectPositions.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </SelectField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="계약 시작일 *" type="date" value={form.contractStart} onChange={(v: string) => setForm({ ...form, contractStart: v })} required />
            <InputField label="상위 관리자 사번" value={form.parentEmployeeId ?? ''} onChange={(v: string) => setForm({ ...form, parentEmployeeId: v })} placeholder="예: ADMIN-001" />
          </div>

          <InputField label="연락처" value={form.phone ?? ''} onChange={(v: string) => setForm({ ...form, phone: v })} placeholder="010-0000-0000" />

          <div className="grid grid-cols-3 gap-4">
            <InputField label="은행명" value={form.bank ?? ''} onChange={(v: string) => setForm({ ...form, bank: v })} placeholder="국민은행" />
            <InputField label="계좌번호" value={form.accountNumber ?? ''} onChange={(v: string) => setForm({ ...form, accountNumber: v })} placeholder="0000-000-000000" />
            <InputField label="예금주" value={form.accountHolder ?? ''} onChange={(v: string) => setForm({ ...form, accountHolder: v })} />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isStoreOwner} onChange={(e) => setForm({ ...form, isStoreOwner: e.target.checked })} className="w-4 h-4 accent-indigo-500" />
              <span className="text-sm text-slate-300">주인형 점주 (지급 익익월 지연)</span>
            </label>
            {user && (
              <SelectField label="" value={form.role} onChange={(v: string) => setForm({ ...form, role: v })}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </SelectField>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all text-sm">취소</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-all text-sm font-semibold">
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder = '', required = false }: any) {
  return (
    <div>
      {label && <label className="block text-xs text-slate-400 mb-1">{label}</label>}
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, children }: any) {
  return (
    <div>
      {label && <label className="block text-xs text-slate-400 mb-1">{label}</label>}
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {children}
      </select>
    </div>
  );
}

// ─── 우측 상세 패널 ───────────────────────────────────────────
function DetailPanel({ employeeId, onClose }: { employeeId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'sales' | 'reports' | 'fees'>('info');

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${employeeId}`).then((r) => setDetail(r.data)).finally(() => setLoading(false));
  }, [employeeId]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-slate-900/50">
      <div className="text-slate-500 animate-pulse">로딩 중...</div>
    </div>
  );
  if (!detail) return null;

  const TABS = [
    { key: 'info', label: '인사정보' },
    { key: 'sales', label: `판매 (${detail.sales?.length ?? 0})` },
    { key: 'reports', label: `보고서 (${detail.activityReports?.length ?? 0})` },
    { key: 'fees', label: '수당 내역' },
  ];

  return (
    <div className="w-[420px] flex-shrink-0 bg-slate-900 border-l border-white/5 flex flex-col overflow-hidden">
      {/* 패널 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-lg">{detail.name}</h3>
            {detail.isStoreOwner && (
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">주인형 점주</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge code={detail.position?.code} />
            <span className="text-xs text-slate-500">{detail.employeeId}</span>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-white/5 px-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`text-xs font-medium py-3 px-3 border-b-2 transition-colors ${activeTab === t.key ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'info' && (
          <div className="space-y-4">
            <InfoRow label="계약 시작일" value={detail.contractStart ? format(new Date(detail.contractStart), 'yyyy년 MM월 dd일') : '-'} />
            <InfoRow label="프로젝트" value={detail.project?.name} />
            <InfoRow label="상위 관리자" value={detail.parent?.name ?? '-'} />
            <InfoRow label="연락처" value={detail.phone ?? '-'} />
            <div className="mt-4 p-4 bg-slate-800/50 rounded-xl">
              <div className="text-xs text-slate-500 mb-3 font-medium">계좌 정보</div>
              <InfoRow label="은행" value={detail.bank ?? '-'} />
              <InfoRow label="계좌번호" value={detail.accountNumber ?? '-'} />
              <InfoRow label="예금주" value={detail.accountHolder ?? detail.name} />
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <div className="text-xs text-slate-500 mb-3 font-medium">산하 직원</div>
              {detail.subordinates?.length === 0 ? (
                <div className="text-xs text-slate-600">산하 직원 없음</div>
              ) : (
                detail.subordinates?.map((s: any) => (
                  <div key={s.employeeId} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-white">{s.name}</span>
                    <Badge code={s.position?.code} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-2">
            {detail.sales?.length === 0 && <div className="text-center py-10 text-slate-600 text-sm">판매 실적 없음</div>}
            {detail.sales?.map((s: any) => (
              <div key={s.id} className="p-3 bg-slate-800/50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{s.customerName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.paymentMethod === 'CARD' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {s.paymentMethod === 'CARD' ? '카드' : '현금'}
                  </span>
                </div>
                <div className="text-xs text-slate-400">{s.product?.series}시리즈 {s.product?.language} · {s.salesWeek}주차</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">실결제: {fmt(s.actualAmount)}</span>
                  {s.deductedFee > 0 && <span className="text-xs text-orange-400">수수료: -{fmt(s.deductedFee)}</span>}
                  <span className="text-sm font-semibold text-indigo-300">순매출: {fmt(s.netAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-2">
            {detail.activityReports?.length === 0 && <div className="text-center py-10 text-slate-600 text-sm">보고서 없음</div>}
            {detail.activityReports?.map((r: any) => (
              <div key={r.id} className="p-3 bg-slate-800/50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">{format(new Date(r.submittedAt), 'MM.dd (EEE)', { locale: ko })}</span>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">가망고객 {r.prospectCount}명</span>
                </div>
                {r.counselContent && <div className="text-sm text-white mt-1">{r.counselContent}</div>}
                {r.adminEvaluation && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">평가:</span>
                    <span className="text-sm font-bold text-indigo-300">{r.adminEvaluation}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">초기 활동비</div>
              {detail.activityFees?.length === 0 && <div className="text-xs text-slate-600 py-3">활동비 내역 없음</div>}
              {detail.activityFees?.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div>
                    <span className="text-sm text-white">{f.payMonth} ({f.paymentRound}차)</span>
                    <div className="text-xs text-slate-500 mt-0.5">발생액: {fmt(f.grossAmount)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-indigo-300">{fmt(f.netAmount)}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${f.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                      {f.paymentStatus === 'PAID' ? '지급완료' : '대기'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">월간 성과급</div>
              {detail.commissions?.length === 0 && <div className="text-xs text-slate-600 py-3">성과급 내역 없음</div>}
              {detail.commissions?.map((c: any) => (
                <div key={c.id} className="p-3 bg-slate-800/50 rounded-xl mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-medium">{c.settlementMonth}</span>
                    {c.achievementGrade && (
                      <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold">{c.achievementGrade}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-slate-500">유치건수</div>
                      <div className="text-white font-medium">{c.salesCount}건</div>
                    </div>
                    <div>
                      <div className="text-slate-500">성과수당</div>
                      <div className="text-white font-medium">{fmt(c.performanceBonus)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">보조금</div>
                      <div className="text-white font-medium">{fmt(c.subsidy)}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <span className="text-xs text-slate-500">세후 실수령액</span>
                    <span className="text-sm font-bold text-indigo-300">{fmt(c.netAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-1.5">
      <span className="text-xs text-slate-500 flex-shrink-0 w-24">{label}</span>
      <span className="text-sm text-white text-right">{value}</span>
    </div>
  );
}

// ─── 메인 Users 페이지 ────────────────────────────────────────
export default function AdminUsers() {
  const { selectedProjectId } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterPos, setFilterPos] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, posRes, projRes] = await Promise.all([
        api.get(`/users?projectId=${selectedProjectId}`),
        api.get(`/positions?projectId=${selectedProjectId}`),
        api.get('/projects'),
      ]);
      setUsers(usersRes.data);
      setPositions(posRes.data);
      setProjects(projRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) load();
  }, [selectedProjectId]);

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.name.includes(search) || u.employeeId.includes(search);
    const matchPos = !filterPos || u.position?.code === filterPos;
    return matchSearch && matchPos;
  });

  return (
    <div className="flex h-full">
      {/* 좌측: 직원 목록 */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">인사 관리</h1>
            <button
              id="addUserBtn"
              onClick={() => { setEditUser(null); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-600/20"
            >
              + 직원 등록
            </button>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="이름 또는 사원번호 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-800 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={filterPos}
              onChange={(e) => setFilterPos(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">전체 직급</option>
              {['TEBA', 'DOJE', 'MANAGER', 'TRAINEE'].map((c) => (
                <option key={c} value={c}>{POSITION_LABELS[c]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-2 p-6">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600">
              <span className="text-4xl mb-3">👥</span>
              <p>등록된 직원이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((u) => (
                <div
                  key={u.employeeId}
                  onClick={() => setSelectedId(selectedId === u.employeeId ? null : u.employeeId)}
                  className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-all hover:bg-white/3 ${selectedId === u.employeeId ? 'bg-indigo-600/10 border-r-2 border-indigo-500' : ''}`}
                >
                  {/* 아바타 */}
                  <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-300 font-bold text-sm">{u.name.charAt(0)}</span>
                  </div>
                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{u.name}</span>
                      {u.isStoreOwner && <span className="text-xs text-amber-400">🏪</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{u.employeeId}</span>
                      {u.parent && <span className="text-xs text-slate-600">· 상위: {u.parent.name}</span>}
                    </div>
                  </div>
                  {/* 직급 배지 */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge code={u.position?.code} />
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditUser(u); setShowModal(true); }}
                      className="text-slate-600 hover:text-white transition-colors text-sm p-1"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 우측: 상세 패널 */}
      {selectedId && (
        <DetailPanel employeeId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      {/* 모달 */}
      {showModal && (
        <UserModal
          user={editUser}
          positions={positions}
          projects={projects}
          onClose={() => { setShowModal(false); setEditUser(null); }}
          onSave={() => { setShowModal(false); setEditUser(null); load(); }}
        />
      )}
    </div>
  );
}
