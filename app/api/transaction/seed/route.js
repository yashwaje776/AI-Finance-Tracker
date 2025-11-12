import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import Account from "@/models/Account";
import { connectDB } from "@/lib/connectDB";

export async function POST(req) {
  try {
    await connectDB();
    const count=10;
    const userId="690ba313d1101c01e14462c7";
    const accountId="690ba469d1101c01e14462dc";    
    if (!userId || !accountId) {
      return NextResponse.json(
        { error: "userId and accountId are required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    const account = await Account.findById(accountId);

    if (!user || !account) {
      return NextResponse.json(
        { error: "Invalid user or account ID" },
        { status: 404 }
      );
    }

    const categories = ["Food", "Travel", "Salary", "Shopping", "Bills", "Rent"];
    const descriptions = [
      "Payment received",
      "Purchase made",
      "Bill paid",
      "Groceries bought",
      "Service charge",
    ];

    const dummyTransactions = Array.from({ length: count }).map(() => {
      const type = Math.random() > 0.5 ? "INCOME" : "EXPENSE";
      const amount = parseFloat((Math.random() * 5000 + 100).toFixed(2));
      const category =
        type === "INCOME"
          ? "Salary"
          : categories[Math.floor(Math.random() * categories.length)];
      const description =
        descriptions[Math.floor(Math.random() * descriptions.length)];
      const date = new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      );

      return {
        type,
        amount,
        description,
        category,
        date,
        user: userId,
        account: accountId,
        status: "COMPLETED",
        isRecurring: false,
      };
    });

    const createdTransactions = await Transaction.insertMany(dummyTransactions);

    const transactionIds = createdTransactions.map((t) => t._id);

    await Account.findByIdAndUpdate(accountId, {
      $push: { transactions: { $each: transactionIds } },
    });

    await User.findByIdAndUpdate(userId, {
      $push: { transactions: { $each: transactionIds } },
    });

    return NextResponse.json({
      message: `${createdTransactions.length} dummy transactions created successfully.`,
      data: createdTransactions,
    });
    
  } catch (error) {
    console.error("Error creating dummy transactions:", error);
    return NextResponse.json(
      { error: "Failed to create dummy transactions" },
      { status: 500 }
    );
  }
}
