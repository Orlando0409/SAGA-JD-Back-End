import { Counter, Histogram, register } from 'prom-client';

// Contador de requests
export const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total de requests HTTP',
  labelNames: ['method', 'route', 'status'],
});

// Histograma de latencia
export const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Tiempo de respuesta HTTP',
  labelNames: ['method', 'route', 'status'],
});

export { register };