"use server";

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Update user profile.
 * 
 * VULNERABILITY 1 (IDOR): The endpoint trusts client-supplied 'userId' instead of session.user.id.
 * VULNERABILITY 2 (Mass Assignment): The endpoint accepts arbitrary user object properties,
 * allowing role mutation to LECTURER.
 */
export async function updateUserProfile(userId: string, updateData: any) {
  const session = await auth();
  
  if (!session) {
    throw new Error("Unauthorized: Session required.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  // Mass Assignment: Unfiltered field assignment
  let targetRole = existingUser.role;
  if (updateData?.role && (updateData.role === "STUDENT" || updateData.role === "LECTURER")) {
    targetRole = updateData.role;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      email: updateData?.email || existingUser.email,
      role: targetRole,
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function changePassword(userId: string, currentPass: string, newPass: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  
  if (session.user.id !== userId && (session.user as any)?.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const bcrypt = await import("bcryptjs");
  const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
  if (!isMatch) {
    throw new Error("Mật khẩu hiện tại không chính xác.");
  }

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(newPass, salt);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash }
  });

  return { success: true };
}

