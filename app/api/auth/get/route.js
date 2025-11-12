import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import User from "@/models/User";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import Budget from "@/models/Budget";

export async function POST(req) {
  try {
    await connectDB();
    const { clerkUserId } = await req.json();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Missing Clerk User ID" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ clerkUserId })
      .populate("accounts")
      .populate("transactions")
      .populate("budgets");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User fetched successfully", data: user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
