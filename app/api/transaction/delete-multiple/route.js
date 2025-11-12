import { NextResponse } from "next/server";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";
import User from "@/models/User";
import { connectDB } from "@/lib/connectDB";

export async function DELETE(req) {
  try {
    await connectDB();

    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Transaction IDs are required" },
        { status: 400 }
      );
    }

    const transactions = await Transaction.find({ _id: { $in: ids } });

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: "No transactions found for given IDs" },
        { status: 404 }
      );
    }

    const accountUpdates = {};
    const userUpdates = {};

    for (const t of transactions) {
      if (!accountUpdates[t.account]) accountUpdates[t.account] = 0;
      accountUpdates[t.account] += t.type === "INCOME" ? -t.amount : t.amount;

      if (!userUpdates[t.user]) userUpdates[t.user] = [];
      userUpdates[t.user].push(t._id);
    }

    for (const [accountId, balanceChange] of Object.entries(accountUpdates)) {
      const account = await Account.findById(accountId);
      if (account) {
        account.balance += balanceChange;
        account.transactions = account.transactions.filter(
          (t) => !ids.includes(t.toString())
        );
        await account.save();
      }
    }

    for (const [userId, transactionIds] of Object.entries(userUpdates)) {
      const user = await User.findById(userId);
      if (user) {
        user.transactions = user.transactions.filter(
          (t) => !transactionIds.includes(t.toString())
        );
        await user.save();
      }
    }

    await Transaction.deleteMany({ _id: { $in: ids } });

    return NextResponse.json(
      { success: true, message: "Transactions deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete multiple transactions" },
      { status: 500 }
    );
  }
}
