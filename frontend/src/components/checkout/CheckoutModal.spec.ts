import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CheckoutModal from './CheckoutModal.vue';
import { store } from '../../store';

const product = { id: 'product-1', name: 'Audifonos', description: 'Prueba', priceCents: 16000000, stock: 2, imageUrl: null };
const mountModal = () => mount(CheckoutModal, {
  props: { product, items: [{ ...product, quantity: 1 }], acceptanceDocuments: { termsUrl: 'https://terms', personalDataUrl: 'https://data' } },
  global: { stubs: { teleport: true } },
});

describe('CheckoutModal', () => {
  beforeEach(() => store.commit('selectProduct', product.id));

  it('shows an error when the card number is invalid', async () => {
    const wrapper = mountModal();
    await wrapper.get('form').trigger('submit');
    expect(wrapper.text()).toContain('Ingresa un numero de tarjeta valido.');
  });

  it('formats input, renders the summary, permits editing and emits payment data', async () => {
    const wrapper = mountModal();
    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('4242 4242 4242 4242');
    await inputs[1].setValue('1231');
    await inputs[2].setValue('123');
    await inputs[2].trigger('focus');
    expect(wrapper.get('.card-preview__inner').classes()).toContain('is-flipped');
    await inputs[2].trigger('blur');
    expect(wrapper.get('.card-preview__inner').classes()).not.toContain('is-flipped');
    await inputs[3].setValue('Ana Perez');
    await inputs[4].setValue('Ana Perez');
    await inputs[5].setValue('ana@example.com');
    await inputs[6].setValue('3000000000');
    await inputs[7].setValue('12345678');
    await inputs[8].setValue('Calle 1 # 2-3');
    await inputs[9].setValue('Bogota');
    await inputs[10].setValue('Cundinamarca');
    await inputs[11].setValue(true);
    await inputs[12].setValue(true);
    expect(wrapper.get('.card-preview').text()).toContain('4242 4242 4242 4242');
    await wrapper.get('form').trigger('submit');

    expect(wrapper.text()).toContain('Revisa antes de pagar');
    expect(wrapper.text()).toContain('Visa terminada en 4242');
    await wrapper.get('.secondary-button').trigger('click');
    expect(wrapper.text()).toContain('Completa tu pago');
    await wrapper.get('form').trigger('submit');
    await wrapper.get('.summary-actions .pay-button').trigger('click');
    expect(wrapper.emitted('confirm')?.[0][0]).toMatchObject({ cardNumber: '4242424242424242', acceptedTerms: true, acceptedPersonalData: true });
  });

  it('closes and resets the checkout state', async () => {
    const wrapper = mountModal();
    await wrapper.get('[aria-label="Cerrar checkout"]').trigger('click');
    expect(store.state.step).toBe('product');
  });
});
