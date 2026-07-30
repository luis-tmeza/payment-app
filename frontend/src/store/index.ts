import { createStore } from 'vuex';

export type CheckoutStep = 'product' | 'payment-data' | 'summary' | 'result';

export type CheckoutState = {
  step: CheckoutStep;
  productId: string | null;
  quantity: number;
  transactionReference: string | null;
  transactionStatus: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | null;
};

const STORAGE_KEY = 'payment-app.checkout';

const defaultState = (): CheckoutState => ({
  step: 'product',
  productId: null,
  quantity: 1,
  transactionReference: null,
  transactionStatus: null,
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
    setTransactionResult(state, payload: { reference: string; status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' }) {
      state.transactionReference = payload.reference;
      state.transactionStatus = payload.status;
      state.step = 'result';
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