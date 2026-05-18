import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { format } from 'date-fns';

function fmt(n: number) { return `${n.toLocaleString('ko-KR')}원`; }

function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return <span style={{ fontSize: '12px', color: '#94A3B8' }}>미달성</span>;
  const level = parseInt(grade);
  const intensity = Math.min(Math.floor(level / 3), 4);
  const colors = [
    { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
    { bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE' },
    { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },
    { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
    { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  ];
  const c = colors[intensity];
  return (
    <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '20px', fontWeight: 700, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {grade}
    </span>
  );
}

const card: React.CSSProperties = {
  background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0',
  padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

export default function AdminMonthlyCommissions() {
  const { selectedProjectId } = useAuthStore();
  const [commissions, setCommissions] = useState<any[]>([]);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/monthly-commissions?projectId=${selectedProjectId}&month=${month}`);
      setCommissions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (selectedProjectId) load(); }, [selectedProjectId, month]);

  const handleCalcAll = async () => {
    if (!confirm(`${month} 월 전체 성과급을 계산하시겠습니까?`)) return;
    setCalcLoading(true);
    try {
      await api.post('/monthly-commissions/calculate-project', { projectId: selectedProjectId, settlementMonth: month });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || '계산 실패');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleExtract = async () => {
    try {
      const { data } = await api.get(`/monthly-commissions/payout?projectId=${selectedProjectId}&month=${month}`);
      const text = data.lines.join('\n');
      if (text) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        alert('추출할 지급 대상이 없습니다.');
      }
    } catch {
      alert('추출 실패');
    }
  };

  const handleStatusToggle = async (id: number, current: string) => {
    await api.patch(`/monthly-commissions/${id}/status`, { status: current === 'PAID' ? 'PENDING' : 'PAID' });
    load();
  };

  const totalNet = commissions.reduce((a, c) => a + c.netAmount, 0);
  const totalGross = commissions.reduce((a, c) => a + c.totalGross, 0);

  return (
    <div style={{ padding: '28px', background: '#F8FAFC', minHeight: '100%' }}>

      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0 }}>월간 성과급</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>순매출 기준 등급 자동 산정 (200만원 = 1건)</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#0F172A', background: '#fff', cursor: 'pointer' }} />
          <button onClick={handleCalcAll} disabled={calcLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#1F4E79', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {calcLoading ? '⏳ 계산 중...' : '🔄 전체 재계산'}
          </button>
          <button onClick={handleExtract}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: copied ? '#16A34A' : '#F59E0B', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {copied ? '✅ 복사 완료!' : '📋 원터치 이체 추출'}
          </button>
        </div>
      </div>

      {/* 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: '세전 총발생액', value: fmt(totalGross), color: '#1F4E79' },
          { label: '세후 실수령액', value: fmt(totalNet), color: '#16A34A', sub: '3.3% 원천징수 후' },
          { label: '정산 대상', value: `${commissions.filter(c => c.totalGross > 0).length}명`, color: '#7C3AED' },
          { label: '지급 완료', value: `${commissions.filter(c => c.paymentStatus === 'PAID').length}명`, color: '#D97706' },
        ].map((item, i) => (
          <div key={i} style={card}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: item.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{item.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A' }}>{item.value}</div>
            {item.sub && <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>{item.sub}</div>}
          </div>
        ))}
      </div>

      {/* 이체 포맷 */}
      <div style={{ ...card, border: '1px solid #FDE68A', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#D97706' }}>📋 경영진 보고용 이체 포맷</span>
          <span style={{ fontSize: '11px', color: '#94A3B8' }}>이름 / 세후 실수령액 / 은행명 계좌번호 (예금주)</span>
        </div>
        <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '14px', maxHeight: '140px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', color: '#374151' }}>
          {commissions.filter(c => c.totalGross > 0 && c.paymentStatus === 'PENDING').map((c) => (
            <div key={c.id} style={{ marginBottom: '4px' }}>
              {c.employee?.name} / {c.netAmount.toLocaleString('ko-KR')}원 / {c.employee?.bank || '-'} {c.employee?.accountNumber || '-'} ({c.employee?.accountHolder || c.employee?.name})
            </div>
          ))}
          {commissions.filter(c => c.totalGross > 0 && c.paymentStatus === 'PENDING').length === 0 && (
            <div style={{ color: '#94A3B8' }}>지급 대기 중인 항목 없음 · 전체 재계산 후 확인하세요</div>
          )}
        </div>
      </div>

      {/* 테이블 */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['이름', '유치건수', '순매출 합계', '등급', '성과수당', '보조금', '세전 총액', '세후 실수령액', '지급예정일', '지급상태'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>로딩 중...</td></tr>
              ) : commissions.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>🏆</div>
                  <div style={{ fontSize: '14px' }}>전체 재계산 버튼을 클릭하여 성과급을 산정하세요</div>
                </td></tr>
              ) : (
                commissions.map((c, idx) => (
                  <tr key={c.id}
                    style={{ borderBottom: idx < commissions.length - 1 ? '1px solid #F1F5F9' : 'none', opacity: c.totalGross === 0 ? 0.45 : 1 }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{c.employee?.name}</div>
                      {c.employee?.isStoreOwner && <div style={{ fontSize: '11px', color: '#D97706', marginTop: '2px' }}>🏪 지급 지연</div>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{c.salesCount}건</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{fmt(c.netSalesTotal)}</td>
                    <td style={{ padding: '12px 16px' }}><GradeBadge grade={c.achievementGrade} /></td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{c.performanceBonus > 0 ? fmt(c.performanceBonus) : '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{c.subsidy > 0 ? fmt(c.subsidy) : '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{fmt(c.totalGross)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#1F4E79' }}>{fmt(c.netAmount)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748B' }}>
                      {c.firstPaymentDue ? format(new Date(c.firstPaymentDue), 'yyyy.MM.dd') : '-'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => handleStatusToggle(c.id, c.paymentStatus)}
                        disabled={c.totalGross === 0}
                        style={{
                          fontSize: '12px', padding: '5px 12px', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: c.totalGross === 0 ? 'not-allowed' : 'pointer',
                          background: c.paymentStatus === 'PAID' ? '#16A34A' : c.totalGross === 0 ? '#F1F5F9' : '#EFF6FF',
                          color: c.paymentStatus === 'PAID' ? '#fff' : c.totalGross === 0 ? '#94A3B8' : '#1D4ED8',
                        }}
                      >
                        {c.paymentStatus === 'PAID' ? '지급완료' : '지급 처리'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
