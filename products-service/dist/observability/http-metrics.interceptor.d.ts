import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';
import { Observable } from 'rxjs';
export declare class HttpMetricsInterceptor implements NestInterceptor {
    private readonly requests;
    private readonly duration;
    constructor(requests: Counter<string>, duration: Histogram<string>);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
    private register;
}
