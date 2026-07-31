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

  it('keeps cart quantities within stock and persists cart items', async () => {
    const store = await loadStore();
    const product = { id: 'product-1', name: 'Audifonos', description: 'Descripcion', priceCents: 16000000, stock: 2, imageUrl: null };
    store.commit('addToCart', product);
    store.commit('addToCart', product);
    store.commit('increaseCartItem', product.id);
    store.commit('setCartItemQuantity', { productId: product.id, quantity: 1.5 });
    store.commit('setCartItemQuantity', { productId: product.id, quantity: 3 });
    expect(store.state.cart).toEqual([{ ...product, quantity: 2 }]);
    store.commit('decreaseCartItem', product.id);
    expect(store.state.cart[0].quantity).toBe(1);
    store.commit('removeFromCart', product.id);
    expect(JSON.parse(localStorage.getItem('payment-app.checkout')!).cart).toEqual([]);
  });
});
