import { describe, it, expect } from 'vitest';
import { TransmissionClient } from './transmission.ts';

describe('TransmissionClient', () => {
  describe('getAuthHeader', () => {
    it('should return undefined when no credentials are provided', () => {
      const client = new TransmissionClient({
        host: 'localhost',
        port: 9091,
      });
      // @ts-ignore - accessing private method
      expect(client.getAuthHeader()).toBeUndefined();
    });

    it('should return a Basic Auth header when username and password are provided', () => {
      const client = new TransmissionClient({
        host: 'localhost',
        port: 9091,
        username: 'user',
        password: 'pass',
      });
      // @ts-ignore - accessing private method
      expect(client.getAuthHeader()).toBe('Basic dXNlcjpwYXNz');
    });

    it('should return a Basic Auth header when only username is provided', () => {
      const client = new TransmissionClient({
        host: 'localhost',
        port: 9091,
        username: 'user',
      });
      // @ts-ignore - accessing private method
      expect(client.getAuthHeader()).toBe('Basic dXNlcjo=');
    });

    it('should return a Basic Auth header when only password is provided', () => {
      const client = new TransmissionClient({
        host: 'localhost',
        port: 9091,
        password: 'pass',
      });
      // @ts-ignore - accessing private method
      expect(client.getAuthHeader()).toBe('Basic OnBhc3M=');
    });

    it('should work when credentials are provided in the URL string', () => {
      const client = new TransmissionClient('http://user:pass@localhost:9091');
      // @ts-ignore - accessing private method
      expect(client.getAuthHeader()).toBe('Basic dXNlcjpwYXNz');
    });
  });
});
