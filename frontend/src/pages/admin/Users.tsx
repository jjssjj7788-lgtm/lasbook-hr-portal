import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { downloadExcel, parseExcel } from '../../lib/excel';

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
function UserModal({ user, positions, projects, allUsers, onClose, onSave }: any) {
  const [form, setForm] = useState(
    user
      ? { ...user, contractStart: user.contractStart?.split('T')[0] ?? '', roomId: user.roomId ?? '' }
      : { employeeId: '', projectId: projects[0]?.id ?? 1, positionId: '', roomId: '', name: '', password: '', parentEmployeeId: '', contractStart: format(new Date(), 'yyyy-MM-dd'), isStoreOwner: false, phone: '', bank: '', accountNumber: '', accountHolder: '', role: 'USER' }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [showNewRoom, setShowNewRoom] = useState(false);

  useEffect(() => {
    if (form.projectId) {
      api.get(`/rooms?projectId=${form.projectId}`).then((r) => setRooms(r.data)).catch(() => {});
    }
  }, [form.projectId]);

  const handleCreateRoomInline = async () => {
    if (!newRoomName.trim()) return;
    try {
      const res = await api.post('/rooms', { projectId: Number(form.projectId), name: newRoomName.trim() });
      setRooms([...rooms, res.data]);
      setForm((f: any) => ({ ...f, roomId: res.data.id }));
      setNewRoomName(''); setShowNewRoom(false);
    } catch {}
  };

  const projectPositions = positions.filter((p: any) => p.projectId === Number(form.projectId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 유효성 검사
    if (!form.positionId) { setError('직급을 선택해 주세요.'); setLoading(false); return; }
    if (!form.projectId) { setError('프로젝트를 선택해 주세요.'); setLoading(false); return; }
    if (!form.name.trim()) { setError('이름을 입력해 주세요.'); setLoading(false); return; }

    try {
      // 필요한 스칼라 필드만 명시적으로 추출 (중첩 객체 제외)
      const base = {
        name: form.name,
        projectId: Number(form.projectId),
        positionId: Number(form.positionId),
        roomId: form.roomId ? Number(form.roomId) : null,
        parentEmployeeId: form.parentEmployeeId || null,
        contractStart: form.contractStart,
        isStoreOwner: Boolean(form.isStoreOwner),
        phone: form.phone || null,
        bank: form.bank || null,
        accountNumber: form.accountNumber || null,
        accountHolder: form.accountHolder || null,
        role: form.role || 'USER',
        notes: form.notes || null,
        isActive: form.isActive !== false,
      };
      if (user) {
        await api.put(`/users/${user.employeeId}`, base);
      } else {
        await api.post('/users', { ...base, employeeId: form.employeeId, password: form.password });
      }
      onSave();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || '저장 실패');
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

          {/* 팀(Room) 선택 + 인라인 생성 */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">소속 팀(Room)</label>
            <div className="flex gap-2">
              <select value={form.roomId ?? ''} onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">팀 미배정</option>
                {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.name} ({r.members?.length ?? 0}명)</option>)}
              </select>
              <button type="button" onClick={() => setShowNewRoom(!showNewRoom)}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors whitespace-nowrap">+ 새 팀</button>
            </div>
            {showNewRoom && (
              <div className="flex gap-2 mt-2">
                <input autoFocus value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateRoomInline(); } }}
                  placeholder="팀 이름 입력 후 엔터"
                  className="flex-1 px-3 py-2 bg-slate-800 border border-indigo-500 rounded-lg text-white text-sm focus:outline-none" />
                <button type="button" onClick={handleCreateRoomInline}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs">생성</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="계약 시작일 *" type="date" value={form.contractStart} onChange={(v: string) => setForm({ ...form, contractStart: v })} required />
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">상위 관리자</label>
              <select
                value={form.parentEmployeeId ?? ''}
                onChange={(e) => setForm({ ...form, parentEmployeeId: e.target.value || null })}
                className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">(없음 — 최상위)</option>
                {(allUsers ?? []).filter((u: any) => u.employeeId !== user?.employeeId).map((u: any) => (
                  <option key={u.employeeId} value={u.employeeId}>
                    {u.name} ({u.employeeId}) — {u.position?.name ?? ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <InputField label="연락처" value={form.phone ?? ''} onChange={(v: string) => setForm({ ...form, phone: v })} placeholder="010-0000-0000" />

          <div className="grid grid-cols-3 gap-4">
            <InputField label="은행명" value={form.bank ?? ''} onChange={(v: string) => setForm({ ...form, bank: v })} placeholder="국민은행" />
            <InputField label="계좌번호" value={form.accountNumber ?? ''} onChange={(v: string) => setForm({ ...form, accountNumber: v })} placeholder="0000-000-000000" />
            <InputField label="예금주" value={form.accountHolder ?? ''} onChange={(v: string) => setForm({ ...form, accountHolder: v })} />
          </div>

          {/* 주인형 점주 & 관리자 권한 완전 분리 */}
          <div className="p-4 bg-slate-800/50 rounded-xl space-y-3 border border-white/5">
            <div className="text-xs text-slate-500 font-medium">추가 설정</div>
            <div>
              <div className="text-xs text-slate-400 mb-1.5">🏪 주인형 점주</div>
              <div className="flex gap-2">
                {[{ label: 'Y (해당)', val: true }, { label: 'N (해당없음)', val: false }].map(({ label, val }) => (
                  <button key={String(val)} type="button" onClick={() => setForm({ ...form, isStoreOwner: val })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                      form.isStoreOwner === val
                        ? val ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-600 text-slate-200 border-slate-500'
                        : 'bg-slate-700 text-slate-400 border-white/5 hover:bg-slate-600'
                    }`}>{label}</button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1.5">지급 방식: 익익월 지연 지급 (시스템 권한과 무관)</p>
            </div>
            {user && (
              <div className="pt-2 border-t border-white/5">
                <div className="text-xs text-slate-500 mb-2">🔑 시스템 권한 (관리자만 변경 가능)</div>
                <div className="flex gap-2">
                  {['USER', 'ADMIN'].map((r) => (
                    <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                        form.role === r
                          ? r === 'ADMIN' ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : 'bg-slate-700 text-slate-400 border-white/5 hover:bg-slate-600'
                      }`}>{r === 'ADMIN' ? '관리자(ADMIN)' : '일반(USER)'}</button>
                  ))}
                </div>
              </div>
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

  // ── 엑셀 다운로드 ──
  const handleDownloadExcel = () => {
    const rows = users.map((u) => ({
      '사원번호': u.employeeId,
      '이름': u.name,
      '프로젝트': u.project?.name ?? '',
      '직급': u.position?.name ?? '',
      '직급코드': u.position?.code ?? '',
      '소속팀': u.room?.name ?? '',
      '상위관리자': u.parent?.name ?? '',
      '계약시작일': u.contractStart ? format(new Date(u.contractStart), 'yyyy-MM-dd') : '',
      '연락처': u.phone ?? '',
      '은행': u.bank ?? '',
      '계좌번호': u.accountNumber ?? '',
      '예금주': u.accountHolder ?? '',
      '주인형점주': u.isStoreOwner ? 'Y' : 'N',
      '재직여부': u.isActive !== false ? 'Y' : 'N',
    }));
    downloadExcel(rows, `인원현황_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  // ── 양식 다운로드 ──
  const handleDownloadTemplate = () => {
    const template = [{
      '사원번호': 'LAS-001 (필수)',
      '이름': '홍길동 (필수)',
      '직급코드': 'TEBA / DOJE / TRAINEE / MANAGER 중 택1 (필수)',
      '계약시작일': '2026-01-01 (필수)',
      '초기비밀번호': '1234! (필수)',
      '연락처': '010-0000-0000',
      '은행': '국민은행',
      '계좌번호': '123-456-789012',
      '예금주': '홍길동',
      '상위관리자사원번호': '',
      '주인형점주': 'N',
    }];
    downloadExcel(template, '인원_업로드양식.xlsx');
  };

  // ── 엑셀 업로드 ──
  const uploadRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ ok: number; fail: string[] } | null>(null);

  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    setUploadResult(null);
    try {
      const rows = await parseExcel(file);
      const posMap: Record<string, number> = {};
      positions.forEach((p: any) => { posMap[p.code] = p.id; });
      const projectId = selectedProjectId ?? projects[0]?.id ?? 1;
      let ok = 0;
      const fail: string[] = [];
      for (const row of rows) {
        const code = String(row['직급코드'] ?? '').trim();
        const posId = posMap[code];
        if (!posId) { fail.push(`${row['이름']} — 직급코드 오류(${code})`); continue; }
        try {
          await api.post('/users', {
            employeeId: String(row['사원번호'] ?? '').trim(),
            name: String(row['이름'] ?? '').trim(),
            projectId,
            positionId: posId,
            contractStart: String(row['계약시작일'] ?? format(new Date(), 'yyyy-MM-dd')).trim(),
            password: String(row['초기비밀번호'] ?? 'Change1!').trim(),
            phone: String(row['연락처'] ?? '').trim() || null,
            bank: String(row['은행'] ?? '').trim() || null,
            accountNumber: String(row['계좌번호'] ?? '').trim() || null,
            accountHolder: String(row['예금주'] ?? '').trim() || null,
            parentEmployeeId: String(row['상위관리자사원번호'] ?? '').trim() || null,
            isStoreOwner: String(row['주인형점주'] ?? 'N').trim() === 'Y',
            role: 'USER',
          });
          ok++;
        } catch (err: any) {
          fail.push(`${row['이름']} — ${err.response?.data?.message ?? '등록 실패'}`);
        }
      }
      setUploadResult({ ok, fail });
      load();
    } finally {
      setUploading(false);
    }
  };

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
    <div style={{ display: 'flex', height: '100%', background: '#F8FAFC' }}>

      {/* ── 좌측: 직원 목록 ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* 헤더 */}
        <div style={{ padding: '24px 28px', background: '#fff', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>인사 관리</h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0' }}>전체 {users.length}명 등록됨</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={handleDownloadTemplate} style={btnStyle('ghost')}>📋 양식</button>
              <button onClick={handleDownloadExcel} style={btnStyle('ghost')}>⬇ 엑셀 다운</button>
              <label style={{ ...btnStyle('ghost'), cursor: 'pointer' }}>
                {uploading ? '업로드 중...' : '⬆ 일괄 업로드'}
                <input ref={uploadRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleUploadExcel} disabled={uploading} />
              </label>
              <button id="addUserBtn" onClick={() => { setEditUser(null); setShowModal(true); }} style={btnStyle('primary')}>
                + 직원 등록
              </button>
            </div>
          </div>

          {/* 검색/필터 */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '14px' }}>🔍</span>
              <input type="text" placeholder="이름 또는 사원번호 검색..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '9px', paddingBottom: '9px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', color: '#0F172A', background: '#F8FAFC', boxSizing: 'border-box' }} />
            </div>
            <select value={filterPos} onChange={e => setFilterPos(e.target.value)}
              style={{ padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', color: '#0F172A', background: '#F8FAFC', cursor: 'pointer' }}>
              <option value="">전체 직급</option>
              {['TEBA','DOJE','MANAGER','TRAINEE'].map(c => <option key={c} value={c}>{POSITION_LABELS[c]}</option>)}
            </select>
          </div>

          {/* 업로드 결과 */}
          {uploadResult && (
            <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', background: uploadResult.fail.length > 0 ? '#FFFBEB' : '#F0FDF4', border: `1px solid ${uploadResult.fail.length > 0 ? '#FDE68A' : '#BBF7D0'}`, color: uploadResult.fail.length > 0 ? '#92400E' : '#166534' }}>
              <div>
                <div style={{ fontWeight: 600 }}>업로드 완료: 성공 {uploadResult.ok}명{uploadResult.fail.length > 0 ? ` / 실패 ${uploadResult.fail.length}건` : ' ✓'}</div>
                {uploadResult.fail.map((f, i) => <div key={i} style={{ fontSize: '12px', opacity: 0.8 }}>• {f}</div>)}
              </div>
              <button onClick={() => setUploadResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '14px' }}>✕</button>
            </div>
          )}
        </div>

        {/* 직원 테이블 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...Array(6)].map((_, i) => <div key={i} style={{ height: '56px', background: '#E2E8F0', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94A3B8' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
              <div style={{ fontSize: '15px', fontWeight: 500 }}>등록된 직원이 없습니다</div>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              {/* 테이블 헤더 */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: '0', padding: '10px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['이름 / 사원번호','직급','소속 팀','상위 관리자',''].map((h, i) => (
                  <div key={i} style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                ))}
              </div>
              {/* 행 */}
              {filtered.map((u, idx) => (
                <div key={u.employeeId}
                  onClick={() => setSelectedId(selectedId === u.employeeId ? null : u.employeeId)}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
                    gap: '0', padding: '13px 20px', cursor: 'pointer',
                    borderBottom: idx < filtered.length - 1 ? '1px solid #F1F5F9' : 'none',
                    background: selectedId === u.employeeId ? 'rgba(20,184,166,0.05)' : 'transparent',
                    borderLeft: selectedId === u.employeeId ? '3px solid #14B8A6' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (selectedId !== u.employeeId) e.currentTarget.style.background = '#F8FAFC'; }}
                  onMouseLeave={e => { if (selectedId !== u.employeeId) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* 이름 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', minWidth: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#14B8A6,#0F766E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '13px' }}>
                      {u.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '14px' }}>{u.name} {u.isStoreOwner && <span style={{ fontSize: '11px' }}>🏪</span>}</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>{u.employeeId}</div>
                    </div>
                  </div>
                  {/* 직급 */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Badge code={u.position?.code} />
                  </div>
                  {/* 팀 */}
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#475569' }}>
                    {u.room?.name ?? <span style={{ color: '#CBD5E1' }}>미배정</span>}
                  </div>
                  {/* 상위관리자 */}
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#475569' }}>
                    {u.parent?.name ?? <span style={{ color: '#CBD5E1' }}>—</span>}
                  </div>
                  {/* 수정 버튼 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <button
                      onClick={e => { e.stopPropagation(); setEditUser(u); setShowModal(true); }}
                      style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: '#64748B', cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#14B8A6'; e.currentTarget.style.color = '#14B8A6'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; }}
                    >수정</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 우측: 상세 패널 */}
      {selectedId && <DetailPanel employeeId={selectedId} onClose={() => setSelectedId(null)} />}

      {/* 모달 */}
      {showModal && (
        <UserModal
          user={editUser}
          positions={positions}
          projects={projects}
          allUsers={users}
          onClose={() => { setShowModal(false); setEditUser(null); }}
          onSave={() => { setShowModal(false); setEditUser(null); load(); }}
        />
      )}
    </div>
  );
}

function btnStyle(variant: 'primary' | 'ghost'): React.CSSProperties {
  if (variant === 'primary') return {
    padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    background: '#14B8A6', color: '#fff', fontWeight: 600, fontSize: '13px',
    boxShadow: '0 2px 8px rgba(20,184,166,0.3)', transition: 'background 0.15s',
  };
  return {
    padding: '8px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', cursor: 'pointer',
    background: '#fff', color: '#475569', fontWeight: 500, fontSize: '13px',
    transition: 'all 0.15s',
  };
}

