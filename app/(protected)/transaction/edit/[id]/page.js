"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";

export default function EditTransactionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchTransaction = async () => {
      try {
        const res = await fetch(`/api/transaction/${id}`);
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to load transaction");
        setTransaction(data.data);
      } catch (error) {
        toast.error("Failed to load transaction details.");
      }
    };

    fetchTransaction();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/transaction/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || "Failed to update transaction");

      toast.success("Transaction updated successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!transaction)
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Loading transaction...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Transaction Type
              </label>
              <Select
                value={transaction.type}
                onValueChange={(value) =>
                  setTransaction({ ...transaction, type: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">INCOME</SelectItem>
                  <SelectItem value="EXPENSE">EXPENSE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Amount</label>
              <Input
                type="number"
                value={transaction.amount}
                onChange={(e) =>
                  setTransaction({ ...transaction, amount: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Description
              </label>
              <Input
                type="text"
                value={transaction.description || ""}
                onChange={(e) =>
                  setTransaction({
                    ...transaction,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Date</label>
              <Input
                type="date"
                value={
                  transaction.date
                    ? new Date(transaction.date).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setTransaction({ ...transaction, date: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Category</label>
              <Input
                type="text"
                value={transaction.category || ""}
                onChange={(e) =>
                  setTransaction({ ...transaction, category: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Status</label>
              <Select
                value={transaction.status}
                onValueChange={(value) =>
                  setTransaction({ ...transaction, status: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Recurring Transaction
              </label>
              <Switch
                checked={transaction.isRecurring}
                onCheckedChange={(checked) =>
                  setTransaction({ ...transaction, isRecurring: checked })
                }
              />
            </div>

            {transaction.isRecurring && (
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Recurring Interval
                </label>
                <Select
                  value={transaction.recurringInterval || ""}
                  onValueChange={(value) =>
                    setTransaction({ ...transaction, recurringInterval: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
