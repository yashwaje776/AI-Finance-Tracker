import { NextResponse } from "next/server";
import Account from "@/models/Account"; 
import { connectDB } from "@/lib/connectDB";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    console.log("Fetching accounts for userId:", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const accounts = await Account.find({ user:userId }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (err) {
    console.error("Error fetching accounts:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
