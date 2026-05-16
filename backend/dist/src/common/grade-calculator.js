"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateGrade = calculateGrade;
exports.calcSalesCount = calcSalesCount;
exports.calcNetAmount = calcNetAmount;
exports.calcDeductedFee = calcDeductedFee;
exports.calcPaymentDueDate = calcPaymentDueDate;
exports.calcSalesWeek = calcSalesWeek;
const DDI_GRADES = [
    { minCount: 12, grade: '12띠', rate: 0.42, subsidy: 1200000 },
    { minCount: 11, grade: '11띠', rate: 0.40, subsidy: 1100000 },
    { minCount: 10, grade: '10띠', rate: 0.38, subsidy: 1000000 },
    { minCount: 9, grade: '9띠', rate: 0.36, subsidy: 900000 },
    { minCount: 8, grade: '8띠', rate: 0.34, subsidy: 800000 },
    { minCount: 7, grade: '7띠', rate: 0.32, subsidy: 700000 },
    { minCount: 6, grade: '6띠', rate: 0.30, subsidy: 600000 },
    { minCount: 5, grade: '5띠', rate: 0.28, subsidy: 500000 },
    { minCount: 4, grade: '4띠', rate: 0.26, subsidy: 400000 },
    { minCount: 3, grade: '3띠', rate: 0.24, subsidy: 300000 },
    { minCount: 2, grade: '2띠', rate: 0.22, subsidy: 200000 },
    { minCount: 1, grade: '1띠', rate: 0.20, subsidy: 100000 },
];
const SENIOR_GRADES = [
    { minCount: 5, grade: '5S', rate: 0.28, subsidy: 100000 },
    { minCount: 4, grade: '4S', rate: 0.26, subsidy: 100000 },
    { minCount: 3, grade: '3S', rate: 0.24, subsidy: 100000 },
    { minCount: 2, grade: '2S', rate: 0.22, subsidy: 100000 },
    { minCount: 1, grade: '1S', rate: 0.20, subsidy: 100000 },
];
function calculateGrade(projectName, salesCount) {
    if (salesCount <= 0)
        return null;
    const isSenior = projectName.includes('시니어') || projectName.toLowerCase().includes('senior');
    const grades = isSenior ? SENIOR_GRADES : DDI_GRADES;
    for (const g of grades) {
        if (salesCount >= g.minCount) {
            return { grade: g.grade, performanceRate: g.rate, subsidy: g.subsidy };
        }
    }
    return null;
}
function calcSalesCount(netSalesTotal) {
    return Math.floor(netSalesTotal / 2000000);
}
function calcNetAmount(grossAmount) {
    return Math.floor(grossAmount * (1 - 0.033));
}
function calcDeductedFee(actualAmount, paymentMethod) {
    if (paymentMethod === 'CARD') {
        return Math.floor(actualAmount * 0.025);
    }
    return 0;
}
function calcPaymentDueDate(settlementMonth, isStoreOwner) {
    const [year, month] = settlementMonth.split('-').map(Number);
    const monthOffset = isStoreOwner ? 2 : 1;
    const targetMonth = month + monthOffset;
    const targetYear = year + Math.floor((targetMonth - 1) / 12);
    const normalizedMonth = ((targetMonth - 1) % 12) + 1;
    const lastDay = new Date(targetYear, normalizedMonth, 0);
    return lastDay;
}
function calcSalesWeek(contractStart, targetDate) {
    const diffMs = targetDate.getTime() - contractStart.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
}
//# sourceMappingURL=grade-calculator.js.map