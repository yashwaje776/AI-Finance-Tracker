import { connectDB } from "@/lib/connectDB";
import User from "@/models/User";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId)
    return Response.json({ error: "Missing userId" }, { status: 400 });

  const user = await User.findById(userId)
    .populate("accounts")
    .populate("transactions")
    .populate("budgets");

  if (!user)
    return Response.json({ error: "User not found" }, { status: 404 });

  return Response.json({
    user,
    accounts: user.accounts,
    transactions: user.transactions,
    budgets: user.budgets,
  });
}
