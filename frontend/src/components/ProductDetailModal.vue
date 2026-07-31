<template>
  <Teleport to="body">
    <div v-if="isOpen" class="product-detail-backdrop" @mousedown.self="emit('close')">
      <section class="product-detail-modal" role="dialog" aria-modal="true" aria-labelledby="product-detail-title" @keydown.esc="emit('close')">
        <button class="icon-button product-detail-close" type="button" aria-label="Cerrar detalle" @click="emit('close')"><X :size="20" /></button>
        <div class="product-detail-media">
          <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
          <div v-else class="image-placeholder" aria-hidden="true"></div>
        </div>
        <div class="product-detail-content">
          <p class="eyebrow">Detalle del producto</p>
          <h2 id="product-detail-title">{{ product.name }}</h2>
          <p class="product-detail-description">{{ product.description }}</p>
          <p class="product-detail-stock" :class="{ 'stock--empty': product.stock === 0 }">{{ product.stock > 0 ? `${product.stock} unidades disponibles` : 'Producto agotado' }}</p>
          <strong class="product-detail-price">{{ formatMoney(product.priceCents) }}</strong>
          <div class="product-detail-benefits" aria-label="Beneficios de compra">
            <span><Truck :size="17" aria-hidden="true" /> Envio rastreable</span>
            <span><RotateCcw :size="17" aria-hidden="true" /> Cambios sencillos</span>
            <span><ShieldCheck :size="17" aria-hidden="true" /> Pago seguro</span>
          </div>
          <button class="pay-button product-detail-buy" type="button" :disabled="product.stock === 0" @click="emit('buy')">
            Comprar ahora <ArrowRight :size="18" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ArrowRight, RotateCcw, ShieldCheck, Truck, X } from 'lucide-vue-next';
import type { Product } from '../types/product';

defineProps<{ product: Product; isOpen: boolean }>();
const emit = defineEmits<{ close: []; buy: [] }>();
const formatMoney = (amount: number): string => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount / 100);
</script>
