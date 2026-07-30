<template>
  <main class="page-shell">
    <section class="product-hero">
      <div class="product-media">
        <img :src="product.imageUrl" :alt="product.name" />
      </div>
      <div class="product-content">
        <p class="eyebrow">Checkout seguro</p>
        <h1>{{ product.name }}</h1>
        <p class="description">{{ product.description }}</p>

        <div class="stock-row">
          <span class="price">{{ formattedPrice }}</span>
          <span class="stock">{{ product.stock }} unidades</span>
        </div>

        <button class="pay-button" type="button">Pagar con tarjeta de credito</button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const product = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Aurora Wireless Headphones',
  description:
    'Audifonos inalambricos con cancelacion activa de ruido, carga rapida y estuche compacto.',
  priceCents: 15990000,
  stock: 12,
  imageUrl:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
};

const formattedPrice = computed(() =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(product.priceCents / 100),
);
</script>
