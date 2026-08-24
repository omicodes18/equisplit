'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.location.protocol.startsWith('http')
    ) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Nocturne ServiceWorker registered: ', registration.scope);
          })
          .catch((err) => {
            console.log('Nocturne ServiceWorker registration failed: ', err);
          });
      });
    }
  }, []);

  return null;
}
