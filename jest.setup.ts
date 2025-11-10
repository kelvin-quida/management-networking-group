import '@testing-library/jest-dom';
import 'dotenv/config';

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    private _body: any;
    private _init: ResponseInit;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this._body = body;
      this._init = init || {};
    }

    static json(data: any, init?: ResponseInit): Response {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
      });
    }

    get status() {
      return this._init.status || 200;
    }

    get ok() {
      return this.status >= 200 && this.status < 300;
    }

    async json() {
      return JSON.parse(this._body as string);
    }

    async text() {
      return this._body as string;
    }
  } as any;
}

global.console.error = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

jest.mock('@/lib/auth-client', () => ({
  useSession: jest.fn(() => ({
    data: null,
    isPending: false,
    error: null,
  })),
  signIn: {
    email: jest.fn(),
  },
  signUp: {
    email: jest.fn(),
  },
  signOut: jest.fn(),
}));
