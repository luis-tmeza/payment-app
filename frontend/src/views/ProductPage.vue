<template>
  <main class="storefront">
    <header class="storefront-header"><a class="brand" href="#catalog">NORTHSTAR <span>PAY</span></a><div class="header-actions"><div class="secure-note"><ShieldCheck :size="17" aria-hidden="true" /> Compra protegida</div><button class="cart-trigger" type="button" :aria-label="`Abrir carrito, ${cartItemCount} productos`" @click="isCartOpen = true"><ShoppingBag :size="19" aria-hidden="true" /><span v-if="cartItemCount">{{ cartItemCount }}</span></button></div></header>
    <section class="catalog-intro" aria-labelledby="catalog-title"><p class="eyebrow">Tecnologia seleccionada</p><h1 id="catalog-title">Elige lo que quieres llevar hoy.</h1><p>Productos pensados para tu dia a dia, con disponibilidad visible y un pago seguro en pocos pasos.</p></section>
    <section v-if="isLoading" class="catalog-status" aria-live="polite">Cargando catalogo...</section>
    <section v-else-if="loadError" class="catalog-status" aria-live="assertive"><p>No fue posible cargar el catalogo.</p><button class="secondary-button" type="button" @click="loadProducts">Reintentar</button></section>
    <template v-else-if="products.length"><section class="catalog-toolbar" aria-label="Informacion del catalogo"><p><strong>{{ products.length }} productos</strong> disponibles para envio nacional</p><span>Revisa el detalle, agrega al carrito o compra directamente</span></section><section id="catalog" class="catalog-layout" aria-label="Catalogo de productos"><section class="product-grid" aria-label="Productos disponibles"><article v-for="item in products" :key="item.id" class="product-card"><button type="button" class="product-card__select" :aria-label="`Ver detalle de ${item.name}`" @click="viewProduct(item)"><img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" /><div v-else class="image-placeholder" aria-hidden="true"></div></button><div class="product-card__body"><div class="product-card__meta"><span>{{ item.stock > 0 ? `${item.stock} disponibles` : 'Agotado' }}</span></div><strong>{{ item.name }}</strong><p>{{ item.description }}</p><span class="product-card__price">{{ formatMoney(item.priceCents) }}</span><div class="product-card__actions"><button class="secondary-button" type="button" @click="viewProduct(item)">Ver detalle</button><button class="cart-add-button" type="button" :disabled="item.stock === 0" @click="addProductToCart(item)"><ShoppingCart :size="16" aria-hidden="true" /><span>Agregar</span></button><button class="pay-button" type="button" :disabled="item.stock === 0" @click="buyProduct(item)">Comprar</button></div></div></article></section></section></template>
    <ProductDetailModal v-if="selectedProduct" :is-open="isDetailOpen" :product="selectedProduct" @close="closeDetails" @add-to-cart="addProductToCart(selectedProduct)" @buy="startCheckout" />
    <CartDrawer :is-open="isCartOpen" :items="store.state.cart" :subtotal-cents="cartSubtotalCents" @close="isCartOpen = false" @increase="increaseCartItem" @decrease="decreaseCartItem" @remove="removeFromCart" />
    <button v-if="cartItemCount" class="cart-quick-view" type="button" :aria-label="`Ver carrito con ${cartItemCount} productos`" @click="isCartOpen = true"><ShoppingBag :size="20" aria-hidden="true" /><span><strong>{{ cartItemCount }} {{ cartItemCount === 1 ? 'producto' : 'productos' }}</strong><small>{{ formatMoney(cartSubtotalCents) }}</small></span><ArrowRight :size="18" aria-hidden="true" /></button>
    <CheckoutModal v-if="selectedProduct" :product="selectedProduct" :is-processing="isProcessing" :payment-error="paymentError" :acceptance-documents="acceptanceDocuments" @confirm="handlePayment" />
    <PaymentResultModal v-if="paymentResult" :is-open="store.state.step === 'result'" :status="paymentResult.status" :reference="paymentResult.reference" :status-message="paymentResult.statusMessage" :total-amount-cents="paymentResult.totalAmountCents" @return-to-product="returnToProduct" />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ArrowRight, ShieldCheck, ShoppingBag, ShoppingCart } from 'lucide-vue-next';
import { createCheckoutTransaction, getAcceptanceDocuments, type CheckoutTransactionResponse } from '../api/checkout.api';
import { getProducts } from '../api/products.api';
import CartDrawer from '../components/CartDrawer.vue';
import CheckoutModal, { type CheckoutPaymentData } from '../components/checkout/CheckoutModal.vue';
import PaymentResultModal from '../components/checkout/PaymentResultModal.vue';
import ProductDetailModal from '../components/ProductDetailModal.vue';
import { store } from '../store';
import type { Product } from '../types/product';
import type { AcceptanceDocuments } from '../types/acceptance-documents';

const products = ref<Product[]>([]); const selectedProduct = ref<Product | null>(null); const isDetailOpen = ref(false); const isCartOpen = ref(false); const isLoading = ref(true); const loadError = ref(false); const isProcessing = ref(false); const paymentError = ref(''); const paymentResult = ref<CheckoutTransactionResponse | null>(null); const acceptanceDocuments = ref<AcceptanceDocuments | null>(null);
const cartItemCount = computed(() => store.state.cart.reduce((total, item) => total + item.quantity, 0));
const cartSubtotalCents = computed(() => store.state.cart.reduce((total, item) => total + item.priceCents * item.quantity, 0));
const formatMoney = (amount: number): string => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount / 100);
const loadProducts = async (): Promise<void> => { isLoading.value = true; loadError.value = false; try { products.value = await getProducts(); selectedProduct.value = null; isDetailOpen.value = false; } catch { loadError.value = true; } finally { isLoading.value = false; } };
const selectProduct = (product: Product): void => { selectedProduct.value = product; };
const viewProduct = (product: Product): void => { selectProduct(product); isDetailOpen.value = true; };
const closeDetails = (): void => { isDetailOpen.value = false; };
const addProductToCart = (product: Product): void => { store.commit('addToCart', product); };
const increaseCartItem = (productId: string): void => { store.commit('increaseCartItem', productId); };
const decreaseCartItem = (productId: string): void => { store.commit('decreaseCartItem', productId); };
const removeFromCart = (productId: string): void => { store.commit('removeFromCart', productId); };
const buyProduct = (product: Product): void => { selectProduct(product); startCheckout(); };
const handlePayment = async (paymentData: CheckoutPaymentData): Promise<void> => { if (!selectedProduct.value) return; isProcessing.value = true; paymentError.value = ''; try { paymentResult.value = await createCheckoutTransaction(selectedProduct.value.id, paymentData); store.commit('setTransactionResult', paymentResult.value); } catch { paymentError.value = 'No fue posible procesar el pago. Verifica tus datos e intentalo nuevamente.'; } finally { isProcessing.value = false; } };
const returnToProduct = async (): Promise<void> => { paymentResult.value = null; store.commit('reset'); await loadProducts(); };
const startCheckout = (): void => { if (!selectedProduct.value || selectedProduct.value.stock === 0) return; closeDetails(); void getAcceptanceDocuments().then((documents) => { acceptanceDocuments.value = documents; }).catch(() => { acceptanceDocuments.value = null; }); store.commit('selectProduct', selectedProduct.value.id); };
onMounted(loadProducts);
</script>
