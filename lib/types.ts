import { Prisma } from '@prisma/client';

export type Intention = Prisma.IntentionGetPayload<object>;
export type Member = Prisma.MemberGetPayload<object>;
export type Notice = Prisma.NoticeGetPayload<object>;
export type Meeting = Prisma.MeetingGetPayload<object>;
export type Attendance = Prisma.AttendanceGetPayload<object>;
export type Thank = Prisma.ThankGetPayload<object>;
export type OneOnOne = Prisma.OneOnOneGetPayload<object>;
export type Membership = Prisma.MembershipGetPayload<object>;
export type EmailLog = Prisma.EmailLogGetPayload<object>;
export type User = Prisma.UserGetPayload<object>;

export type UserWithMember = Prisma.UserGetPayload<{
  include: {
    member: true;
  };
}>;

export type ThankWithMembers = Omit<
  Prisma.ThankGetPayload<{
    include: {
      fromMember: true;
      toMember: true;
    };
  }>,
  'value' | 'createdAt'
> & {
  value?: number;
  createdAt: string;
};

export type AttendanceWithRelations = Prisma.AttendanceGetPayload<{
  include: {
    member: true;
    meeting: true;
  };
}>;

export type MeetingWithAttendances = Prisma.MeetingGetPayload<{
  include: {
    attendances: {
      include: {
        member: true;
      };
    };
  };
}>;

export type OneOnOneWithMembers = Prisma.OneOnOneGetPayload<{
  include: {
    host: true;
    guest: true;
  };
}>;

export type MembershipWithMember = Prisma.MembershipGetPayload<{
  include: {
    member: true;
  };
}>;

export type MemberWithIntention = Prisma.MemberGetPayload<{
  include: {
    intention: true;
  };
}>;

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ApiError = {
  error: string;
  message?: string;
};

export type IntentionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type MemberStatus = 'INVITED' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type UserRole = 'ADMIN' | 'MEMBER' | 'GUEST';
