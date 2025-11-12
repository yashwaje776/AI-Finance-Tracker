import inngest from "./client";
import mongoose from "mongoose";
import Budget from "@/models/Budget";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import Account from "@/models/Account";
import { connectDB } from "@/lib/connectDB";
import { sendEmail } from "../send-mail";
import EmailTemplate from "@/emails/template";
import { GoogleGenerativeAI } from "@google/generative-ai";

function isTransactionDue(transaction) {
  if (!transaction.lastProcessed) return true;
  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);
  return nextDue <= today;
}

function calculateNextRecurringDate(date, interval) {
  const next = new Date(date);
  switch (interval) {
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
  return next;
}

function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}
export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    throttle: {
      limit: 10,
      period: "1m",
      key: "event.data.userId",
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    console.log("🚀 Starting recurring transaction process...");

    await connectDB();
    console.log("✅ MongoDB connected successfully");

    const { transactionId, userId } = event?.data || {};
    if (!transactionId || !userId) {
      console.error("❌ Missing required event data:", event);
      return { error: "Missing required event data" };
    }

    await step.run("process-transaction", async () => {
      console.log(`🔍 Fetching transaction ID: ${transactionId}`);

      const transaction = await Transaction.findOne({
        _id: transactionId,
        user: userId,
      }).populate("account");

      if (!transaction) {
        console.log("⚠️ Transaction not found, skipping...");
        return;
      }

      if (!isTransactionDue(transaction)) {
        console.log("⏸ Transaction not yet due. Skipping...");
        return;
      }

      console.log(`💸 Processing recurring transaction for user: ${userId}`);
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const [newTransaction] = await Transaction.create(
          [
            {
              type: transaction.type,
              amount: transaction.amount,
              description: `${transaction.description} (Recurring)`,
              date: new Date(),
              category: transaction.category,
              user: transaction.user,
              account: transaction.account,
              isRecurring: false,
              status: "COMPLETED",
            },
          ],
          { session }
        );

        console.log("🧾 New recurring transaction created:", newTransaction._id);

        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount
            : transaction.amount;

        await Account.findByIdAndUpdate(
          transaction.account._id,
          {
            $inc: { balance: balanceChange },
            $push: { transactions: newTransaction._id }, 
          },
          { session }
        );

        await User.findByIdAndUpdate(
          transaction.user,
          {
            $push: { transactions: newTransaction._id },
          },
          { session }
        );

        await Transaction.findByIdAndUpdate(
          transaction._id,
          {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
          { session }
        );

        await session.commitTransaction();
        session.endSession();

        console.log("✅ Recurring transaction processed successfully!");
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("❌ Error while processing recurring transaction:", error);
      }
    });
  }
);


export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" }, // runs daily at midnight UTC
  async ({ step }) => {
    await connectDB();

    const nowUTC = new Date();
    console.log("🕒 Trigger executed at (UTC):", nowUTC.toISOString());

    // Helper to safely format a date-like value
    const fmt = (val) => {
      if (!val) return "null";
      try {
        const d = val instanceof Date ? val : new Date(val);
        if (isNaN(d.getTime())) return String(val);
        return d.toISOString();
      } catch (e) {
        return String(val);
      }
    };

    // debug: list all recurring txs (helps verify DB values)
    const all = await Transaction.find({ isRecurring: true });
    console.log("📋 All recurring transactions (count):", all.length);
    all.forEach((tx) => {
      console.log(
        `- ${tx._id}: nextRecurringDate=${fmt(tx.nextRecurringDate)} | lastProcessed=${fmt(tx.lastProcessed)} | status=${tx.status}`
      );
    });

    // fetch only due recurring transactions
    const recurringTx = await step.run("fetch-recurring", async () => {
      return await Transaction.find({
        isRecurring: true,
        // case-insensitive completed
        status: { $regex: /^completed$/i },
        $or: [{ lastProcessed: null }, { nextRecurringDate: { $lte: nowUTC } }],
      });
    });

    console.log("✅ Found recurringTx count:", recurringTx.length);

    if (recurringTx.length === 0) {
      console.log("ℹ️ No recurring transactions to trigger today.");
      return { triggered: 0 };
    }

    recurringTx.forEach((tx) => {
      console.log(
        `⚡ Triggering transaction: id=${tx._id} desc="${tx.description}" nextRecurringDate=${fmt(tx.nextRecurringDate)} user=${tx.user}`
      );
    });

    const events = recurringTx.map((tx) => ({
      name: "transaction.recurring.process",
      data: {
        transactionId: tx._id,
        userId: tx.user,
      },
    }));

    await inngest.send(events);
    console.log(`🚀 Sent ${recurringTx.length} recurring transaction events.`);

    return { triggered: recurringTx.length };
  }
);

