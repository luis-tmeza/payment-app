<template>
  <main class="storefront">
    <header class="storefront-header">
      <a class="brand" href="#catalog">NORTHSTAR <span>PAY</span></a>
      <div class="secure-note"><ShieldCheck :size="17" aria-hidden="true" /> Pagos protegidos</div>
    </header>

    <section class="catalog-intro" aria-labelledby="catalog-title">
      <p class="eyebrow">Tecnologia seleccionada</p>
      <h1 id="catalog-title">Elige lo que quieres llevar hoy.</h1>
      <p>Selecciona un producto, revisa su disponibilidad y completa el pago seguro en pocos pasos.</p>
    </section>

    <section v-if="isLoading" class="catalog-status" aria-live="polite">Cargando catalogo...</section>
    <section v-else-if="loadError" class="catalog-status" aria-live="assertive">
      <p>No fue posible cargar el catalogo.</p>
      <button class="secondary-button" type="button" @click="loadProducts">Reintentar</button>
    </section>

    <template v-else-if="products.length && selectedProduct">
      <section id="catalog" class="product-grid" aria-label="Catalogo de productos">
        <article v-for="item in products" :key="item.id" class="product-card" :class="{ 'product-card--selected': item.id === selectedProduct.id }">
          <button type="button" class="product-card__select" @click="selectProduct(item)">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
            <div v-else class="image-placeholder" aria-hidden="true"></div>
            <div class="product-card__body">
              <div class="product-card__meta"><span>{{ item.stock > 0 ? `${item.stock} disponibles` : 'Agotado' }}</span><span v-if="item.id === selectedProduct.id">Seleccionado</span></div>
              <strong>{{ item.name }}</strong>
              <span class="product-card__price">{{ formatMoney(item.priceCents) }}</span>
            </div>
          </button>
        </article>
      </section>

      <section class="selected-product" aria-label="Producto seleccionado">
        <div class="selected-product__media">
          <img v-if="selectedProduct.imageUrl" :src="selectedProduct.imageUrl" :alt="selectedProduct.name" />
        </div>
        <div class="selected-product__content">
          <p class="eyebrow">Producto seleccionado</p>
          <h2>{{ selectedProduct.name }}</h2>
          <p>{{ selectedProduct.description }}</p>
          <div class="selected-product__details">
            <strong>{{ formatMoney(selectedProduct.priceCents) }}</strong>
            <span :class="{ 'stock--empty': selectedProduct.stock === 0 }">{{ selectedProduct.stock > 0 ? `${selectedProduct.stock} unidades listas para envio` : 'Producto agotado' }}</span>
          </div>
          <button class="pay-button" type="button" :disabled="selectedProduct.stock === 0" @click="startCheckout">
            Continuar al pago <ArrowRight :size="18" aria-hidden="true" />
          </button>
        </div>
      </section>
    </template>

    <CheckoutModal v-if="selectedProduct" :product="selectedProduct" :is-processing="isProcessing" :payment-error="paymentError" :acceptance-documents="acceptanceDocuments" @confirm="handlePayment" />
    <PaymentResultModal v-if="paymentResult" :is-open="store.state.step === 'result'" :status="paymentResult.status" :reference="paymentResult.reference" :status-message="paymentResult.statusMessage" :total-amount-cents="paymentResult.totalAmountCents" @return-to-product="returnToProduct" />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ArrowRight, ShieldCheck } from 'lucide-vue-next';
import { createCheckoutTransaction, getAcceptanceDocuments, type CheckoutTransactionResponse } from '../api/checkout.api';
import { getProducts } from '../api/products.api';
import CheckoutModal, { type CheckoutPaymentData } from '../components/checkout/CheckoutModal.vue';
import PaymentResultModal from '../components/checkout/PaymentResultModal.vue';
import { store } from '../store';
import type { Product } from '../types/product';
import type { AcceptanceDocuments } from '../types/acceptance-documents';

const products = ref<Product[]>([]);
const selectedProduct = ref<Product | null>(null);
const isLoading = ref(true);
const loadError = ref(false);
const isProcessing = ref(false);
const paymentError = ref('');
const paymentResult = ref<CheckoutTransactionResponse | null>(null);
const acceptanceDocuments = ref<AcceptanceDocuments | null>(null);

const formatMoney = (amount: number): string => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount / 100);

const loadProducts = async (): Promise<void> => {
  isLoading.value = true;
  loadError.value = false;
  try {
    products.value = await getProducts();
    selectedProduct.value = products.value.find((product) => product.id === store.state.productId) ?? products.value[0] ?? null;
  } catch {
    loadError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const selectProduct = (product: Product): void => { selectedProduct.value = product; };

const handlePayment = async (paymentData: CheckoutPaymentData): Promise<void> => {
  if (!selectedProduct.value) return;
  isProcessing.value = true;
  paymentError.value = '';
  try {
    paymentResult.value = await createCheckoutTransaction(selectedProduct.value.id, paymentData);
    store.commit('setTransactionResult', paymentResult.value);
  } catch {
    paymentError.value = 'No fue posible procesar el pago. Verifica tus datos e intentalo nuevamente.';
  } finally {
    isProcessing.value = false;
  }
};

const returnToProduct = async (): Promise<void> => { paymentResult.value = null; store.commit('reset'); await loadProducts(); };
const startCheckout = (): void => {
  if (!selectedProduct.value || selectedProduct.value.stock === 0) return;
  void getAcceptanceDocuments().then((documents) => { acceptanceDocuments.value = documents; }).catch(() => { acceptanceDocuments.value = null; });
  store.commit('selectProduct', selectedProduct.value.id);
};

onMounted(loadProducts);
</script>