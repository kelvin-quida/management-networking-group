CREATE TYPE "IntentionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "MemberStatus" AS ENUM ('INVITED', 'ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE "NoticeType" AS ENUM ('INFO', 'WARNING', 'URGENT', 'EVENT');
CREATE TYPE "NoticePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');
CREATE TYPE "MeetingType" AS ENUM ('REGULAR', 'SPECIAL', 'TRAINING', 'SOCIAL');
CREATE TYPE "OneOnOneStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

CREATE TABLE
CREATE TABLE "Intention" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "status" "IntentionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intention_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "position" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "birthDate" TIMESTAMP(3),
    "status" "MemberStatus" NOT NULL DEFAULT 'INVITED',
    "inviteToken" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3) NOT NULL,
    "intentionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "NoticeType" NOT NULL DEFAULT 'INFO',
    "priority" "NoticePriority" NOT NULL DEFAULT 'NORMAL',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "type" "MeetingType" NOT NULL DEFAULT 'REGULAR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Thank" (
    "id" TEXT NOT NULL,
    "fromMemberId" TEXT NOT NULL,
    "toMemberId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "value" DECIMAL(10,2),
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Thank_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OneOnOne" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" "OneOnOneStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OneOnOne_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "token" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Intention_email_key" ON "Intention"("email");
CREATE INDEX "Intention_status_idx" ON "Intention"("status");
CREATE INDEX "Intention_email_idx" ON "Intention"("email");

CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
CREATE UNIQUE INDEX "Member_inviteToken_key" ON "Member"("inviteToken");
CREATE UNIQUE INDEX "Member_intentionId_key" ON "Member"("intentionId");

CREATE INDEX "Member_status_idx" ON "Member"("status");
CREATE INDEX "Member_email_idx" ON "Member"("email");

CREATE INDEX "Notice_publishedAt_idx" ON "Notice"("publishedAt");
CREATE INDEX "Notice_type_idx" ON "Notice"("type");

CREATE INDEX "Meeting_date_idx" ON "Meeting"("date");
CREATE INDEX "Attendance_memberId_idx" ON "Attendance"("memberId");
CREATE INDEX "Attendance_meetingId_idx" ON "Attendance"("meetingId");
CREATE UNIQUE INDEX "Attendance_memberId_meetingId_key" ON "Attendance"("memberId", "meetingId");

CREATE INDEX "Thank_fromMemberId_idx" ON "Thank"("fromMemberId");
CREATE INDEX "Thank_toMemberId_idx" ON "Thank"("toMemberId");
CREATE INDEX "Thank_createdAt_idx" ON "Thank"("createdAt");
CREATE INDEX "Thank_toMemberId_idx" ON "Thank"("toMemberId");

CREATE INDEX "Thank_createdAt_idx" ON "Thank"("createdAt");

CREATE INDEX "OneOnOne_hostId_idx" ON "OneOnOne"("hostId");
CREATE INDEX "OneOnOne_guestId_idx" ON "OneOnOne"("guestId");

CREATE INDEX "OneOnOne_scheduledAt_idx" ON "OneOnOne"("scheduledAt");

CREATE INDEX "OneOnOne_status_idx" ON "OneOnOne"("status");

CREATE INDEX "Membership_memberId_idx" ON "Membership"("memberId");

CREATE INDEX "Membership_dueDate_idx" ON "Membership"("dueDate");

CREATE INDEX "Membership_status_idx" ON "Membership"("status");

CREATE INDEX "EmailLog_sentAt_idx" ON "EmailLog"("sentAt");

ALTER TABLE "Member" ADD CONSTRAINT "Member_intentionId_fkey" FOREIGN KEY ("intentionId") REFERENCES "Intention"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Thank" ADD CONSTRAINT "Thank_fromMemberId_fkey" FOREIGN KEY ("fromMemberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Thank" ADD CONSTRAINT "Thank_toMemberId_fkey" FOREIGN KEY ("toMemberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OneOnOne" ADD CONSTRAINT "OneOnOne_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OneOnOne" ADD CONSTRAINT "OneOnOne_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Membership" ADD CONSTRAINT "Membership_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
