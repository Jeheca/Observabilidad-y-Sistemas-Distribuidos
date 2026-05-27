"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
const http_metrics_interceptor_1 = require("./http-metrics.interceptor");
const metricas = [
    (0, nestjs_prometheus_1.makeCounterProvider)({
        name: 'http_requests_total',
        help: 'Total de peticiones HTTP atendidas',
        labelNames: ['method', 'route', 'status_code']
    }),
    (0, nestjs_prometheus_1.makeHistogramProvider)({
        name: 'http_request_duration_seconds',
        help: 'Duración de las peticiones HTTP en segundos',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
    }),
    (0, nestjs_prometheus_1.makeCounterProvider)({
        name: 'products_created_total',
        help: 'Total de productos creados'
    }),
    (0, nestjs_prometheus_1.makeCounterProvider)({
        name: 'products_stock_updates_total',
        help: 'Total de actualizaciones de stock realizadas',
        labelNames: ['result']
    })
];
let MetricsModule = class MetricsModule {
};
exports.MetricsModule = MetricsModule;
exports.MetricsModule = MetricsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [nestjs_prometheus_1.PrometheusModule.register({ defaultMetrics: { enabled: false } })],
        providers: [...metricas, { provide: core_1.APP_INTERCEPTOR, useClass: http_metrics_interceptor_1.HttpMetricsInterceptor }],
        exports: metricas
    })
], MetricsModule);
//# sourceMappingURL=metrics.module.js.map