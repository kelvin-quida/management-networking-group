import '@testing-library/jest-dom';

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.BETTER_AUTH_SECRET = 'test-secret-key-for-testing';
process.env.BETTER_AUTH_URL = 'http://localhost:3000';

global.console.error = jest.fn();
