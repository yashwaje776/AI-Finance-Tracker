"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@clerk/nextjs";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "@/store/features/userSlice";

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"], {
    required_error: "Transaction type is required",
  }),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  description: z.string().min(3, "Description must be at least 3 characters"),
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
  accountId: z.string().min(1, "Account selection is required"),
  isRecurring: z.boolean().default(false),
  recurringInterval: z
    .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
    .optional(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]).default("COMPLETED"),
});

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const dispatch = useDispatch();

  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!isLoaded || !isSignedIn || !clerkUser?.id) return;

      try {
        const res = await fetch("/api/auth/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerkUserId: clerkUser.id }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch user info");

        dispatch(setUser(data.data));
        console.log("✅ User info loaded:", data.data);
      } catch (err) {
        console.error("❌ Error fetching user info:", err);
      }
    };

    fetchUserInfo();
  }, [isLoaded, isSignedIn, clerkUser, dispatch]);

  const userId = user?._id;
  const accounts = user?.accounts || [];
  const defaultAccount = accounts.find((acc) => acc.isDefault);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      isRecurring: false,
      status: "COMPLETED",
    },
  });

  const isRecurring = watch("isRecurring");

  useEffect(() => {
    if (defaultAccount) {
      setValue("accountId", defaultAccount._id);
      setSelectedAccount(defaultAccount);
    }
  }, [defaultAccount, setValue]);

  const handleScanReceipt = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setScanning(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/transaction/scan-receipt", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      console.log("🔹 Raw API response:", text);

      if (!res.ok) throw new Error(`Server error: ${text}`);

      const data = JSON.parse(text);
      console.log("✅ Parsed receipt data:", data);
      setValue("type", "EXPENSE");
      if (data.amount) setValue("amount", data.amount.toString());
      if (data.description) setValue("description", data.description);
      if (data.category) setValue("category", data.category);
      if (data.date) setValue("date", data.date);

      alert("✅ Receipt scanned successfully! Fields auto-filled.");
    } catch (err) {
      console.error("❌ Error scanning receipt:", err);
      alert("❌ Failed to scan receipt. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const onSubmit = async (data) => {
    if (!userId) {
      alert("⚠️ User not found. Please log in first.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        user: userId,
        account: data.accountId,
      };

      const res = await fetch("/api/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || "Failed to create transaction");

      setTransactions((prev) => [...prev, result.data]);
      reset();
      setSelectedAccount(defaultAccount || null);
      alert("✅ Transaction created successfully!");
    } catch (error) {
      console.error(error);
      alert("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <label htmlFor="receipt-upload">
              <Button asChild variant="outline" disabled={scanning}>
                <span>{scanning ? "🔄 Scanning..." : "📸 Scan Receipt"}</span>
              </Button>
            </label>
            <input
              id="receipt-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleScanReceipt}
            />
          </div>

          {scanning && (
            <p className="text-blue-600 text-center mb-2 animate-pulse">
              🔍 Extracting data from your receipt...
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Select Account
              </label>
              <div className="flex items-center justify-between gap-3">
                <Select
                  onValueChange={(value) => {
                    setValue("accountId", value);
                    const account = accounts.find((a) => a._id === value);
                    setSelectedAccount(account || null);
                  }}
                  defaultValue={defaultAccount?._id}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc._id} value={acc._id}>
                        {acc.name}
                        {acc.isDefault && " 🌟"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedAccount && (
                  <div className="text-sm font-medium text-green-700 whitespace-nowrap">
                    💰 ₹{selectedAccount.balance}
                  </div>
                )}
              </div>

              {errors.accountId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.accountId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Transaction Type
              </label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue="EXPENSE"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">INCOME</SelectItem>
                  <SelectItem value="EXPENSE">EXPENSE</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Amount</label>
              <Input
                type="number"
                placeholder="Enter amount"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Description
              </label>
              <Input
                type="text"
                placeholder="Enter description"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Date</label>
              <Input type="date" {...register("date")} />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Category</label>
              <Input
                type="text"
                placeholder="e.g., Food, Salary, Rent"
                {...register("category")}
              />
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Recurring Transaction
              </label>
              <Switch
                checked={isRecurring}
                onCheckedChange={(checked) => setValue("isRecurring", checked)}
              />
            </div>

            {isRecurring && (
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Recurring Interval
                </label>
                <Select
                  onValueChange={(value) =>
                    setValue("recurringInterval", value)
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
              {loading ? "Saving..." : "Add Transaction"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
