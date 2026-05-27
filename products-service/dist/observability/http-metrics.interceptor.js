"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpMetricsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
const prom_client_1 = require("prom-client");
const rxjs_1 = require("rxjs");
let HttpMetricsInterceptor = class HttpMetricsInterceptor {
    requests;
    duration;
    constructor(requests, duration) {
        this.requests = requests;
        this.duration = duration;
    }
    intercept(context, next) {
        if (context.getType() !== 'http')
            return next.handle();
        const http = context.switchToHttp();
        const request = http.getRequest();
        const response = http.getResponse();
        if (request.path === '/metrics')
            return next.handle();
        const stopTimer = this.duration.startTimer();
        const method = request.method;
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => this.register(method, request, response.statusCode, stopTimer),
            error: (error) => this.register(method, request, error?.status ?? 500, stopTimer)
        }));
    }
    register(method, request, statusCode, stopTimer) {
        const route = request.route?.path ?? request.path;
        this.requests.inc({ method, route, status_code: String(statusCode) });
        stopTimer({ method, route, status_code: String(statusCode) });
    }
};
exports.HttpMetricsInterceptor = HttpMetricsInterceptor;
exports.HttpMetricsInterceptor = HttpMetricsInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_prometheus_1.InjectMetric)('http_requests_total')),
    __param(1, (0, nestjs_prometheus_1.InjectMetric)('http_request_duration_seconds')),
    __metadata("design:paramtypes", [prom_client_1.Counter,
        prom_client_1.Histogram])
], HttpMetricsInterceptor);
//# sourceMappingURL=http-metrics.interceptor.js.map