import { beforeEach, describe, expect, it } from 'vitest';

const loadStore = async () => {
  vi.resetModules();
  return (await import('./index')).store;
};

describe('checkout store', () => {
  beforeEach(() => localStorage.clear());

  it('loads the default checkout state and persists mutations', async () => {
    const store = await loadStore();
    expect(store.state.step).toBe('product');
    store.commit('selectProduct', 'product-1');
    store.commit('setTransactionResult', { reference: 'PAY-1', status: 'APPROVED' });
    expect(JSON.parse(localStorage.getItem('payment-app.checkout')!)).toMatchObject({ productId: 'product-1', transactionReference: 'PAY-1' });
  });

  it('resets invalid persisted state and accepts valid state', async () => {
    localStorage.setItem('payment-app.checkout', '{invalid');
    expect((await loadStore()).state.step).toBe('product');
    localStorage.setItem('payment-app.checkout', JSON.stringify({ step: 'result', quantity: 2 }));
    expect((await loadStore()).state).toMatchObject({ step: 'result', quantity: 2 });
  });
});