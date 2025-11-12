import { NextResponse } from "next/server";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";
import User from "@/models/User";
import { connectDB } from "@/lib/connectDB";
export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const transaction = await Transaction.findById(id)
      .populate("account", "name balance")
      .populate("user", "name email");

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      type,
      amount,
      description,
      date,
      category,
      isRecurring,
      recurringInterval,
      status,
    } = body;

    const existingTransaction = await Transaction.findById(id);
    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const oldAmount = existingTransaction.amount;
    const oldType = existingTransaction.type;

    existingTransaction.type = type ?? existingTransaction.type;
    existingTransaction.amount = amount ?? existingTransaction.amount;
    existingTransaction.description =
      description ?? existingTransaction.description;
    existingTransaction.date = date ?? existingTransaction.date;
    existingTransaction.category = category ?? existingTransaction.category;
    existingTransaction.isRecurring =
      isRecurring ?? existingTransaction.isRecurring;
    existingTransaction.recurringInterval =
      recurringInterval ?? existingTransaction.recurringInterval;
    existingTransaction.status = status ?? existingTransaction.status;

    if (
      existingTransaction.isRecurring &&
      existingTransaction.recurringInterval
    ) {
      const now = new Date();
      existingTransaction.lastProcessed = now;

      const next = new Date(now);
      switch (existingTransaction.recurringInterval) {
        case "DAILY":
          next.setDate(next.getDate() + 1);
          break;
        case "WEEKLY":
          next.setDate(next.getDate() + 7);
          break;
        case "MONTHLY":
          next.setMonth(next.getMonth() + 1);
          break;
        case "YEARLY":
          next.setFullYear(next.getFullYear() + 1);
          break;
      }
      existingTransaction.nextRecurringDate = next;
    }

    await existingTransaction.save();

    const account = await Account.findById(existingTransaction.account);
    if (account) {
      if (oldType === "INCOME") account.balance -= oldAmount;
      else if (oldType === "EXPENSE") account.balance += oldAmount;

      if (existingTransaction.type === "INCOME")
        account.balance += existingTransaction.amount;
      else if (existingTransaction.type === "EXPENSE")
        account.balance -= existingTransaction.amount;

      await account.save();
    }

    return NextResponse.json({
      success: true,
      message: "Transaction updated successfully",
      data: existingTransaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const account = await Account.findById(transaction.account);
    const user = await User.findById(transaction.user);

    if (account) {
      if (transaction.type === "INCOME") {
        account.balance -= transaction.amount;
      } else if (transaction.type === "EXPENSE") {
        account.balance += transaction.amount;
      }

      account.transactions = account.transactions.filter(
        (t) => t.toString() !== id
      );
      await account.save();
    }

    if (user) {
      user.transactions = user.transactions.filter((t) => t.toString() !== id);
      await user.save();
    }

    await Transaction.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Transaction deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
