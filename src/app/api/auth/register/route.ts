import { prisma } from "@/lib/prisma";
import { Prisma, User as PrismaUser } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import type { User } from "@/types/schema";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  isExpert: z.boolean().optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, isExpert } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userData: Prisma.UserUncheckedCreateInput = {
      email,
      firstName,
      lastName,
      password: hashedPassword,
      isExpert: isExpert || false
    };

    const user = await prisma.user.create({
      data: userData
    }) as unknown as {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      isExpert: boolean;
      createdAt: Date;
      updatedAt: Date;
    };

    // If user is an expert, create expert profile
    if (isExpert) {
      await prisma.expertProfile.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          title: `${firstName} ${lastName}`,
          bio: "",
          pricePerHour: 0,
          categories: [],
          updatedAt: new Date()
        }
      });
    }

    // Map Prisma User to our application User type
    const appUser: User = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isExpert: user.isExpert,
      password: hashedPassword,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };

    return NextResponse.json(
      { user: appUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error creating user" },
      { status: 500 }
    );
  }
}
