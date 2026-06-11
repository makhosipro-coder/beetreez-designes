import * as Sentry from '@sentry/nextjs';

export const onRequestError = Sentry.captureRequestError;

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
});
