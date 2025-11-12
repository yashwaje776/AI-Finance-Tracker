import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

import User from "@/models/User";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import Budget from "@/models/Budget";

export async function POST(req) {
  try {
    await connectDB();

    const { clerkUserId, email, name, imageUrl } = await req.json();

    if (!clerkUserId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let user = await User.findOne({ clerkUserId }).populate([
      { path: "accounts" },
      { path: "transactions" },
      { path: "budgets" },
    ]);

    if (user) {
      console.log("👤 Existing user found:", user._id);
      return NextResponse.json(
        { message: "User already exists", data: user },
        { status: 200 }
      );
    }

    user = await User.create({
      clerkUserId,
      email,
      name,
      imageUrl,
    });

    console.log("🆕 New user created:", user._id);

    return NextResponse.json(
      { message: "User created successfully", data: user },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error in /api/auth/register:", error);
    return NextResponse.json(
      { error: error.message || "Server error while registering user" },
      { status: 500 }
    );
  }
}
