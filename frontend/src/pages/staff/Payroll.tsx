import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { format } from 'date-fns';

export default function StaffPayroll() {
  const [payrolls, setPayrolls] = useState<any[]>([]);

  useEffect(() => {
    api.get('/payroll/my').then(res => setPayrolls(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-8 rounded-2xl shadow-sm text-white">
        <h1 className="text-3xl font-bold">내 급여 명세서</h1>
        <p className="mt-2 text-gray-200">매월 일괄 정산되는 급여 내역 및 산출의 기준을 확인하세요.</p>
      </div>

      <div className="space-y-4">
        {payrolls.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
               <div className="flex items-center gap-2 mb-1">
                 <span className="text-sm font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded">
                   {format(new Date(p.periodStart), 'yyyy년 MM월')}
                 </span>
                 <span className={`text-xs font-bold px-2 py-1 rounded ${p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                   {p.status === 'PENDING' ? '정산 대기/처리중' : '지급 완료'}
                 </span>
               </div>
               <p className="text-gray-500 text-sm mt-2">{p.notes}</p>
             </div>
             
             <div className="text-right">
               <div className="text-xs text-gray-400 uppercase tracking-wide">최종 산출액</div>
               <div className="text-2xl font-bold text-gray-900">{p.amount.toLocaleString()}원</div>
               <div className="text-xs text-gray-400 mt-1">지급일: 정산 완료 시 안내</div>
             </div>
          </div>
        ))}
        {payrolls.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center text-gray-500">
            아직 발행된 급여 명세서가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
