import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';

interface JobType {
  id: number;
  name: string;
  hasInvestmentTiers: boolean;
  hasCustomFields: boolean;
  requiresAttendance: boolean;
  investmentTiers: { id: number; investmentAmount: number; worksInStore: boolean; salary: number }[];
  customFields: { id: number; fieldName: string; fieldType: string; placeholder: string | null; isRequired: boolean }[];
}

export default function Signup() {
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<number, string>>({});
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    church: '', bank: '', accountNumber: '',
    investmentAmount: '', worksInStore: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/job-types').then(res => setJobTypes(res.data)).catch(console.error);
  }, []);

  const hasInvestmentJobType = selectedTypes.some(t => {
    const jt = jobTypes.find(j => j.name === t);
    return jt?.hasInvestmentTiers;
  });

  const toggleType = (name: string) => {
    setSelectedTypes(prev =>
      prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTypes.length === 0) {
      alert('직군을 최소 1개 이상 선택해 주세요.');
      return;
    }
    try {
      const res = await api.post('/auth/register', {
        ...formData,
        types: selectedTypes,
        type: selectedTypes[0],
        investmentAmount: hasInvestmentJobType && formData.investmentAmount ? Number(formData.investmentAmount) : null,
        worksInStore: hasInvestmentJobType ? formData.worksInStore === 'true' : null,
      });

      // 커스텀 필드값이 있으면 추가로 저장 (로그인 후 어드민 토큰 필요하므로 현재는 로컬 저장)
      const fieldEntries = Object.entries(customFieldValues).filter(([, v]) => v.trim());
      if (fieldEntries.length > 0 && res.data?.id) {
        // 가입 직후 바로 로그인하여 토큰 획득 후 커스텀필드 저장
        try {
          const loginRes = await api.post('/auth/login', {
            email: formData.email,
            password: formData.password,
          });
          const token = loginRes.data?.access_token;
          if (token) {
            await api.post(
              `/users/${res.data.id}/custom-field-values`,
              { values: fieldEntries.map(([fieldId, value]) => ({ fieldId: parseInt(fieldId), value })) },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        } catch {
          // 커스텀 필드 저장 실패는 무시 (어드민이 나중에 입력 가능)
        }
      }

      alert('회원가입이 완료되었습니다! 로그인해 주세요.');
      navigate('/login');
    } catch (err: any) {
      alert(err.response?.data?.message || '가입에 실패했습니다.');
    }
  };

  const inputCls = 'mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2.5 bg-gray-50 text-sm focus:border-indigo-400 focus:outline-none focus:bg-white transition';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-2xl w-full bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold mx-auto mb-3">LB</div>
          <h2 className="text-2xl font-extrabold text-gray-900">직원 가입 신청</h2>
          <p className="mt-1 text-sm text-gray-500">사내 포털 사용을 위한 정보를 등록해 주세요.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          {/* 기본 정보 */}
          <div>
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600">이름 *</label>
                <input name="name" required onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">연락처 (- 제외)</label>
                <input name="phone" onChange={handleChange} placeholder="01012345678" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">아이디 (이메일) *</label>
                <input name="email" type="email" required onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">비밀번호 *</label>
                <input name="password" type="password" required onChange={handleChange} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600">거점교회 / 소속</label>
                <input name="church" onChange={handleChange} placeholder="선택사항" className={inputCls} />
              </div>
            </div>
          </div>

          {/* 직군 선택 (다중) */}
          <div>
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">
              직군 선택 * <span className="text-gray-400 font-normal normal-case">(투잡인 경우 여러 개 선택 가능)</span>
            </h3>
            {jobTypes.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-xl">
                등록된 직군이 없습니다. 관리자에게 문의해 주세요.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {jobTypes.map(jt => (
                  <button
                    key={jt.id}
                    type="button"
                    onClick={() => toggleType(jt.name)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium text-left border transition-all ${
                      selectedTypes.includes(jt.name)
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    <span className="mr-1.5">{selectedTypes.includes(jt.name) ? '✓' : '○'}</span>
                    {jt.name}
                  </button>
                ))}
              </div>
            )}
            {selectedTypes.length > 0 && (
              <p className="mt-2 text-xs text-indigo-600 font-medium">
                선택된 직군: {selectedTypes.join(', ')}
              </p>
            )}
          </div>

          {/* 투자 티어 (주인형 점주 등) */}
          {hasInvestmentJobType && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                📊 투자 정보 (주인형 점주 해당)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600">투자금액 (만원)</label>
                  <select name="investmentAmount" value={formData.investmentAmount} onChange={handleChange}
                    className={inputCls}>
                    <option value="">선택</option>
                    <option value="1000">1,000만원</option>
                    <option value="2000">2,000만원</option>
                    <option value="3000">3,000만원</option>
                    <option value="6000">6,000만원</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">매장 근무 여부</label>
                  <select name="worksInStore" value={formData.worksInStore} onChange={handleChange}
                    className={inputCls}>
                    <option value="">선택</option>
                    <option value="true">매장 근무함</option>
                    <option value="false">매장 근무 안 함</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 선택된 직군의 커스텀 필드 (특수 설정) */}
          {(() => {
            const activeFields = selectedTypes.flatMap(typeName => {
              const jt = jobTypes.find(j => j.name === typeName);
              if (!jt?.hasCustomFields || !jt.customFields?.length) return [];
              return jt.customFields.map(f => ({ ...f, jobTypeName: typeName }));
            });
            if (activeFields.length === 0) return null;
            return (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                  📋 추가 정보 입력 (직군별 필수/선택 항목)
                </h3>
                <div className="space-y-3">
                  {activeFields.map(f => {
                    const opts = f.fieldType === 'select' && f.placeholder
                      ? f.placeholder.split('|').filter(Boolean)
                      : [];
                    return (
                      <div key={f.id}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {f.fieldName} <span className="text-gray-400 font-normal">({f.jobTypeName})</span>
                          {f.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {f.fieldType === 'select' ? (
                          <select
                            value={customFieldValues[f.id] || ''}
                            onChange={e => setCustomFieldValues(prev => ({ ...prev, [f.id]: e.target.value }))}
                            required={f.isRequired}
                            className={inputCls}
                          >
                            <option value="">선택해 주세요</option>
                            {opts.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={f.fieldType === 'number' ? 'number' : f.fieldType === 'date' ? 'date' : 'text'}
                            value={customFieldValues[f.id] || ''}
                            onChange={e => setCustomFieldValues(prev => ({ ...prev, [f.id]: e.target.value }))}
                            placeholder={f.placeholder || ''}
                            required={f.isRequired}
                            className={inputCls}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* 계좌 정보 */}
          <div>
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">계좌 정보 (급여 지급용)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600">은행명</label>
                <input name="bank" onChange={handleChange} placeholder="예: 국민은행" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">계좌번호</label>
                <input name="accountNumber" onChange={handleChange} className={inputCls} />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={() => navigate('/login')}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 bg-white hover:bg-gray-50 text-sm font-medium transition">
              돌아가기
            </button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold shadow transition">
              가입 완료하기
            </button>
          </div>

          <p className="text-center text-xs text-gray-400">
            이미 계정이 있으신가요? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">로그인</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
