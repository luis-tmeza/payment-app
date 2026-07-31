<template>
  <Teleport to="body">
    <div v-if="isOpen" class="checkout-backdrop" @mousedown.self="close">
      <section class="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <header class="checkout-header">
          <div>
            <p class="eyebrow">Pago seguro</p>
            <h2 id="checkout-title">{{ isSummary ? 'Confirma tu compra' : 'Datos de pago y entrega' }}</h2>
          </div>
          <button class="icon-button" type="button" aria-label="Cerrar checkout" @click="close"><X :size="20" /></button>
        </header>

        <form v-if="!isSummary" class="checkout-form" @submit.prevent="continueToSummary">
          <div class="checkout-stepper" aria-label="Progreso del checkout"><div class="is-active"><span>1</span> Datos</div><div><span>2</span> Confirmacion</div><div><span>3</span> Resultado</div></div>
          <aside class="checkout-order-context" aria-label="Resumen de la compra">
            <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
            <div><span>Estas comprando</span><strong>{{ items.length > 1 ? `${items.length} productos` : product.name }}</strong><small>{{ formatMoney(productSubtotalCents) }}</small></div>
          </aside>
          <fieldset class="form-section">
            <legend><CreditCard :size="18" /> Tarjeta</legend>
            <div class="form-grid">
              <label class="field field--full">Numero de tarjeta
                <span class="input-with-icon">
                  <input :value="cardNumber" inputmode="numeric" autocomplete="cc-number" maxlength="19" placeholder="0000 0000 0000 0000" required @input="formatCardNumber" />
                  <span v-if="cardBrand" class="card-brand">{{ cardBrand }}</span>
                </span>
              </label>
              <label class="field">Vencimiento
                <input v-model.trim="form.expiration" inputmode="numeric" autocomplete="cc-exp" maxlength="5" placeholder="MM/YY" required @input="formatExpiration" />
              </label>
              <label class="field">CVV
                <input v-model.trim="form.cvv" inputmode="numeric" autocomplete="cc-csc" maxlength="4" placeholder="123" required />
              </label>
              <label class="field field--full">Nombre como aparece en la tarjeta
                <input v-model.trim="form.cardholderName" autocomplete="cc-name" required />
              </label>
            </div>
          </fieldset>

          <fieldset class="form-section">
            <legend><MapPin :size="18" /> Entrega</legend>
            <div class="form-grid">
              <label class="field field--full">Nombre completo<input v-model.trim="form.fullName" autocomplete="name" required /></label>
              <label class="field">Correo electronico<input v-model.trim="form.email" type="email" autocomplete="email" required /></label>
              <label class="field">Telefono<input v-model.trim="form.phone" inputmode="tel" autocomplete="tel" required /></label>
              <label class="field">Tipo de documento
                <select v-model="form.documentType" required><option value="CC">Cedula de ciudadania</option><option value="CE">Cedula de extranjeria</option><option value="PP">Pasaporte</option></select>
              </label>
              <label class="field">Numero de documento<input v-model.trim="form.document" inputmode="numeric" required /></label>
              <label class="field field--full">Direccion<input v-model.trim="form.addressLine" autocomplete="street-address" required /></label>
              <label class="field">Ciudad<input v-model.trim="form.city" autocomplete="address-level2" required /></label>
              <label class="field">Departamento<input v-model.trim="form.region" autocomplete="address-level1" required /></label>
              <label class="field field--full">Indicaciones de entrega <span class="optional">Opcional</span><textarea v-model.trim="form.notes" rows="2"></textarea></label>
            </div>
          </fieldset>

          <div class="consent-fields">
            <label class="consent-field"><input v-model="form.acceptedTerms" type="checkbox" required /><span>Acepto los <a v-if="acceptanceDocuments" :href="acceptanceDocuments.termsUrl" target="_blank" rel="noopener">terminos y condiciones de Wompi</a><template v-else>terminos y condiciones de Wompi</template>.</span></label>
            <label class="consent-field"><input v-model="form.acceptedPersonalData" type="checkbox" required /><span>Autorizo el <a v-if="acceptanceDocuments" :href="acceptanceDocuments.personalDataUrl" target="_blank" rel="noopener">tratamiento de mis datos personales</a><template v-else>tratamiento de mis datos personales</template>.</span></label>
          </div>
          <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
          <button class="pay-button checkout-submit" type="submit">Continuar al resumen</button>
          <p class="payment-assurance">Tu tarjeta se tokeniza de forma segura. No almacenamos numero completo ni CVV.</p>
        </form>

        <div v-else class="checkout-summary">
          <div class="checkout-stepper" aria-label="Progreso del checkout"><div><span>1</span> Datos</div><div class="is-active"><span>2</span> Confirmacion</div><div><span>3</span> Resultado</div></div>
          <div class="summary-product">
            <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
            <div><span>Producto</span><strong>{{ product.name }}</strong><small>Tarjeta {{ cardBrand || 'credito' }} terminada en {{ lastFour }}</small></div>
          </div>
          <dl class="summary-lines">
            <div><dt>Productos ({{ items.length }})</dt><dd>{{ formatMoney(productSubtotalCents) }}</dd></div>
            <div><dt>Tarifa base</dt><dd>{{ formatMoney(baseFeeCents) }}</dd></div>
            <div><dt>Envio</dt><dd>{{ formatMoney(deliveryFeeCents) }}</dd></div>
            <div class="summary-total"><dt>Total</dt><dd>{{ formatMoney(totalCents) }}</dd></div>
          </dl>
          <div class="summary-actions">
            <button class="secondary-button" type="button" :disabled="isProcessing" @click="isSummary = false">Editar datos</button>
            <button class="pay-button" type="button" :disabled="isProcessing" @click="emitPayment">{{ isProcessing ? 'Procesando pago...' : 'Pagar ahora' }}</button>
          </div>
          <p v-if="paymentError" class="form-error" role="alert">{{ paymentError }}</p>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { CreditCard, MapPin, X } from 'lucide-vue-next';
