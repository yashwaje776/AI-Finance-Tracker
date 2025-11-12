import { NextResponse } from "next/server";
import Budget from "@/models/Budget";
import { connectDB } from "@/lib/connectDB";

export async function POST(req) {
  try {
    await connectDB();
    const { userId, amount } = await req.json();

    if (!userId || !amount) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    let budget = await Budget.findOne({ user: userId });

    if (budget) {
      budget.amount = amount;
      await budget.save();
      return NextResponse.json({
        success: true,
        message: "Budget updated successfully",
        data: budget,
      });
    } else {
      const newBudget = await Budget.create({
        user: userId,
        amount,
      });

      return NextResponse.json({
        success: true,
        message: "Budget created successfully",
        data: newBudget,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
