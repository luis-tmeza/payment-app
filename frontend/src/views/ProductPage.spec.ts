import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

const { getProducts, getAcceptanceDocuments, createCheckoutTransaction } = vi.hoisted(() => ({
  getProducts: vi.fn(), getAcceptanceDocuments: vi.fn(), createCheckoutTransaction: vi.fn(),
}));
vi.mock('../api/products.api', () => ({ getProducts }));
vi.mock('../api/checkout.api', () => ({ getAcceptanceDocuments, createCheckoutTransaction }));

import ProductPage from './ProductPage.vue';
import { store } from '../store';

const product = { id: 'product-1', name: 'Audifonos', description: 'Descripcion', priceCents: 16000000, stock: 2, imageUrl: null };
const secondProduct = { id: 'product-2', name: 'Parlante', description: 'Descripcion dos', priceCents: 9000000, stock: 4, imageUrl: null };

const mountPage = () => mount(ProductPage, {
  global: {
    stubs: {
      CheckoutModal: { template: '<button class="confirm-payment" @click="$emit(\'confirm\', payment)">Confirmar</button>', data: () => ({ payment: { fullName: 'Ana' } }) },
      PaymentResultModal: { template: '<button class="return-product" @click="$emit(\'return-to-product\')">Volver</button>' },
    },
  },
});

describe('ProductPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    store.commit('reset');
  });

  it('loads product data and opens checkout with acceptance documents', async () => {
    getProducts.mockResolvedValue([product]);
    getAcceptanceDocuments.mockResolvedValue({ termsUrl: 'https://terms', personalDataUrl: 'https://data' });
    const wrapper = mountPage();
    await flushPromises();
    expect(wrapper.text()).toContain('Audifonos');
    await wrapper.get('.pay-button').trigger('click');
    await flushPromises();
    expect(store.state).toMatchObject({ step: 'payment-data', productId: 'product-1' });
    expect(getAcceptanceDocuments).toHaveBeenCalledOnce();
  });

  it('shows the selected card details in the purchase panel', async () => {
    getProducts.mockResolvedValue([product, secondProduct]);
    const wrapper = mountPage();
    await flushPromises();
    await wrapper.findAll('.product-card')[1].get('.secondary-button').trigger('click');
    await flushPromises();
    expect(wrapper.get('.selected-product').text()).toContain('Parlante');
    expect(wrapper.get('.selected-product').text()).toMatch(/\$\s+90\.000/);
  });
  it('opens checkout for the product chosen from a multi-product catalog', async () => {
    getProducts.mockResolvedValue([product, secondProduct]);
    getAcceptanceDocuments.mockResolvedValue({ termsUrl: 'https://terms', personalDataUrl: 'https://data' });
    const wrapper = mountPage();
    await flushPromises();
    await wrapper.findAll('.product-card')[1].get('.pay-button').trigger('click');
    await flushPromises();
    expect(store.state).toMatchObject({ step: 'payment-data', productId: 'product-2' });
  });
  it('shows a retry action when loading fails and reloads the product', async () => {
    getProducts.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce([product]);
    const wrapper = mountPage();
    await flushPromises();
    expect(wrapper.text()).toContain('No fue posible cargar el catalogo.');
    await wrapper.get('.secondary-button').trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('Audifonos');
  });

  it('records payment results and returns to the product', async () => {
    getProducts.mockResolvedValue([product]);
    createCheckoutTransaction.mockResolvedValue({ reference: 'PAY-1', status: 'APPROVED', totalAmountCents: 17150000 });
    const wrapper = mountPage();
    await flushPromises();
    await wrapper.get('.confirm-payment').trigger('click');
    await flushPromises();
    expect(store.state).toMatchObject({ step: 'result', transactionReference: 'PAY-1' });
    await wrapper.get('.return-product').trigger('click');
    await flushPromises();
    expect(store.state.step).toBe('product');
  });
});
