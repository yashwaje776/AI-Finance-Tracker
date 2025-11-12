import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Account from "@/models/Account";
import User from "@/models/User";
import { connectDB } from "@/lib/connectDB";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, type, balance, isDefault, userId } = body;

    if (!name || !type || !userId) {
      return NextResponse.json(
        { error: "Name, type, and userId are required." },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const accountCount = await Account.countDocuments({ user: userId });

    let makeDefault = isDefault;
    if (accountCount === 0) {
      makeDefault = true;
    }

    if (makeDefault) {
      await Account.updateMany(
        { user: userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const numericBalance =
      typeof balance === "string" ? parseFloat(balance) : balance || 0;

    const newAccount = await Account.create({
      name,
      type,
      balance: numericBalance,
      isDefault: makeDefault,
      user: userId,
    });

    user.accounts = user.accounts || [];
    user.accounts.push(newAccount._id);
    await user.save();

    return NextResponse.json(
      {
        message: `Account created successfully${
          makeDefault ? " (set as default)" : ""
        }`,
        account: newAccount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
