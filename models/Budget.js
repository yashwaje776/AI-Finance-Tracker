import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    lastAlertSent: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

const Budget = mongoose.models.Budget || mongoose.model("Budget", budgetSchema);
export default Budget;
