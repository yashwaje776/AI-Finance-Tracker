import { NextResponse } from "next/server";
import Budget from "@/models/Budget";
import { connectDB } from "@/lib/connectDB";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId" },
        { status: 400 }
      );
    }

    const budget = await Budget.findOne({ user: userId });
    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    console.error("Error fetching budget:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch budget" },
      { status: 500 }
    );
  }
}
