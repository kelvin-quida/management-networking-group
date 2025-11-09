export const queryKeys = {
  attendances: {
    all: ['attendances'] as const,
    lists: () => [...queryKeys.attendances.all, 'list'] as const,
    list: (filters: { memberId?: string; meetingId?: string }) =>
      [...queryKeys.attendances.lists(), filters] as const,
    stats: () => [...queryKeys.attendances.all, 'stats'] as const,
    stat: (memberId: string, period?: string) =>
      [...queryKeys.attendances.stats(), memberId, period] as const,
  },

  dashboard: {
    all: ['dashboard'] as const,
    member: (memberId: string) =>
      [...queryKeys.dashboard.all, 'member', memberId] as const,
    group: () => [...queryKeys.dashboard.all, 'group'] as const,
    reports: (filters: { period?: string; from?: string; to?: string }) =>
      [...queryKeys.dashboard.all, 'reports', filters] as const,
  },

  emails: {
    all: ['emails'] as const,
    lists: () => [...queryKeys.emails.all, 'list'] as const,
    list: (limit: number) => [...queryKeys.emails.lists(), limit] as const,
  },

  intentions: {
    all: ['intentions'] as const,
    lists: () => [...queryKeys.intentions.all, 'list'] as const,
    list: (filters: { status?: string; page?: number; limit?: number }) =>
      [...queryKeys.intentions.lists(), filters] as const,
  },

  meetings: {
    all: ['meetings'] as const,
    lists: () => [...queryKeys.meetings.all, 'list'] as const,
    list: (filters: { from?: string; to?: string }) =>
      [...queryKeys.meetings.lists(), filters] as const,
    details: () => [...queryKeys.meetings.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.meetings.details(), id] as const,
  },

  members: {
    all: ['members'] as const,
    lists: () => [...queryKeys.members.all, 'list'] as const,
    list: (filters: { status?: string; page?: number; limit?: number }) =>
      [...queryKeys.members.lists(), filters] as const,
    details: () => [...queryKeys.members.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.members.details(), id] as const,
    validateToken: (token: string) =>
      [...queryKeys.members.all, 'validate-token', token] as const,
  },

  memberships: {
    all: ['memberships'] as const,
    lists: () => [...queryKeys.memberships.all, 'list'] as const,
    list: (filters: { memberId?: string; status?: string }) =>
      [...queryKeys.memberships.lists(), filters] as const,
    details: () => [...queryKeys.memberships.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.memberships.details(), id] as const,
  },

  notices: {
    all: ['notices'] as const,
    lists: () => [...queryKeys.notices.all, 'list'] as const,
    list: (filters: { type?: string; active?: boolean }) =>
      [...queryKeys.notices.lists(), filters] as const,
    details: () => [...queryKeys.notices.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.notices.details(), id] as const,
  },

  oneOnOnes: {
    all: ['one-on-ones'] as const,
    lists: () => [...queryKeys.oneOnOnes.all, 'list'] as const,
    list: (filters: { memberId?: string; status?: string }) =>
      [...queryKeys.oneOnOnes.lists(), filters] as const,
    details: () => [...queryKeys.oneOnOnes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.oneOnOnes.details(), id] as const,
  },

  thanks: {
    all: ['thanks'] as const,
    lists: () => [...queryKeys.thanks.all, 'list'] as const,
    list: (filters: { memberId?: string }) =>
      [...queryKeys.thanks.lists(), filters] as const,
    details: () => [...queryKeys.thanks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.thanks.details(), id] as const,
  },
} as const;
