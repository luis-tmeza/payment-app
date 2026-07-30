<template>
  <main class="page-shell">
    <section v-if="isLoading" class="product-hero product-hero--status" aria-live="polite">
      <p>Cargando producto...</p>
    </section>

    <section v-else-if="loadError" class="product-hero product-hero--status" aria-live="assertive">
      <p>No fue posible cargar el producto.</p>
      <button class="secondary-button" type="button" @click="loadProduct">Reintentar</button>
    </section>

    <section v-else-if="product" class="product-hero">
      <div class="product-media">
        <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
        <div v-else class="image-placeholder" aria-hidden="true"></div>
      </div>
      <div class="product-content">
        <p class="eyebrow">Checkout seguro</p>
        <h1>{{ product.name }}</h1>
        <p class="description">{{ product.description }}</p>

        <div class="stock-row">
          <span class="price">{{ formattedPrice }}</span>
          <span class="stock" :class="{ 'stock--empty': product.stock === 0 }">
            {{ product.stock === 0 ? 'Agotado' : `${product.stock} unidades` }}
          </span>
        </div>

        <button
          class="pay-button"
          type="button"
          :disabled="product.stock === 0"
          @click="startCheckout"
        >
          Pagar con tarjeta de credito
        </button>
      </div>
    </section>
    <CheckoutModal
      v-if="product"
      :product="product"
      :is-processing="isProcessing"
      :payment-error="paymentError"
      @confirm="handlePayment"
    />
    <PaymentResultModal
      v-if="paymentResult"
      :is-open="store.state.step === 'result'"
      :status="paymentResult.status"
      :reference="paymentResult.reference"
      :status-message="paymentResult.statusMessage"
      :total-amount-cents="paymentResult.totalAmountCents"
      @return-to-product="returnToProduct"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { createCheckoutTransaction, type CheckoutTransactionResponse } from '../api/checkout.api';
import { getFeaturedProduct } from '../api/products.api';
import CheckoutModal, { type CheckoutPaymentData } from '../components/checkout/CheckoutModal.vue';
import PaymentResultModal from '../components/checkout/PaymentResultModal.vue';
import { store } from '../store';
import type { Product } from '../types/product';

const product = ref<Product | null>(null);
const isLoading = ref(true);
const loadError = ref(false);
const isProcessing = ref(false);
const paymentError = ref('');
const paymentResult = ref<CheckoutTransactionResponse | null>(null);

const formattedPrice = computed(() => {
  if (!product.value) {
    return '';
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(product.value.priceCents / 100);
});

const loadProduct = async (): Promise<void> => {
  isLoading.value = true;
  loadError.value = false;

  try {
    product.value = await getFeaturedProduct();
  } catch {
    loadError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const handlePayment = async (paymentData: CheckoutPaymentData): Promise<void> => {
  if (!product.value) return;
  isProcessing.value = true;
  paymentError.value = '';

  try {
    paymentResult.value = await createCheckoutTransaction(product.value.id, paymentData);
    store.commit('setTransactionResult', paymentResult.value);
  } catch {
    paymentError.value = 'No fue posible procesar el pago. Verifica tus datos e intentalo nuevamente.';
  } finally {
    isProcessing.value = false;
  }
};

const returnToProduct = async (): Promise<void> => {
  paymentResult.value = null;
  store.commit('reset');
  await loadProduct();
};

const startCheckout = (): void => {
  if (product.value && product.value.stock > 0) {
    store.commit('selectProduct', product.value.id);
  }
};

onMounted(loadProduct);
</script>