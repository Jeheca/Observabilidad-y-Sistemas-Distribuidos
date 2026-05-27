"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const nestjs_pino_1 = require("nestjs-pino");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const metrics_module_1 = require("./observability/metrics.module");
const products_module_1 = require("./products/products.module");
const product_entity_1 = require("./products/entities/product.entity");
const product_material_entity_1 = require("./products/entities/product-material.entity");
function env(name) {
    const value = process.env[name];
    if (!value)
        throw new Error(`Variable de entorno requerida: ${name}`);
    return value;
}
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    level: process.env.LOG_LEVEL ?? 'info',
                    base: { service: 'products-service' },
                    autoLogging: { ignore: (req) => req.url === '/metrics' }
                }
            }),
            metrics_module_1.MetricsModule,
            products_module_1.ProductsModule,
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: env('DB_HOST'),
                port: parseInt(env('DB_PORT')),
                username: env('DB_USER'),
                password: env('DB_PASSWORD'),
                database: env('DB_NAME'),
                entities: [product_entity_1.Product, product_material_entity_1.ProductMaterial],
                synchronize: true
            })
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map