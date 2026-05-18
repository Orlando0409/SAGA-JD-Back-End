import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable, tap } from 'rxjs';
import { httpRequests, httpDuration } from '../../metrics/metrics';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const end = httpDuration.startTimer();

    return next.handle().pipe(
      tap(() => {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();

        const route = req.route?.path || req.url;

        // medir latencia
        end({
          method: req.method,
          route,
          status: res.statusCode,
        });

        // contar requests
        httpRequests.inc({
          method: req.method,
          route,
          status: res.statusCode,
        });
      }),
    );
  }
}