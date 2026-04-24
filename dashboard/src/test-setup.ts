import '@testing-library/jest-dom';

// Stub import.meta.env for unit tests
Object.assign(import.meta.env, {
  VITE_API_BASE_URL: 'http://localhost:8080',
  VITE_WS_URL: 'ws://localhost:8080/ws/alerts',
});
