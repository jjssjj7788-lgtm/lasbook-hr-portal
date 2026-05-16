import { useEffect, useState } from 'react';
import api from '../../lib/axios';

interface JobType {
  id: number;
  name: string;
  requiresAttendance: boolean;
  hasInvestmentTiers: boolean;
  hasCustomFields: boolean;
  paymentDay: number | null;
  baseSalary: number;
  perSessionRate: number | null;
  isPrepaidFirstMonth: boolean;
  investmentTiers: { id: number; investmentAmount: number; worksInStore: boolean; salary: number }[];
  customFields: { id: number; fieldName: string; fieldType: string; placeholder: string | null; isRequired: boolean }[];
}

const EMPTY_FORM = {
  name: '',
  requiresAttendance: true,
  hasCustomFields: false,
  paymentDay: '',
  baseSalary: '',
  perSessionRate: '',
  isPrepaidFirstMonth: false,
};

export default function JobTypes() {
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [editTarget, setEditTarget] = useState<JobType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<JobType | null>(null);
  // 커스텀 필드 관리
  const [viewFieldsTarget, setViewFieldsTarget] = useState<JobType | null>(null);
  const [newField, setNewField] = useState<{
    fieldName: string;
    fieldType: string;
    placeholder: string;
    isRequired: boolean;
    selectOptions: string[]; // select 타입일 때 선택지 목록
  }>({ fieldName: '', fieldType: 'text', placeholder: '', isRequired: false, selectOptions: [] });
  const [newOptionInput, setNewOptionInput] = useState(''); // 선택지 임시 입력
  const [addingField, setAddingField] = useState(false);

  useEffect(() => {
    fetchJobTypes();
  }, []);

  const fetchJobTypes = () => {
    api.get('/job-types').then((res) => setJobTypes(res.data)).catch(console.error);
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (jt: JobType) => {
    setEditTarget(jt);
    setForm({
      name: jt.name,
      requiresAttendance: jt.requiresAttendance,
      hasCustomFields: jt.hasCustomFields,
      paymentDay: jt.paymentDay != null ? String(jt.paymentDay) : '',
      baseSalary: String(jt.baseSalary),
      perSessionRate: jt.perSessionRate != null ? String(jt.perSessionRate) : '',
      isPrepaidFirstMonth: jt.isPrepaidFirstMonth,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload: any = {
      name: form.name,
      requiresAttendance: form.requiresAttendance,
      hasCustomFields: form.hasCustomFields,
      baseSalary: Number(form.baseSalary),
      isPrepaidFirstMonth: form.isPrepaidFirstMonth,
      paymentDay: form.paymentDay ? Number(form.paymentDay) : null,
      perSessionRate: form.perSessionRate ? Number(form.perSessionRate) : null,
    };
    try {
      if (editTarget) {
        await api.patch(`/job-types/${editTarget.id}`, payload);
      } else {
        await api.post('/job-types', payload);
      }
      setShowForm(false);
      fetchJobTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/job-types/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchJobTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || '삭제 실패');
    }
  };

  const handleAddField = async () => {
    if (!viewFieldsTarget || !newField.fieldName) { alert('필드 이름을 입력해 주세요.'); return; }
    if (newField.fieldType === 'select' && newField.selectOptions.length < 2) {
      alert('선택 타입은 선택지를 2개 이상 추가해 주세요.');
      return;
    }
    setAddingField(true);
    try {
      // select 타입이면 placeholder에 선택지를 '|' 구분자로 저장
      const placeholderVal = newField.fieldType === 'select'
        ? newField.selectOptions.join('|')
        : newField.placeholder;

      await api.post(`/job-types/${viewFieldsTarget.id}/custom-fields`, {
        fieldName: newField.fieldName,
        fieldType: newField.fieldType,
        placeholder: placeholderVal,
        isRequired: newField.isRequired,
        sortOrder: viewFieldsTarget.customFields.length,
      });
      setNewField({ fieldName: '', fieldType: 'text', placeholder: '', isRequired: false, selectOptions: [] });
      setNewOptionInput('');
      fetchJobTypes();
      const res = await api.get('/job-types');
      const updated = res.data.find((j: JobType) => j.id === viewFieldsTarget.id);
      if (updated) setViewFieldsTarget(updated);
    } catch (err: any) { alert(err.response?.data?.message || '추가 실패'); }
    finally { setAddingField(false); }
  };

  // 선택지 추가
  const handleAddOption = () => {
    const val = newOptionInput.trim();
    if (!val) return;
    if (newField.selectOptions.includes(val)) { alert('이미 있는 선택지입니다.'); return; }
    setNewField(prev => ({ ...prev, selectOptions: [...prev.selectOptions, val] }));
    setNewOptionInput('');
  };

  // 선택지 삭제
  const handleRemoveOption = (opt: string) => {
    setNewField(prev => ({ ...prev, selectOptions: prev.selectOptions.filter(o => o !== opt) }));
  };

  // select 타입의 선택지 파싱 (placeholder에 '|'로 저장됨)
  const parseSelectOptions = (placeholder: string | null): string[] => {
    if (!placeholder) return [];
    return placeholder.split('|').filter(Boolean);
  };

  const handleDeleteField = async (fieldId: number) => {
    if (!confirm('이 필드를 삭제하시겠습니까?')) return;
    await api.delete(`/job-types/custom-fields/${fieldId}`);
    const res = await api.get('/job-types');
    setJobTypes(res.data);
    if (viewFieldsTarget) {
      const updated = res.data.find((j: JobType) => j.id === viewFieldsTarget.id);
      if (updated) setViewFieldsTarget(updated);
    }
  };

  const formatMoney = (v: number) => v.toLocaleString() + '원';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">직군(구분) 관리</h1>
          <p className="text-gray-400 text-sm mt-1">직군별 급여 규칙을 설정합니다. 설정된 직군은 직원 등록 및 급여 계산과 자동 연동됩니다.</p>
        </div>
        <button
          id="btn-add-jobtype"
          onClick={openCreate}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow"
        >
          + 직군 추가
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {jobTypes.map((jt) => (
          <div key={jt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">{jt.name}</h2>
                <span
                  className={`inline-flex mt-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                    jt.requiresAttendance
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {jt.requiresAttendance ? '강의 참여 필수' : '강의 참여 불필요'}
                </span>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => openEdit(jt)}
                  className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  수정
                </button>
                {jt.hasCustomFields && (
                  <button
                    onClick={() => setViewFieldsTarget(jt)}
                    className="px-2.5 py-1 text-xs border border-purple-100 rounded-lg text-purple-600 hover:bg-purple-50"
                  >
                    📋 필드
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(jt)}
                  className="px-2.5 py-1 text-xs border border-red-100 rounded-lg text-red-500 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-gray-50 pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">월 기본급</span>
                <span className="font-semibold text-gray-800">{formatMoney(jt.baseSalary)}</span>
              </div>
              {jt.requiresAttendance ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">1회 참석 단가</span>
                    <span className="font-semibold text-gray-800">
                      {jt.perSessionRate != null ? formatMoney(jt.perSessionRate) : '기본급 ÷ 4'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">자동 차감 여부</span>
                    <span className="font-semibold text-gray-800">월 4회 기준 미달 차감</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">첫 달 선지급</span>
                    <span className={`font-semibold ${jt.isPrepaidFirstMonth ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {jt.isPrepaidFirstMonth ? '✓ 활성화' : '비활성'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-gray-500">지급일</span>
                  <span className="font-semibold text-gray-800">
                    {jt.paymentDay != null ? `매월 ${jt.paymentDay}일` : '-'}
                  </span>
                </div>
              )}
            </div>
            {/* 커스텀 필드 목록 미리보기 */}
            {jt.hasCustomFields && jt.customFields.length > 0 && (
              <div className="border-t border-gray-50 pt-2">
                <p className="text-xs text-purple-500 font-semibold mb-1.5">📋 추가 입력 필드</p>
                <div className="space-y-0.5">
                  {jt.customFields.map(f => (
                    <div key={f.id} className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                      {f.fieldName} {f.isRequired && <span className="text-red-400">*</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {jobTypes.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            등록된 직군이 없습니다. 직군을 먼저 추가해 주세요.
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                {editTarget ? `직군 수정 — ${editTarget.name}` : '새 직군 추가'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* 직군명 */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">직군명 *</label>
                <input
                  id="input-jobtype-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="예: 교육선교사"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
                />
              </div>

              {/* 강의 참여 여부 토글 */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">강의 참여 필요 여부 *</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setForm({ ...form, requiresAttendance: true })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.requiresAttendance
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    필요
                  </button>
                  <button
                    onClick={() => setForm({ ...form, requiresAttendance: false })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      !form.requiresAttendance
                        ? 'bg-gray-600 text-white border-gray-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    불필요 (고정 지급)
                  </button>
                </div>
              </div>

              {/* 강의 참여 불필요 시 */}
              {!form.requiresAttendance && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">월 지급일 (일)</label>
                  <input
                    id="input-payment-day"
                    type="number"
                    min={1}
                    max={31}
                    value={form.paymentDay}
                    onChange={(e) => setForm({ ...form, paymentDay: e.target.value })}
                    placeholder="예: 25"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
              )}

              {/* 월 기본급 */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  {form.requiresAttendance ? '월 기본급 (원) *' : '월 지급액 (원) *'}
                </label>
                <input
                  id="input-base-salary"
                  type="number"
                  value={form.baseSalary}
                  onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
                  placeholder="예: 800000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
                />
                {form.baseSalary && (
                  <p className="text-xs text-indigo-500 mt-1">
                    = {Number(form.baseSalary).toLocaleString()}원
                    {form.requiresAttendance && ` (1회당 ${Math.floor(Number(form.baseSalary) / 4).toLocaleString()}원)`}
                  </p>
                )}
              </div>

              {/* 강의 참여 필요 시 추가 옵션 */}
              {form.requiresAttendance && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      1회 참석 단가 (원) — 빈칸 시 기본급 ÷ 4 자동 적용
                    </label>
                    <input
                      id="input-per-session-rate"
                      type="number"
                      value={form.perSessionRate}
                      onChange={(e) => setForm({ ...form, perSessionRate: e.target.value })}
                      placeholder={
                        form.baseSalary
                          ? `자동: ${Math.floor(Number(form.baseSalary) / 4).toLocaleString()}원`
                          : '예: 200000'
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">첫 달 선지급 여부</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setForm({ ...form, isPrepaidFirstMonth: true })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          form.isPrepaidFirstMonth
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        활성화 (첫 교육일 선지급)
                      </button>
                      <button
                        onClick={() => setForm({ ...form, isPrepaidFirstMonth: false })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          !form.isPrepaidFirstMonth
                            ? 'bg-gray-600 text-white border-gray-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        비활성 (참석 후 정산)
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      활성화 시: 첫 참석 달에는 1회만 참석해도 월급 전액을 선지급하고, 미달 횟수만큼 다음 달부터 차감합니다.
                    </p>
                  </div>
                </>
              )}

              {/* 특수 설정: 커스텀 추가 필드 */}
              <div className="border border-purple-100 rounded-xl p-4 bg-purple-50/40">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">📋 특수 설정 — 추가 입력 필드</p>
                    <p className="text-xs text-gray-400 mt-0.5">예: 먼저 가입 후 해당 직군 선택 시 입력할 추가 정보 항목</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, hasCustomFields: !form.hasCustomFields })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.hasCustomFields ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.hasCustomFields ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                {form.hasCustomFields && (
                  <p className="text-xs text-purple-600 font-medium">✓ 활성화 — 저장 후 해당 직군 카드에서 [필드] 버튼으로 필드를 추가하세요.</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                id="btn-save-jobtype"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 font-semibold"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">직군 삭제</h3>
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-semibold text-gray-700">'{deleteTarget.name}'</span> 직군을 삭제합니다.
              해당 직군으로 지정된 직원이 있으면 삭제할 수 없습니다.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 커스텀 필드 관리 모달 */}
      {viewFieldsTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-gray-900">📋 추가 입력 필드 — {viewFieldsTarget.name}</h2>
                <p className="text-xs text-gray-400 mt-0.5">회원가입 시 이 직군 선택하면 나타나는 입력 항목</p>
              </div>
              <button onClick={() => setViewFieldsTarget(null)} className="text-gray-400 text-xl">×</button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* 기존 필드 목록 */}
              {viewFieldsTarget.customFields.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-4">등록된 필드가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {viewFieldsTarget.customFields.map((f, idx) => (
                    <div key={f.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium">{idx + 1}</span>
                            <span className="text-sm font-medium text-gray-800">{f.fieldName}</span>
                            {f.isRequired && <span className="text-xs text-red-400">*필수</span>}
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              f.fieldType === 'select' ? 'bg-blue-100 text-blue-600'
                              : f.fieldType === 'date' ? 'bg-emerald-100 text-emerald-600'
                              : f.fieldType === 'number' ? 'bg-amber-100 text-amber-600'
                              : 'bg-gray-100 text-gray-500'
                            }`}>
                              {f.fieldType === 'select' ? '선택' : f.fieldType === 'date' ? '날짜' : f.fieldType === 'number' ? '숫자' : '텍스트'}
                            </span>
                          </div>
                          {/* select 타입: 선택지 표시 */}
                          {f.fieldType === 'select' && f.placeholder && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {parseSelectOptions(f.placeholder).map(opt => (
                                <span key={opt} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">{opt}</span>
                              ))}
                            </div>
                          )}
                          {/* 텍스트/숫자/날짜: 힌트 표시 */}
                          {f.fieldType !== 'select' && f.placeholder && (
                            <p className="text-xs text-gray-300 mt-0.5">힌트: {f.placeholder}</p>
                          )}
                        </div>
                        <button onClick={() => handleDeleteField(f.id)} className="text-red-400 hover:text-red-600 text-xs px-2 py-1 flex-shrink-0">삭제</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 새 필드 추가 */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500">+ 새 필드 추가</p>
                <div className="space-y-3">
                  {/* 필드 이름 */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">필드 이름(주제) *</label>
                    <input
                      value={newField.fieldName}
                      onChange={e => setNewField({ ...newField, fieldName: e.target.value })}
                      placeholder="예) 담당 지역, 시작일, 동행인 이름"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400"
                    />
                  </div>

                  {/* 입력 타입 선택 */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">입력 타입</label>
                    <div className="grid grid-cols-4 gap-2">
                      {([['text', '텍스트', '📝'], ['number', '숫자', '🔢'], ['date', '날짜', '📅'], ['select', '선택', '☑️']] as [string, string, string][]).map(([val, label, icon]) => (
                        <button key={val} type="button"
                          onClick={() => {
                            setNewField({ ...newField, fieldType: val, selectOptions: [], placeholder: '' });
                            setNewOptionInput('');
                          }}
                          className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                            newField.fieldType === val
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          {icon} {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* select 타입: 선택지 추가 */}
                  {newField.fieldType === 'select' && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-2">
                      <label className="block text-xs font-semibold text-blue-700">☑️ 선택지 항목 *</label>
                      <div className="flex gap-2">
                        <input
                          value={newOptionInput}
                          onChange={e => setNewOptionInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddOption(); } }}
                          placeholder="예) 서울, 경기, 수도권"
                          className="flex-1 border border-blue-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400 bg-white"
                        />
                        <button type="button" onClick={handleAddOption}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition">
                          + 추가
                        </button>
                      </div>
                      {newField.selectOptions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {newField.selectOptions.map(opt => (
                            <span key={opt} className="inline-flex items-center gap-1 bg-white text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-200 font-medium">
                              {opt}
                              <button type="button" onClick={() => handleRemoveOption(opt)}
                                className="text-blue-300 hover:text-red-500 font-bold leading-none">×</button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-blue-400">선택지를 2개 이상 추가해 주세요.</p>
                      )}
                    </div>
                  )}

                  {/* 텍스트/숫자/날짜: 힌트 텍스트 */}
                  {newField.fieldType !== 'select' && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">힌트 텍스트 (선택)</label>
                      <input value={newField.placeholder}
                        onChange={e => setNewField({ ...newField, placeholder: e.target.value })}
                        placeholder={newField.fieldType === 'date' ? '예) 2024-01-01' : newField.fieldType === 'number' ? '예) 1000' : '예) 홍길동'}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" />
                    </div>
                  )}

                  {/* 필수 여부 */}
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="field-required" checked={newField.isRequired}
                      onChange={e => setNewField({ ...newField, isRequired: e.target.checked })} className="rounded" />
                    <label htmlFor="field-required" className="text-sm text-gray-600">필수 입력 항목으로 지정</label>
                  </div>
                </div>

                <button onClick={handleAddField} disabled={addingField || !newField.fieldName} className="w-full py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-60 transition">
                  {addingField ? '추가 중...' : '필드 추가'}
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 text-right">
              <button onClick={() => setViewFieldsTarget(null)} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
