import { useState, useEffect } from 'react';
import api from '../../lib/axios';

interface PayrollRecord {
  id: number;
  amount: number;
  baseAmount: number;
  deduction: number;
  periodStart: string;
  periodEnd: string;
  status: string;
  user: {
    name: string;
    type: string;
    bank: string | null;
    accountNumber: string | null;
  };
}

interface JobType {
  id: number;
  name: string;
  baseSalary: number;
  requiresAttendance: boolean;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:  { label: '대기',   color: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: '승인됨', color: 'bg-blue-100 text-blue-700' },
  PAID:     { label: '지급완료', color: 'bg-emerald-100 text-emerald-700' },
};

export default function SalaryStatus() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [filterType, setFilterType] = useState('전체');
  const [filterStatus, setFilterStatus] = useState('전체');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/payroll'),
      api.get('/job-types'),
    ]).then(([payRes, jtRes]) => {
      setRecords(payRes.data);
      setJobTypes(jtRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const typeNames = ['전체', ...Array.from(new Set(records.map(r => r.user.type).filter(Boolean)))];
  const statusNames = ['전체', ...Object.keys(STATUS_MAP)];

  const filtered = records.filter(r => {
    const typeOk = filterType === '전체' || r.user.type === filterType;
    const statusOk = filterStatus === '전체' || r.status === filterStatus;
    return typeOk && statusOk;
  });

  const totalPaid   = records.filter(r => r.status === 'PAID').reduce((s, r) => s + r.amount, 0);
  const totalPending = records.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.amount, 0);
  const totalDeduction = records.reduce((s, r) => s + (r.deduction || 0), 0);

  const fmt = (v: number) => v.toLocaleString() + '원';

  const jtMap = new Map(jobTypes.map(jt => [jt.name, jt]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">급여 현황</h1>
        <p className="text-sm text-gray-400 mt-1">급여 산정 이력과 직군별 차감 내역을 확인합니다.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: '전체 지급 건수', value: `${records.length}건`, color: 'text-gray-800', bg: 'bg-white' },
          { label: '지급 완료액', value: fmt(totalPaid), color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: '대기 중 금액', value: fmt(totalPending), color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: '총 차감액 (미달)', value: fmt(totalDeduction), color: 'text-red-600', bg: 'bg-red-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-gray-100 px-5 py-4 shadow-sm`}>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-gray-400 self-center">직군</span>
          {typeNames.map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${filterType === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-gray-200" />
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-gray-400 self-center">상태</span>
          {statusNames.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${filterStatus === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              {s === '전체' ? '전체' : (STATUS_MAP[s]?.label ?? s)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-sm">데이터 불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            조회된 급여 내역이 없습니다. 먼저 급여 산정을 실행해 주세요.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">직원 / 직군</th>
                <th className="px-5 py-3 text-left">기간</th>
                <th className="px-5 py-3 text-right">기본급</th>
                <th className="px-5 py-3 text-right text-red-400">차감액 (미달)</th>
                <th className="px-5 py-3 text-right text-emerald-600">실 지급액</th>
                <th className="px-5 py-3 text-left">계좌</th>
                <th className="px-5 py-3 text-center">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(r => {
                const jt = jtMap.get(r.user.type);
                return (
                  <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">{r.user.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{r.user.type || '-'}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      <div>{new Date(r.periodStart).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</div>
                      <div className="text-gray-300">~</div>
                      <div>{new Date(r.periodEnd).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</div>
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-gray-600 font-medium">
                      {fmt(r.baseAmount ?? r.amount)}
                    </td>
                    <td className="px-5 py-4 text-right text-sm">
                      {(r.deduction ?? 0) > 0 ? (
                        <span className="text-red-500 font-semibold">- {fmt(r.deduction)}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-base font-bold text-emerald-600">{fmt(r.amount)}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {r.user.bank ? (
                        <>
                          <div>{r.user.bank}</div>
                          <div className="text-gray-400">{r.user.accountNumber}</div>
                        </>
                      ) : (
                        <span className="text-gray-300">미등록</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_MAP[r.status]?.color ?? 'bg-gray-100 text-gray-500'}`}>
                        {STATUS_MAP[r.status]?.label ?? r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm">
        <div className="font-semibold text-gray-700 mb-3">급여 계산 방식 안내</div>
        <div className="space-y-1.5 text-gray-500">
          <div>• <strong className="text-gray-700">강의 참여 필요 직군</strong>: 월 기본급 기준, 4회 참석 미달 시 회당 단가만큼 자동 차감</div>
          <div>• <strong className="text-gray-700">선지급 활성 직군</strong>: 첫 달 1회 이상 참석 시 전액 선지급, 부족분은 해당 달에 차감됨</div>
          <div>• <strong className="text-gray-700">강의 참여 불필요 직군</strong>: 출석과 무관하게 설정된 월 고정액 지급</div>
        </div>
      </div>
    </div>
  );
}
