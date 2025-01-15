/*
  Warnings:

  - You are about to drop the `CourseBenefits` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseLinks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CoursePrerequisites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseQuestionAnswers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseQuestions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseResources` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReviewReplies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TicketReply` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tickets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VideoCompleteHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LearningPathStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'PAUSED');

-- DropForeignKey
ALTER TABLE "CourseBenefits" DROP CONSTRAINT "CourseBenefits_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseData" DROP CONSTRAINT "CourseData_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseData" DROP CONSTRAINT "CourseData_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "CourseLinks" DROP CONSTRAINT "CourseLinks_contentId_fkey";

-- DropForeignKey
ALTER TABLE "CourseModule" DROP CONSTRAINT "CourseModule_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CoursePrerequisites" DROP CONSTRAINT "CoursePrerequisites_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseQuestionAnswers" DROP CONSTRAINT "CourseQuestionAnswers_questionId_fkey";

-- DropForeignKey
ALTER TABLE "CourseQuestionAnswers" DROP CONSTRAINT "CourseQuestionAnswers_userId_fkey";

-- DropForeignKey
ALTER TABLE "CourseQuestions" DROP CONSTRAINT "CourseQuestions_contentId_fkey";

-- DropForeignKey
ALTER TABLE "CourseQuestions" DROP CONSTRAINT "CourseQuestions_userId_fkey";

-- DropForeignKey
ALTER TABLE "CourseResources" DROP CONSTRAINT "CourseResources_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_userId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewReplies" DROP CONSTRAINT "ReviewReplies_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewReplies" DROP CONSTRAINT "ReviewReplies_userId_fkey";

-- DropForeignKey
ALTER TABLE "Reviews" DROP CONSTRAINT "Reviews_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Reviews" DROP CONSTRAINT "Reviews_userId_fkey";

-- DropForeignKey
ALTER TABLE "TicketReply" DROP CONSTRAINT "TicketReply_replyId_fkey";

-- DropForeignKey
ALTER TABLE "TicketReply" DROP CONSTRAINT "TicketReply_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "Tickets" DROP CONSTRAINT "Tickets_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "VideoCompleteHistory" DROP CONSTRAINT "VideoCompleteHistory_contentId_fkey";

-- DropForeignKey
ALTER TABLE "VideoCompleteHistory" DROP CONSTRAINT "VideoCompleteHistory_userId_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "badgesEarned" TEXT[],
ADD COLUMN     "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "relatedCourses" TEXT[],
ADD COLUMN     "skillPoints" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetPasswordExpiry" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT,
ADD COLUMN     "verificationToken" TEXT;

-- DropTable
DROP TABLE "CourseBenefits";

-- DropTable
DROP TABLE "CourseData";

-- DropTable
DROP TABLE "CourseLinks";

-- DropTable
DROP TABLE "CoursePrerequisites";

-- DropTable
DROP TABLE "CourseQuestionAnswers";

-- DropTable
DROP TABLE "CourseQuestions";

-- DropTable
DROP TABLE "CourseResources";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Orders";

-- DropTable
DROP TABLE "ReviewReplies";

-- DropTable
DROP TABLE "Reviews";

-- DropTable
DROP TABLE "TicketReply";

-- DropTable
DROP TABLE "Tickets";

-- DropTable
DROP TABLE "VideoCompleteHistory";

-- CreateTable
CREATE TABLE "CourseContent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "videoLength" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseBenefit" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoursePrerequisite" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoursePrerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseReview" (
    "id" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "comment" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseQuiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "passingScore" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "timeLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseAssignment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscussionForum" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscussionForum_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseContent" ADD CONSTRAINT "CourseContent_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseContent" ADD CONSTRAINT "CourseContent_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseBenefit" ADD CONSTRAINT "CourseBenefit_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseResource" ADD CONSTRAINT "CourseResource_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseQuiz" ADD CONSTRAINT "CourseQuiz_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseAssignment" ADD CONSTRAINT "CourseAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionForum" ADD CONSTRAINT "DiscussionForum_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
