import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import Account from "@/models/Account";

export async function POST(req) {
  try {
    await connectDB();

    const { accountId, userId } = await req.json();

    if (!accountId || !userId) {
      return NextResponse.json(
        { error: "accountId and userId are required" },
        { status: 400 }
      );
    }

    await Account.updateMany({ user: userId }, { $set: { isDefault: false } });

    const updatedAccount = await Account.findByIdAndUpdate(
      accountId,
      { $set: { isDefault: true } },
      { new: true }
    );

    if (!updatedAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Default account updated successfully",
      account: updatedAccount,
    });
  } catch (err) {
    console.error("Error updating default account:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
