import { createStore } from 'vuex';

export type CheckoutStep = 'product' | 'payment-data' | 'summary' | 'result';

export type CheckoutState = {
  step: CheckoutStep;
  productId: string | null;
  quantity: number;
  transactionReference: string | null;
};

const STORAGE_KEY = 'payment-app.checkout';

const defaultState = (): CheckoutState => ({
  step: 'product',
  productId: null,
  quantity: 1,
  transactionReference: null,
});

const loadState = (): CheckoutState => {
  if (typeof window === 'undefined') {
    return defaultState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultState();
  }

  try {
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return defaultState();
  }
};

export const store = createStore<CheckoutState>({
  state: loadState,
  mutations: {
    selectProduct(state, productId: string) {
      state.productId = productId;
      state.step = 'payment-data';
    },
    setStep(state, step: CheckoutStep) {
      state.step = step;
    },
    reset(state) {
      Object.assign(state, defaultState());
    },
  },
  plugins: [
    (checkoutStore) => {
      checkoutStore.subscribe((_mutation, state) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
      });
    },
  ],
});