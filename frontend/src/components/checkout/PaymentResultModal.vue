<template>
  <Teleport to="body">
    <div v-if="isOpen" class="checkout-backdrop">
      <section class="result-modal" role="dialog" aria-modal="true" aria-labelledby="result-title">
        <div class="result-icon" :class="`result-icon--${status.toLowerCase()}`">
          <CheckCircle2 v-if="status === 'APPROVED'" :size="32" aria-hidden="true" />
          <Clock3 v-else-if="status === 'PENDING'" :size="32" aria-hidden="true" />
          <XCircle v-else :size="32" aria-hidden="true" />
        </div>
        <p class="eyebrow">Estado de pago</p>
        <h2 id="result-title">{{ title }}</h2>
        <p class="result-copy">{{ description }}</p>
        <dl class="result-details">
          <div><dt>Referencia</dt><dd>{{ reference }}</dd></div>
          <div><dt>Total</dt><dd>{{ formatMoney(totalAmountCents) }}</dd></div>
        </dl>
        <button class="pay-button" type="button" @click="$emit('return-to-product')">Volver al producto</button>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircle2, Clock3, XCircle } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  reference: string;
  statusMessage?: string;
  totalAmountCents: number;
}>();

defineEmits<{ 'return-to-product': [] }>();

const title = computed(() => {
  if (props.status === 'APPROVED') return 'Pago aprobado';
  if (props.status === 'PENDING') return 'Pago en proceso';
  if (props.status === 'DECLINED') return 'Pago rechazado';
  return 'No fue posible procesar el pago';
});

const description = computed(() => props.statusMessage || (props.status === 'APPROVED'
  ? 'Tu entrega fue asignada y el inventario se actualizo.'
  : 'Puedes volver al producto e intentarlo nuevamente.'));

const formatMoney = (amount: number): string =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount / 100);
</script>