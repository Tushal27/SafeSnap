type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = import.meta.env.DEV as boolean;

function log(level: LogLevel, message: string, ...args: unknown[]): void {
  if (!isDev && level === 'debug') return;

  const timestamp = new Date().toISOString();
  const prefix = `[SafeSnap][${timestamp}][${level.toUpperCase()}]`;

  switch (level) {
    case 'debug':
      // eslint-disable-next-line no-console
      console.debug(prefix, message, ...args);
      break;
    case 'info':
      // eslint-disable-next-line no-console
      console.info(prefix, message, ...args);
      break;
    case 'warn':
      // eslint-disable-next-line no-console
      console.warn(prefix, message, ...args);
      break;
    case 'error':
      // eslint-disable-next-line no-console
      console.error(prefix, message, ...args);
      break;
  }
}

export const logger = {
  debug: (message: string, ...args: unknown[]) => log('debug', message, ...args),
  info: (message: string, ...args: unknown[]) => log('info', message, ...args),
  warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
  error: (message: string, ...args: unknown[]) => log('error', message, ...args),
};
