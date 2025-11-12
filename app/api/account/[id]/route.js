import { connectDB } from "@/lib/connectDB";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Account ID is required" }), {
        status: 400,
      });
    }

    const account = await Account.findById(id)
      .populate({
        path: "transactions",
        options: { sort: { date: -1 } }, 
      })
      .lean();

    if (!account) {
      return new Response(JSON.stringify({ error: "Account not found" }), {
        status: 404,
      });
    }

    const transactionCount = account.transactions?.length || 0;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...account,
          transactionCount,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch account info" }),
      { status: 500 }
    );
  }
}
