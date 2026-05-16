import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addMonths, startOfMonth, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import api from '../../lib/axios';

interface InvestmentHistory {
  id: number;
  investmentAmount: number;
  worksInStore: boolean | null;
  startDate: string;
  endDate: string | null;
  notes: string | null;
}

interface CustomFieldValue {
  id: number;
  value: string;
  field: { id: number; fieldName: string; fieldType: string };
}

interface JobType {
  id: number;
  name: string;
  hasInvestmentTiers: boolean;
  investmentTiers: { investmentAmount: number; worksInStore: boolean; salary: number }[];
}

interface UserDetail {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  type: string | null;
  types: string | null;
  typesArray: string[];
  church: string | null;
  cohort: string | null;
  position: string | null;
  bank: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
  investmentAmount: number | null;
  worksInStore: boolean | null;
  customSalary: number | null;
  role: string;
  investmentHistory: InvestmentHistory[];
  customFieldValues: CustomFieldValue[];
  payrolls: any[];
}

const INVESTMENT_OPTIONS = [1000, 2000, 3000, 6000];

const nextMonthFirst = () => {
  const d = addMonths(startOfMonth(new Date()), 1);
  return format(d, 'yyyy-MM-dd');
};

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editTypesArray, setEditTypesArray] = useState<string[]>([]);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // 투자이력 추가 / 수정 모달
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingHistory, setEditingHistory] = useState<InvestmentHistory | null>(null); // null = 추가 모드
  const [historyForm, setHistoryForm] = useState({
    investmentAmount: '', worksInStore: '', startDate: '', notes: ''
  });

  // 월별 급여 달력
  const MONTHS_RANGE = Array.from({ length: 12 }, (_, i) => addMonths(startOfMonth(new Date()), i - 6));

  useEffect(() => {
    fetchDetail();
    api.get('/job-types').then(r => setJobTypes(r.data)).catch(console.error);
  }, [id]);

  const fetchDetail = () => {
    setLoading(true);
    api.get(`/users/${id}`)
      .then(r => {
        setUser(r.data);
        setEditTypesArray(r.data.typesArray || []);
        setForm({
          name: r.data.name, phone: r.data.phone || '', church: r.data.church || '',
          cohort: r.data.cohort || '', position: r.data.position || '',
          bank: r.data.bank || '', accountNumber: r.data.accountNumber || '',
          accountHolder: r.data.accountHolder || '',
          investmentAmount: r.data.investmentAmount || '',
          worksInStore: r.data.worksInStore != null ? String(r.data.worksInStore) : '',
          customSalary: r.data.customSalary || '', role: r.data.role,
        });
      })
      .finally(() => setLoading(false));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/users/${id}`, {
        ...form,
        typesArray: editTypesArray,
        investmentAmount: form.investmentAmount ? parseInt(form.investmentAmount) : null,
        customSalary: form.customSalary ? parseInt(form.customSalary) : null,
        worksInStore: form.worksInStore !== '' ? form.worksInStore === 'true' : null,
      });
      setEditMode(false);
      fetchDetail();
    } catch (err: any) {
      alert(err.response?.data?.message || '저장 실패');
    } finally { setSaving(false); }
  };

  // 이력 추가/수정 모달 열기
  const openAddHistory = () => {
    setEditingHistory(null);
    setHistoryForm({ investmentAmount: '', worksInStore: '', startDate: nextMonthFirst(), notes: '' });
    setShowHistoryModal(true);
  };

  const openEditHistory = (h: InvestmentHistory) => {
    setEditingHistory(h);
    setHistoryForm({
      investmentAmount: String(h.investmentAmount),
      worksInStore: h.worksInStore != null ? String(h.worksInStore) : '',
      startDate: format(new Date(h.startDate), 'yyyy-MM-dd'),
      notes: h.notes || '',
    });
    setShowHistoryModal(true);
  };

  const handleSaveHistory = async () => {
    if (!historyForm.investmentAmount || !historyForm.startDate) {
      alert('투자금액과 적용 시작일은 필수입니다.');
      return;
    }
    try {
      if (editingHistory) {
        // 수정 모드
        await api.patch(`/users/investment-history/${editingHistory.id}`, {
          investmentAmount: parseInt(historyForm.investmentAmount),
          worksInStore: historyForm.worksInStore !== '' ? historyForm.worksInStore === 'true' : null,
          startDate: historyForm.startDate,
          notes: historyForm.notes,
        });
      } else {
        // 추가 모드
        await api.post(`/users/${id}/investment-history`, {
          investmentAmount: parseInt(historyForm.investmentAmount),
          worksInStore: historyForm.worksInStore !== '' ? historyForm.worksInStore === 'true' : null,
          startDate: historyForm.startDate,
          notes: historyForm.notes,
        });
      }
      setShowHistoryModal(false);
      fetchDetail();
    } catch (err: any) {
      alert(err.response?.data?.message || '저장 실패');
    }
  };

  const handleDeleteHistory = async (historyId: number) => {
    if (!confirm('이 이력을 삭제하시겠습니까?')) return;
    await api.delete(`/users/investment-history/${historyId}`);
    fetchDetail();
  };

  // 특정 월의 투자 이력 조회
  const getInvestmentForMonth = (monthDate: Date, hist: InvestmentHistory[]): InvestmentHistory | null => {
    const ms = startOfMonth(monthDate);
    return hist.find(h => {
      const s = new Date(h.startDate);
      const e = h.endDate ? new Date(h.endDate) : new Date('9999-12-31');
      return s <= ms && ms <= e;
    }) || null;
  };

  // 해당 이력의 급여 조회 (투자 티어 매칭)
  const getSalaryForHistory = (h: InvestmentHistory | null): number | null => {
    if (!h || !user) return null;
    for (const typeName of user.typesArray) {
      const jt = jobTypes.find(j => j.name === typeName && j.hasInvestmentTiers);
      if (!jt) continue;
      const tier = jt.investmentTiers.find(t =>
        t.investmentAmount === h.investmentAmount &&
        t.worksInStore === (h.worksInStore ?? false)
      );
      if (tier) return tier.salary;
    }
    return null;
  };

  const hasInvestmentRole = user?.typesArray?.some(t => {
    const jt = jobTypes.find(j => j.name === t);
    return jt?.hasInvestmentTiers;
  });

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400';
  const labelCls = 'block text-xs font-semibold text-gray-400 mb-1';

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">불러오는 중...</div>;
  if (!user) return <div className="flex items-center justify-center h-64 text-gray-400">직원을 찾을 수 없습니다.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 뒤로가기 */}
      <div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="text-sm text-gray-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
        >
          ← 직원 목록으로
        </button>
      </div>

      {/* 헤더 카드 */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-8 text-white shadow">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold mb-3">
              {user.name[0]}
            </div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.typesArray.map(t => (
                <span key={t} className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium">{t}</span>
              ))}
            </div>
            <p className="mt-2 text-indigo-200 text-sm">{user.email} · {user.phone || '연락처 없음'}</p>
          </div>
          <div className="flex gap-2">
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-white text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-50 transition">
                ✏️ 기본정보 수정
              </button>
            ) : (
              <>
                <button onClick={() => setEditMode(false)} className="px-4 py-2 bg-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/30 transition">취소</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-white text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-50 disabled:opacity-60 transition">
                  {saving ? '저장 중...' : '저장'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 기본 정보 패널 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">📋 기본 정보</h2>
          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>직군 (복수 선택 가능)</label>
                <div className="flex flex-wrap gap-2">
                  {jobTypes.map(jt => (
                    <button key={jt.id} type="button"
                      onClick={() => setEditTypesArray(prev => prev.includes(jt.name) ? prev.filter(t => t !== jt.name) : [...prev, jt.name])}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${editTypesArray.includes(jt.name) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-indigo-50'}`}
                    >
                      {editTypesArray.includes(jt.name) ? '✓ ' : ''}{jt.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ['이름', 'name'], ['연락처', 'phone'], ['거점교회', 'church'],
                  ['기수', 'cohort'], ['직분', 'position'], ['은행명', 'bank'],
                  ['계좌번호', 'accountNumber'], ['예금주', 'accountHolder'],
                ] as [string, string][]).map(([label, key]) => (
                  <div key={key}>
                    <label className={labelCls}>{label}</label>
                    <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className={inputCls} />
                  </div>
                ))}
                <div>
                  <label className={labelCls}>권한</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={inputCls}>
                    <option value="STAFF">STAFF</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>개인 단가 (원)</label>
                  <input type="number" value={form.customSalary} onChange={e => setForm({ ...form, customSalary: e.target.value })} placeholder="미설정 시 직군 기준 적용" className={inputCls} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              {[
                ['거점교회', user.church], ['기수', user.cohort], ['직분', user.position],
                ['은행', user.bank], ['계좌번호', user.accountNumber], ['예금주', user.accountHolder],
                ['권한', user.role],
                ['개인단가', user.customSalary != null ? `${user.customSalary.toLocaleString()}원` : null],
              ].map(([label, val]) => !!val && (
                <div key={label as string} className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-gray-800">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 추가 정보 / 급여이력 */}
        <div className="space-y-4">
          {user.customFieldValues.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">📝 추가 정보</h2>
              <div className="space-y-2 text-sm">
                {user.customFieldValues.map(cv => (
                  <div key={cv.id} className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-400">{cv.field.fieldName}</span>
                    <span className="font-medium text-gray-800">{cv.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {user.payrolls.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">💰 최근 급여 이력</h2>
              <div className="space-y-2">
                {user.payrolls.slice(0, 5).map(p => (
                  <div key={p.id} className="flex justify-between items-center py-2 border-b border-gray-50 text-sm">
                    <div>
                      <span className="font-medium text-gray-800">{format(new Date(p.periodStart), 'yyyy년 M월', { locale: ko })}</span>
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded font-medium ${p.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : p.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.status === 'PAID' ? '지급완료' : p.status === 'APPROVED' ? '승인' : '대기'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{p.amount.toLocaleString()}원</div>
                      {p.deduction > 0 && <div className="text-xs text-red-400">-{p.deduction.toLocaleString()}원 차감</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────── */}
      {/* 주인형 점주: 투자 이력 + 월별 급여 달력               */}
      {/* ─────────────────────────────────────────────────────── */}
      {hasInvestmentRole && (
        <div className="space-y-6">

          {/* 투자 이력 타임라인 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">📊 투자 이력 관리</h2>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  투자금 증액 시 <span className="font-semibold text-indigo-500">다음달 1일</span>로 시작일 설정하면<br />
                  이번달은 현 금액, 다음달부터 변경된 금액이 자동 반영됩니다.
                </p>
              </div>
              <button
                onClick={openAddHistory}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition flex items-center gap-1.5"
              >
                + 이력 추가
              </button>
            </div>

            {user.investmentHistory.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                <p className="mb-2">등록된 투자 이력이 없습니다.</p>
                <p className="text-xs text-gray-300">위 버튼을 눌러 첫 투자 이력을 추가해 주세요.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 시간순 타임라인 (최신 → 오래된 순) */}
                {[...user.investmentHistory].reverse().map((h, idx) => {
                  const isActive = !h.endDate;
                  const startD = new Date(h.startDate);
                  const endD = h.endDate ? new Date(h.endDate) : null;
                  return (
                    <div
                      key={h.id}
                      className={`relative flex gap-4 p-4 rounded-xl border transition-all ${
                        isActive
                          ? 'border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-sm'
                          : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      {/* 타임라인 도트 */}
                      <div className="flex flex-col items-center gap-1 pt-0.5">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isActive ? 'bg-indigo-500 shadow-sm shadow-indigo-300' : 'bg-gray-300'}`} />
                        {idx < user.investmentHistory.length - 1 && (
                          <div className="w-px flex-1 bg-gray-200 min-h-[20px]" />
                        )}
                      </div>

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-lg font-bold text-gray-900">
                                {h.investmentAmount.toLocaleString()}만원
                              </span>
                              {h.worksInStore != null && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${h.worksInStore ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                  {h.worksInStore ? '🏪 매장 근무' : '🏠 비근무'}
                                </span>
                              )}
                              {isActive && (
                                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                                  ● 현재 적용 중
                                </span>
                              )}
                            </div>

                            {/* 기간 표시 */}
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                              <span className="font-medium text-gray-600">{format(startD, 'yyyy년 M월 d일')}</span>
                              <span>→</span>
                              {endD
                                ? <span className="font-medium text-gray-600">{format(endD, 'yyyy년 M월 d일')}</span>
                                : <span className="font-medium text-indigo-500">현재</span>
                              }
                            </div>

                            {h.notes && (
                              <p className="text-xs text-gray-400 mt-1 bg-white/60 px-2 py-1 rounded-lg">
                                💬 {h.notes}
                              </p>
                            )}
                          </div>

                          {/* 액션 버튼 */}
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => openEditHistory(h)}
                              className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition font-medium"
                            >
                              ✏️ 수정
                            </button>
                            <button
                              onClick={() => handleDeleteHistory(h.id)}
                              className="px-3 py-1.5 text-xs bg-white border border-red-100 rounded-lg text-red-400 hover:bg-red-50 transition font-medium"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 월별 급여 달력 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">📅 월별 급여 현황</h2>
            <p className="text-xs text-gray-400 mb-5">투자 이력에 기반하여 월별로 적용되는 급여를 보여줍니다</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {MONTHS_RANGE.map(monthDate => {
                const hist = getInvestmentForMonth(monthDate, user.investmentHistory);
                const salary = getSalaryForHistory(hist);
                const isCurrentMonth = format(monthDate, 'yyyy-MM') === format(new Date(), 'yyyy-MM');
                const isFuture = monthDate > startOfMonth(new Date());
                return (
                  <div
                    key={monthDate.toISOString()}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isCurrentMonth
                        ? 'border-indigo-300 bg-indigo-50 shadow-sm ring-2 ring-indigo-200'
                        : hist
                          ? (isFuture ? 'border-amber-100 bg-amber-50/50' : 'border-gray-200 bg-white')
                          : 'border-dashed border-gray-200 bg-gray-50 opacity-50'
                    }`}
                  >
                    <div className={`text-xs font-bold mb-0.5 ${isCurrentMonth ? 'text-indigo-600' : isFuture ? 'text-amber-600' : 'text-gray-500'}`}>
                      {format(monthDate, 'M월', { locale: ko })}
                    </div>
                    <div className="text-[10px] text-gray-400 mb-1">
                      {format(monthDate, 'yyyy')}
                    </div>
                    {salary != null ? (
                      <>
                        <div className={`text-sm font-bold ${isFuture ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {(salary / 10000).toLocaleString()}만
                        </div>
                        {hist && (
                          <div className="text-[9px] text-gray-400 mt-0.5 leading-tight">
                            {hist.investmentAmount}만원 기준
                            {hist.worksInStore != null && <br />}
                            {hist.worksInStore === true ? '매장O' : hist.worksInStore === false ? '매장X' : ''}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[11px] text-gray-300 mt-1">미설정</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-300 inline-block" /> 이번달</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-300 inline-block" /> 향후 (예정)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> 과거 (지급됨)</span>
            </div>
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────── */}
      {/* 투자이력 추가 / 수정 모달                               */}
      {/* ─────────────────────────────────────────────────────── */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">
                  {editingHistory ? '✏️ 투자 이력 수정' : '➕ 투자 이력 추가'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {editingHistory
                    ? '기존 이력의 내용을 변경합니다.'
                    : '증액·감액 등 변경 시 다음달 1일을 시작일로 설정하세요.'}
                </p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            <div className="p-6 space-y-4">
              {/* 투자금액 */}
              <div>
                <label className={labelCls}>투자금액 (만원) *</label>
                <div className="grid grid-cols-4 gap-2">
                  {INVESTMENT_OPTIONS.map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setHistoryForm({ ...historyForm, investmentAmount: String(v) })}
                      className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        historyForm.investmentAmount === String(v)
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                      }`}
                    >
                      {v / 1000}천
                    </button>
                  ))}
                </div>
                {historyForm.investmentAmount && (
                  <p className="text-xs text-indigo-500 mt-1 font-medium">
                    선택: {parseInt(historyForm.investmentAmount).toLocaleString()}만원
                  </p>
                )}
              </div>

              {/* 매장 근무 여부 */}
              <div>
                <label className={labelCls}>매장 근무 여부</label>
                <div className="grid grid-cols-3 gap-2">
                  {([['', '선택 안 함'], ['true', '🏪 매장 근무'], ['false', '🏠 비근무']] as Array<[string, string]>).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setHistoryForm({ ...historyForm, worksInStore: val })}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                        historyForm.worksInStore === val
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 적용 시작일 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={labelCls}>적용 시작일 *</label>
                  {!editingHistory && (
                    <button
                      type="button"
                      onClick={() => setHistoryForm({ ...historyForm, startDate: nextMonthFirst() })}
                      className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold"
                    >
                      📅 다음달 1일로 설정
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  value={historyForm.startDate}
                  onChange={e => setHistoryForm({ ...historyForm, startDate: e.target.value })}
                  className={inputCls}
                />
                {!editingHistory && historyForm.startDate && (
                  <p className="text-xs text-gray-400 mt-1">
                    ※ 이전 기록은 <span className="font-semibold text-gray-600">{
                      historyForm.startDate
                        ? format(addDays(new Date(historyForm.startDate), -1), 'yyyy년 M월 d일')
                        : ''
                    }</span>까지 적용됩니다.
                  </p>
                )}
              </div>

              {/* 변경 사유 */}
              <div>
                <label className={labelCls}>변경 사유 (선택)</label>
                <input
                  value={historyForm.notes}
                  onChange={e => setHistoryForm({ ...historyForm, notes: e.target.value })}
                  placeholder="예) 증액: 1,000만 → 2,000만원"
                  className={inputCls}
                />
              </div>

              {!editingHistory && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 leading-relaxed">
                  ⚠️ <strong>이번달 유지, 다음달 변경</strong>을 원하면<br />
                  적용 시작일을 <strong>다음달 1일</strong>로 설정하세요.<br />
                  이전 기록 종료일은 시작일 하루 전으로 자동 처리됩니다.
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowHistoryModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">취소</button>
              <button
                onClick={handleSaveHistory}
                className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                {editingHistory ? '수정 저장' : '이력 추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
