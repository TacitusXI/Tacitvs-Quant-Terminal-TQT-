/**
 * Вычисляет Expected Value (EV) стратегии – средний результат на одну сделку.
 * @param tradeOutcomes массив результатов сделок в единицах риска R (положительные – прибыль, отрицательные – убыток).
 * @returns математическое ожидание прибыли на сделку (в единицах R).
 */
export function calculateEV(tradeOutcomes: number[]): number {
    // Если список пуст, возвращаем 0 (нет сделок – нет ожидаемой прибыли)
    if (tradeOutcomes.length === 0) return 0;
    // Суммируем все результаты сделок
    const total = tradeOutcomes.reduce((acc, outcome) => acc + outcome, 0);
    // Делим сумму на количество сделок, получая средний результат (EV)
    const ev = total / tradeOutcomes.length;
    return ev;
}

/**
 * Применяет постоянные издержки (например, комиссия, проскальзывание) к каждому результату сделки.
 * @param tradeOutcomes массив результатов сделок в R
 * @param costPerTrade размер издержек на одну сделку (в долях R)
 * @returns новый массив результатов с учётом издержек (из каждого результата вычтена costPerTrade)
 */
export function applyCostsInR(tradeOutcomes: number[], costPerTrade: number): number[] {
    // Вычитаем из каждого исхода сделки фиксированную стоимость costPerTrade (в единицах R)
    return tradeOutcomes.map(result => result - costPerTrade);
}
