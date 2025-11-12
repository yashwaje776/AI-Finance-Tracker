import { connectDB } from "@/lib/connectDB";
import Budget from "@/models/Budget";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();
    const budgets = await Budget.find().populate("user", "email name");
    return Response.json(budgets);
  } catch (err) {
    console.error("❌ Error fetching budgets:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, amount } = body;

    if (!userId || !amount) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    let budget = await Budget.findOne({ user: userId });

    if (budget) {
      budget.amount = amount;
      await budget.save();
    } else {
      budget = await Budget.create({ user: userId, amount });

      if (!user.budgets.includes(budget._id)) {
        user.budgets.push(budget._id);
        await user.save();
      }
    }

    const updatedUser = await User.findById(userId).populate("budgets");

    return Response.json({ 
      message: "✅ Budget saved successfully", 
      budget, 
      user: updatedUser 
    });
  } catch (err) {
    console.error("❌ Error saving budget:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
