import { create } from 'errfy';

export const handleError = (message: string) =>
  create(message, { name: 'ClizenError' });
