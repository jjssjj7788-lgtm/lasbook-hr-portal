import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function PayrollManager() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const now = new Date();
  const start = startOfMonth(subMonths(now, 1));
  const end = endOfMonth(subMonths(now, 1));

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = () => {
    api.get('/payroll').then(res => setPayrolls(res.data)).catch(console.error);
  };

  const handleCalculate = async () => {
    if (!confirm(`지난달 (${format(start, 'yyyy-MM-dd')} ~ ${format(end, 'yyyy-MM-dd')}) 기준으로 일괄 계산을 실행할까요?`)) return;
    setLoading(true);
    try {
      await api.post('/payroll/calculate', { 
        start: start.toISOString(), 
        end: end.toISOString() 
      });
      alert('일괄 계산 완료!');
      fetchPayrolls();
    } catch {
      alert('계산 실패. 확인이 필요합니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="z-10 text-white relative">
          <h1 className="text-3xl font-bold">급여 일괄 정산 시스템</h1>
          <p className="text-gray-300 mt-2">출석 여부와 직군별 규칙을 곱하여 예상 급여를 시뮬레이션합니다.</p>
        </div>
        <button 
          onClick={handleCalculate} 
          disabled={loading}
          className="z-10 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold shadow hover:bg-gray-100 transition whitespace-nowrap"
        >
          {loading ? '계산하는 중...' : '지난달 내역 일괄 정산 실행하기'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
             <tr>
               <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름 / 직군</th>
               <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최종 산출액</th>
               <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">산출 기준 (사유)</th>
               <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계좌 정보</th>
             </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {payrolls.map((p) => (
              <tr key={p.id} className="hover:bg-blue-50/30">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900">{p.user?.name}</div>
                  <div className="text-xs text-gray-500">{p.user?.type}</div>
                </td>
                <td className="px-6 py-4 border-l border-r border-gray-50 align-top">
                   <div className="text-lg font-bold text-brand-600">
                     {p.amount.toLocaleString()}원
                   </div>
                   <div className="text-xs text-gray-400 mt-1 uppercase">{p.status}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed align-top">
                  {p.notes}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500 align-top">
                  <div>{p.user?.bank}</div>
                  <div className="font-mono mt-1">{p.user?.accountNumber || '-'}</div>
                </td>
              </tr>
            ))}
            {payrolls.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-400 text-lg">아직 정산 내역이 없습니다. 일괄 정산을 실행해 주세요.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
