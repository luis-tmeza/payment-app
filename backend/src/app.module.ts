import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { HealthController } from './infrastructure/http/health.controller';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, ProductsModule, CheckoutModule],
  controllers: [HealthController],
})
export class AppModule {}