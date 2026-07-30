import { defineStore } from 'pinia';

export type CheckoutStep = 'product' | 'payment-data' | 'summary' | 'result';

type CheckoutState = {
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
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultState();
  }

  return { ...defaultState(), ...JSON.parse(raw) };
};

export const useCheckoutStore = defineStore('checkout', {
  state: loadState,
  actions: {
    persist() {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state));
    },
    selectProduct(productId: string) {
      this.productId = productId;
      this.step = 'payment-data';
      this.persist();
    },
    reset() {
      this.$patch(defaultState());
      this.persist();
    },
  },
});
