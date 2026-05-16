// 등급별 성과수당 비율 및 보조금 계산 유틸리티
// 모든 등급 기준: 순매출 200만원 = 1건 인정

export interface GradeResult {
  grade: string;
  performanceRate: number; // 소수점 비율 (예: 0.20)
  subsidy: number;         // 보조금 (원)
}

// ─────────────────────────────────────────────────
// 수학의 띠 — 띠 등급 (1띠~12띠)
// ─────────────────────────────────────────────────
const DDI_GRADES: Array<{ minCount: number; grade: string; rate: number; subsidy: number }> = [
  { minCount: 12, grade: '12띠', rate: 0.42, subsidy: 1200000 },
  { minCount: 11, grade: '11띠', rate: 0.40, subsidy: 1100000 },
  { minCount: 10, grade: '10띠', rate: 0.38, subsidy: 1000000 },
  { minCount: 9,  grade: '9띠',  rate: 0.36, subsidy: 900000  },
  { minCount: 8,  grade: '8띠',  rate: 0.34, subsidy: 800000  },
  { minCount: 7,  grade: '7띠',  rate: 0.32, subsidy: 700000  },
  { minCount: 6,  grade: '6띠',  rate: 0.30, subsidy: 600000  },
  { minCount: 5,  grade: '5띠',  rate: 0.28, subsidy: 500000  },
  { minCount: 4,  grade: '4띠',  rate: 0.26, subsidy: 400000  },
  { minCount: 3,  grade: '3띠',  rate: 0.24, subsidy: 300000  },
  { minCount: 2,  grade: '2띠',  rate: 0.22, subsidy: 200000  },
  { minCount: 1,  grade: '1띠',  rate: 0.20, subsidy: 100000  },
];

// ─────────────────────────────────────────────────
// 시니어 라스 — S 등급 (1S~5S)
// ─────────────────────────────────────────────────
const SENIOR_GRADES: Array<{ minCount: number; grade: string; rate: number; subsidy: number }> = [
  { minCount: 5, grade: '5S', rate: 0.28, subsidy: 100000 },
  { minCount: 4, grade: '4S', rate: 0.26, subsidy: 100000 },
  { minCount: 3, grade: '3S', rate: 0.24, subsidy: 100000 },
  { minCount: 2, grade: '2S', rate: 0.22, subsidy: 100000 },
  { minCount: 1, grade: '1S', rate: 0.20, subsidy: 100000 },
];

/**
 * 프로젝트명과 유치건수로 달성 등급 계산
 * @param projectName 프로젝트명
 * @param salesCount 당월 유치건수 (순매출 200만원 이상 = 1건)
 */
export function calculateGrade(projectName: string, salesCount: number): GradeResult | null {
  if (salesCount <= 0) return null;

  const isSenior = projectName.includes('시니어') || projectName.toLowerCase().includes('senior');
  const grades = isSenior ? SENIOR_GRADES : DDI_GRADES;

  for (const g of grades) {
    if (salesCount >= g.minCount) {
      return { grade: g.grade, performanceRate: g.rate, subsidy: g.subsidy };
    }
  }
  return null;
}

/**
 * 순매출 합계로 유치건수 계산 (200만원 = 1건)
 * @param netSalesTotal 순매출 합계 (원)
 */
export function calcSalesCount(netSalesTotal: number): number {
  return Math.floor(netSalesTotal / 2000000);
}

/**
 * 3.3% 원천징수 세후 실수령액 계산
 * @param grossAmount 세전 발생액
 */
export function calcNetAmount(grossAmount: number): number {
  return Math.floor(grossAmount * (1 - 0.033));
}

/**
 * 카드 수수료 계산 (카드: 2.5%, 현금: 0원)
 * @param actualAmount 실결제금액
 * @param paymentMethod 'CARD' | 'CASH'
 */
export function calcDeductedFee(actualAmount: number, paymentMethod: string): number {
  if (paymentMethod === 'CARD') {
    return Math.floor(actualAmount * 0.025);
  }
  return 0;
}

/**
 * 지급 예정일 계산 (isStoreOwner → 익익월 말일, 일반 → 익월 말일)
 * @param baseDate 기준일 (정산월의 마지막 날)
 * @param isStoreOwner 주인형 점주 여부
 */
export function calcPaymentDueDate(settlementMonth: string, isStoreOwner: boolean): Date {
  const [year, month] = settlementMonth.split('-').map(Number);
  const monthOffset = isStoreOwner ? 2 : 1;
  const targetMonth = month + monthOffset;
  const targetYear = year + Math.floor((targetMonth - 1) / 12);
  const normalizedMonth = ((targetMonth - 1) % 12) + 1;
  // 해당 월의 마지막 날
  const lastDay = new Date(targetYear, normalizedMonth, 0);
  return lastDay;
}

/**
 * 계약 시작일 기준 영업 주차 계산
 * @param contractStart 계약 시작일
 * @param targetDate 기준일
 */
export function calcSalesWeek(contractStart: Date, targetDate: Date): number {
  const diffMs = targetDate.getTime() - contractStart.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}
