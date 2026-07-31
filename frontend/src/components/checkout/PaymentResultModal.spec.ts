import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PaymentResultModal from './PaymentResultModal.vue';

const mountResult = (status: 'APPROVED' | 'PENDING' | 'DECLINED' | 'ERROR') => mount(PaymentResultModal, {
  props: { isOpen: true, status, reference: 'PAY-1', totalAmountCents: 1250000 },
  global: { stubs: { teleport: true } },
});

describe('PaymentResultModal', () => {
  it('renders approved and pending statuses and emits return', async () => {
    const approved = mountResult('APPROVED');
    expect(approved.text()).toContain('Pago aprobado');
    await approved.get('button').trigger('click');
    expect(approved.emitted('return-to-product')).toHaveLength(1);
    expect(mountResult('PENDING').text()).toContain('Pago en proceso');
  });

  it('renders rejected and error statuses', () => {
    expect(mountResult('DECLINED').text()).toContain('Pago rechazado');
    expect(mountResult('ERROR').text()).toContain('No fue posible procesar el pago');
  });
});