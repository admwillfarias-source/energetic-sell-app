// Stub no-op de perfMetrics. Mantido apenas para compatibilidade de imports
// existentes (BatteryGrid, BestSellers, SearchOverlay, etc.). Em produção
// não custa nada — todas as funções são no-op.
export function markEvent(_name: string): void {}
export function measureBetween(_n: string, _s: string, _e: string): void {}
export function startLcpTracking(): void {}
export function getLcp(): number { return 0; }
export function getMetrics(): unknown[] { return []; }
export function subscribeMetrics(_fn: () => void): () => void { return () => {}; }
