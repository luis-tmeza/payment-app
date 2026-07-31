import { createStore } from 'vuex';
import type { CartItem } from '../types/cart';
import type { Product } from '../types/product';

export type CheckoutStep = 'product' | 'payment-data' | 'summary' | 'result';

export type CheckoutState = {
  step: CheckoutStep;
  productId: string | null;
  quantity: number;
  transactionReference: string | null;
  transactionStatus: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | null;
  cart: CartItem[];
};

const STORAGE_KEY = 'payment-app.checkout';

const defaultState = (): CheckoutState => ({
  step: 'product', productId: null, quantity: 1, transactionReference: null, transactionStatus: null, cart: [],
});

const loadState = (): CheckoutState => {
  if (typeof window === 'undefined') return defaultState();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState();
  try { return { ...defaultState(), ...JSON.parse(raw) }; } catch { window.localStorage.removeItem(STORAGE_KEY); return defaultState(); }
};

export const store = createStore<CheckoutState>({
  state: loadState,
  mutations: {
    selectProduct(state, productId: string) { state.productId = productId; state.step = 'payment-data'; },
    setStep(state, step: CheckoutStep) { state.step = step; },
    addToCart(state, product: Product) {
      const existing = state.cart.find((item) => item.id === product.id);
      if (existing) { if (existing.quantity < product.stock) existing.quantity += 1; return; }
      if (product.stock > 0) state.cart.push({ ...product, quantity: 1 });
    },
    increaseCartItem(state, productId: string) {
      const item = state.cart.find((cartItem) => cartItem.id === productId);
      if (item && item.quantity < item.stock) item.quantity += 1;
    },
    decreaseCartItem(state, productId: string) {
      const item = state.cart.find((cartItem) => cartItem.id === productId);
      if (!item) return;
      if (item.quantity > 1) item.quantity -= 1;
      else state.cart = state.cart.filter((cartItem) => cartItem.id !== productId);
    },
    removeFromCart(state, productId: string) { state.cart = state.cart.filter((item) => item.id !== productId); },
    clearCart(state) { state.cart = []; },
    setTransactionResult(state, payload: { reference: string; status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' }) {
      state.transactionReference = payload.reference; state.transactionStatus = payload.status; state.step = 'result';
    },
    reset(state) { Object.assign(state, { ...defaultState(), cart: state.cart }); },
  },
  plugins: [(checkoutStore) => checkoutStore.subscribe((_mutation, state) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  })],
});
