import { NextResponse } from "next/server";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";
import User from "@/models/User";
import { connectDB } from "@/lib/connectDB";

export async function POST(req) {
  try {
    console.log("🔹 Incoming POST /api/transaction request...");
    await connectDB();
    console.log("✅ Database connected successfully");

    const body = await req.json();
    console.log("📦 Request body received:", body);

    const {
      user,
      account,
      type,
      amount,
      description,
      date,
      category,
      isRecurring,
      recurringInterval,
    } = body;

    if (!user || !account) {
      console.warn("⚠️ Missing user or account:", { user, account });
      return NextResponse.json(
        { error: "User and Account are required" },
        { status: 400 }
      );
    }

    if (!type || !amount || !date || !category) {
      console.warn("⚠️ Missing required fields:", {
        type,
        amount,
        date,
        category,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let nextRecurringDate = null;
    const lastProcessed = new Date(date);

    if (isRecurring && recurringInterval) {
      const d = new Date(date);
      switch (recurringInterval) {
        case "DAILY":
          d.setDate(d.getDate() + 1);
          break;
        case "WEEKLY":
          d.setDate(d.getDate() + 7);
          break;
        case "MONTHLY":
          d.setMonth(d.getMonth() + 1);
          break;
        case "YEARLY":
          d.setFullYear(d.getFullYear() + 1);
          break;
      }
      nextRecurringDate = d;
    }

    console.log("🧾 Creating new transaction...");
    const newTransaction = await Transaction.create({
      type,
      amount,
      description,
      date,
      category,
      isRecurring,
      recurringInterval,
      lastProcessed,
      nextRecurringDate,
      user,
      account,
    });

    console.log("✅ Transaction created successfully:", newTransaction._id);

    console.log("🔁 Updating user and account transaction lists...");
    await Promise.all([
      User.findByIdAndUpdate(user, {
        $push: { transactions: newTransaction._id },
      }),
      Account.findByIdAndUpdate(account, {
        $push: { transactions: newTransaction._id },
      }),
    ]);

    // 💰 Update account balance
    const userAccount = await Account.findById(account);
    if (!userAccount) {
      console.error("❌ Account not found for ID:", account);
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    console.log("💰 Updating account balance. Current:", userAccount.balance);

    if (type === "INCOME") {
      userAccount.balance += Number(amount);
    } else if (type === "EXPENSE") {
      userAccount.balance -= Number(amount);
    }

    await userAccount.save();
    console.log(
      "✅ Account balance updated successfully:",
      userAccount.balance
    );

    // 🎯 Return response
    return NextResponse.json(
      {
        message: "✅ Transaction created and account updated successfully",
        data: newTransaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating transaction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create transaction" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("🔹 Incoming GET /api/transaction request...");
    await connectDB();
    console.log("✅ Database connected successfully");

    const transactions = await Transaction.find()
      .populate("user account")
      .sort({ date: -1 });

    console.log(`📦 Retrieved ${transactions.length} transactions`);
    return NextResponse.json({ data: transactions });
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

