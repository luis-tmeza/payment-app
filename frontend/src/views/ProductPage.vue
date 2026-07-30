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
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getFeaturedProduct } from '../api/products.api';
import { store } from '../store';
import type { Product } from '../types/product';

const product = ref<Product | null>(null);
const isLoading = ref(true);
const loadError = ref(false);

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

const startCheckout = (): void => {
  if (product.value && product.value.stock > 0) {
    store.commit('selectProduct', product.value.id);
  }
};

onMounted(loadProduct);
</script>