import { connectDB } from "@/lib/connectDB";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";

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

    const transactions = await Transaction.find({ user: userId })
      .populate("account", "name type")
      .sort({ date: -1 });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