async function generateFinancialInsights(stats, month) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: ₹${stats.totalIncome}
    - Total Expenses: ₹${stats.totalExpenses}
    - Net Income: ₹${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" },
  async ({ step }) => {
    console.log("📊 Generating monthly reports...");

    await connectDB();
    console.log("✅ MongoDB connected successfully");

    const users = await step.run("fetch-users", async () => {
      const data = await User.find().populate("accounts");
      console.log(`👥 Found ${data.length} users`);
      return data;
    });

    for (const user of users) {
      console.log(`📄 Generating report for ${user.name}`);
      await step.run(`generate-report-${user._id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const stats = await getMonthlyStats(user._id, lastMonth);
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });

        const insights = await generateFinancialInsights(stats, monthName);

        console.log(`📧 Sending monthly report email to ${user.email}`);
        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: EmailTemplate({
            userName: user.name,
            type: "monthly-report",
            data: {
              stats,
              month: monthName,
              insights,
            },
          }),
        });
        console.log("✅ Monthly report email sent successfully!");
      });
    }

    return { processed: users.length };
  }
);

async function getMonthlyStats(userId, month) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate },
  });

  return transactions.reduce(
    (stats, t) => {
      const amount = t.amount;
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
}

export const checkBudgetAlerts = inngest.createFunction(
  { name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" },

  async ({ step }) => {
    console.log("🚨 Running budget alert check...");

    await connectDB();
    console.log("✅ MongoDB connected successfully");

    const budgets = await step.run("fetch-budgets", async () => {
      const data = await Budget.find()
        .populate({
          path: "user",
          populate: { path: "accounts", match: { isDefault: true } },
        })
        .lean();
      console.log(`📊 Found ${data.length} budgets to check`);
      return data;
    });

    for (const budget of budgets) {
      const user = budget.user;
      if (!user || !user.accounts?.length) continue;

      const defaultAccount = user.accounts[0];
      console.log(
        `👤 Checking budget for ${user.name} (${defaultAccount.name})`
      );

      const startDate = new Date();
      startDate.setDate(1);

      await step.run(`check-budget-${budget._id}`, async () => {
        const expenses = await Transaction.aggregate([
          {
            $match: {
              user: new mongoose.Types.ObjectId(user._id),
              account: new mongoose.Types.ObjectId(defaultAccount._id),
              type: "EXPENSE",
              date: { $gte: startDate },
            },
          },
          { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
        ]);

        const totalExpenses = expenses[0]?.totalAmount || 0;
        const percentageUsed =
          budget.amount > 0 ? (totalExpenses / budget.amount) * 100 : 0;

        console.log(
          `📈 Budget: ₹${budget.amount}, Spent: ₹${totalExpenses}, Used: ${percentageUsed.toFixed(1)}%`
        );

        if (
          percentageUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()))
        ) {
          console.log("🚨 Sending budget alert email...");
          await sendEmail({
            to: user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: EmailTemplate({
              userName: user.name,
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount: parseInt(budget.amount).toFixed(1),
                totalExpenses: parseInt(totalExpenses).toFixed(1),
                accountName: defaultAccount.name,
              },
            }),
          });

          console.log("✅ Email sent successfully!");
          await Budget.findByIdAndUpdate(budget._id, {
            lastAlertSent: new Date(),
          });
          console.log("🕒 Updated lastAlertSent in DB");
        } else {
          console.log("✅ No alert triggered this cycle.");
        }
      });
    }

    console.log("🎉 Budget alert check completed successfully!");
  }
);
