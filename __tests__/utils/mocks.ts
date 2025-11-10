export const mockPrismaClient = {
  intention: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  member: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  meeting: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  attendance: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  notice: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  thank: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
  oneOnOne: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  membership: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

export const mockIntention = {
  id: 'clh1234567890abcdefgh',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+5511999999999',
  company: 'Tech Corp',
  message: 'I want to join the network',
  status: 'PENDING' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockMember = {
  id: 'clh9876543210zyxwvuts',
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '+5511988888888',
  company: 'Business Inc',
  position: 'CEO',
  status: 'ACTIVE' as const,
  joinedAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockMeeting = {
  id: 'clh5555555555meeting',
  title: 'Monthly Meeting',
  description: 'Regular monthly networking meeting',
  date: new Date('2024-12-01'),
  location: 'Conference Room A',
  maxAttendees: 50,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockAttendance = {
  id: 'clh7777777777attend',
  meetingId: 'clh5555555555meeting',
  memberId: 'clh9876543210zyxwvuts',
  checkedInAt: new Date('2024-12-01T10:00:00'),
  createdAt: new Date('2024-12-01T10:00:00'),
};

export const mockUser = {
  id: 'clh3333333333usertest',
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: false,
  image: null,
  role: 'MEMBER' as const,
  memberId: 'clh9876543210zyxwvuts',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const createMockRequest = (options: {
  method?: string;
  body?: any;
  params?: Record<string, string>;
  searchParams?: Record<string, string>;
  headers?: Record<string, string>;
} = {}) => {
  const url = new URL('http://localhost:3000/api/test');
  
  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const headers = new Headers(options.headers || {});
  
  return {
    method: options.method || 'GET',
    url: url.toString(),
    headers,
    json: async () => options.body,
    nextUrl: url,
  } as any;
};

export const mockNextResponse = {
  json: jest.fn((data, init) => ({
    status: init?.status || 200,
    json: async () => data,
  })),
};

export const resetAllMocks = () => {
  Object.values(mockPrismaClient).forEach((model: any) => {
    if (typeof model === 'object') {
      Object.values(model).forEach((method: any) => {
        if (typeof method === 'function' && method.mockReset) {
          method.mockReset();
        }
      });
    }
  });
};
