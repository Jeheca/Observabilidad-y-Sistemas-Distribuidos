import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';


@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(@InjectMetric('http_requests_total') private readonly requests: Counter<string>, @InjectMetric('http_request_duration_seconds') private readonly duration: Histogram<string>) {
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    if (request.path === '/metrics') return next.handle();

    const stopTimer = this.duration.startTimer();
    const method = request.method;

    const tapFn = tap({
      next: () => this.register(method, request, response.statusCode, stopTimer),
      error: (error: { status?: number }) =>
        this.register(method, request, error?.status ?? 500, stopTimer)
    })

    return next.handle().pipe(tapFn);
  }

  private register(method: string, request: Request, statusCode: number, detenerCronometro: ReturnType<Histogram<string>['startTimer']>): void {
    const route = (request.route?.path as string | undefined) ?? request.path;
    const labels = { method, route, status_code: String(statusCode) };
    this.requests.inc(labels);
    detenerCronometro(labels);
  }
}