import { store } from '../../store';
import { cardDigits, detectCardBrand, formatCardNumber as displayCardNumber, formatExpiration as displayExpiration, isValidCardNumber, isValidExpiration } from '../../utils/card';
import type { Product } from '../../types/product';
import type { CartItem } from '../../types/cart';
import type { AcceptanceDocuments } from '../../types/acceptance-documents';

const props = defineProps<{ product: Product; items: CartItem[]; isProcessing?: boolean; paymentError?: string; acceptanceDocuments?: AcceptanceDocuments | null }>();

export type CheckoutPaymentData = {
  cardNumber: string;
  expiration: string;
  cvv: string;
  cardholderName: string;
  fullName: string;
  email: string;
  phone: string;
  documentType: string;
  document: string;
  addressLine: string;
  city: string;
  region: string;
  notes: string;
  acceptedTerms: boolean;
  acceptedPersonalData: boolean;
};

const emit = defineEmits<{ confirm: [data: CheckoutPaymentData] }>();
const baseFeeCents = 250000;
const deliveryFeeCents = 900000;
const isSummary = ref(false);
const formError = ref('');
const form = reactive<CheckoutPaymentData>({
  cardNumber: '', expiration: '', cvv: '', cardholderName: '', fullName: '', email: '', phone: '',
  documentType: 'CC', document: '', addressLine: '', city: '', region: '', notes: '',
  acceptedTerms: false, acceptedPersonalData: false,
});

const isOpen = computed(() => store.state.step === 'payment-data');
const digits = computed(() => cardDigits(form.cardNumber));
const lastFour = computed(() => digits.value.slice(-4));
const cardNumber = computed(() => displayCardNumber(form.cardNumber));
const cardBrand = computed(() => detectCardBrand(form.cardNumber));
const productSubtotalCents = computed(() => props.items.reduce((total, item) => total + item.priceCents * item.quantity, 0));
const totalCents = computed(() => productSubtotalCents.value + baseFeeCents + deliveryFeeCents);

const formatCardNumber = (event: Event): void => { form.cardNumber = cardDigits((event.target as HTMLInputElement).value); };
const formatExpiration = (event: Event): void => { form.expiration = displayExpiration((event.target as HTMLInputElement).value); };

const continueToSummary = (): void => {
  formError.value = '';
  if (!isValidCardNumber(form.cardNumber)) { formError.value = 'Ingresa un numero de tarjeta valido.'; return; }
  if (!isValidExpiration(form.expiration)) { formError.value = 'La fecha de vencimiento no es valida.'; return; }
  if (!/^\d{3,4}$/.test(form.cvv)) { formError.value = 'Ingresa un CVV valido.'; return; }
  isSummary.value = true;
};

const emitPayment = (): void => emit('confirm', { ...form });
const resetForm = (): void => {
  Object.assign(form, {
    cardNumber: '', expiration: '', cvv: '', cardholderName: '', fullName: '', email: '', phone: '',
    documentType: 'CC', document: '', addressLine: '', city: '', region: '', notes: '',
    acceptedTerms: false, acceptedPersonalData: false,
  });
  isSummary.value = false;
  formError.value = '';
};
watch(isOpen, (open) => { if (!open) resetForm(); });
const close = (): void => store.commit('reset');
const formatMoney = (amount: number): string =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount / 100);
</script>
