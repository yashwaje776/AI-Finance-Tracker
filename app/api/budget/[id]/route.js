import { connectDB } from "@/lib/connectDB";
import Budget from "@/models/Budget";

export async function PUT(req, { params }) {
  await connectDB();
  const { id } =await params;
  const { amount } = await req.json();

  const updated = await Budget.findByIdAndUpdate(
    id,
    { amount },
    { new: true }
  );
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ message: "Budget updated", budget: updated });
}

export async function DELETE(req, { params }) {
  await connectDB();
  const { id } = params;
  await Budget.findByIdAndDelete(id);
  return Response.json({ message: "Budget deleted" });
}
