import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrometheusModule, makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { HttpMetricsInterceptor } from './http-metrics.interceptor';

const metricas = [
  makeCounterProvider({
    name: 'http_requests_total',
    help: 'Total de peticiones HTTP atendidas',
    labelNames: ['method', 'route', 'status_code']
  }),
  makeHistogramProvider({
    name: 'http_request_duration_seconds',
    help: 'Duración de las peticiones HTTP en segundos',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
  }),
  makeCounterProvider({
    name: 'auth_logins_total',
    help: 'Total de intentos de inicio de sesión',
    labelNames: ['result']
  }),
  makeCounterProvider({
    name: 'auth_registrations_total',
    help: 'Total de registros de usuario exitosos'
  })
];

@Global()
@Module({
  imports: [PrometheusModule.register({ defaultMetrics: { enabled: false } })],
  providers: [...metricas, { provide: APP_INTERCEPTOR, useClass: HttpMetricsInterceptor }],
  exports: metricas
})
export class MetricsModule {}
