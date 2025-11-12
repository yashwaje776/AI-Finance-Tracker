"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { AccountCard } from "./_components/account-card";
import CreateAccountForm from "@/components/CreateAccountForm";
import DashboardOverview from "./_components/transaction-overview";
import BudgetProgress from "./_components/budget-progress";
import { useUser } from "@clerk/nextjs";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setLoading, setError } from "@/store/features/userSlice";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user, isLoaded, isSignedIn } = useUser();
  const reduxUser = useSelector((state) => state.user.user);

  const [accounts, setAccounts] = useState([]);
  const [budget, setBudget] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLocalLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const registerUser = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          dispatch(setLoading(true));

          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clerkUserId: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              name: user.fullName,
              imageUrl: user.imageUrl,
            }),
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "User registration failed");
          }

          const data = await res.json();
          dispatch(setUser(data.data));
          toast.success("User registered successfully");
        } catch (error) {
          dispatch(setError(error.message));
          toast.error("Failed to register user");
        } finally {
          dispatch(setLoading(false));
        }
      }
    };

    registerUser();
  }, [isLoaded, isSignedIn, user, dispatch]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!reduxUser?._id) return;
      try {
        setLocalLoading(true);

        const [accRes, budRes, transRes] = await Promise.all([
          fetch(`/api/account/get?userId=${reduxUser._id}`),
          fetch(`/api/budget/get?userId=${reduxUser._id}`),
          fetch(`/api/transaction/get?userId=${reduxUser._id}`),
        ]);

        if (!accRes.ok || !budRes.ok || !transRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const accData = await accRes.json();
        const budData = await budRes.json();
        const transData = await transRes.json();

        setAccounts(accData.data || []);
        setBudget(budData.data || null);
        setTransactions(transData.data || []);
        toast.success("Dashboard data loaded");
      } catch {
        toast.error("Error loading dashboard data");
      } finally {
        setLocalLoading(false);
      }
    };

    fetchDashboardData();
  }, [reduxUser]);

  const handleDefaultChange = async (accountId) => {
    try {
      setUpdating(true);

      const res = await fetch("/api/account/set-default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, userId: reduxUser._id }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update default");

      setAccounts((prev) =>
        prev.map((acc) => ({
          ...acc,
          isDefault: acc._id === accountId,
        }))
      );
      toast.success("Default account updated");
    } catch {
      toast.error("Failed to set default account");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !reduxUser) {
    return (
      <p className="text-center text-muted-foreground py-10">
        Loading your dashboard...
      </p>
    );
  }

  const currentMonthExpenses = transactions
    .filter((t) => {
      if (t.type !== "EXPENSE") return false;
      const transactionDate = new Date(t.date);
      const now = new Date();
      return (
        transactionDate.getFullYear() === now.getFullYear() &&
        transactionDate.getMonth() === now.getMonth()
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-8 p-4">
      <BudgetProgress
        initialBudget={budget}
        currentExpenses={currentMonthExpenses}
      />

      <DashboardOverview accounts={accounts} transactions={transactions} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountForm>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed bg-white">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountForm>

        {accounts.length > 0 ? (
          accounts.map((account) => (
            <AccountCard
              key={account._id}
              account={account}
              onDefaultChange={() => handleDefaultChange(account._id)}
              disabled={updating}
            />
          ))
        ) : (
          <p className="text-muted-foreground text-sm col-span-full text-center">
            No accounts found. Add a new one to get started.
          </p>
        )}
      </div>
    </div>
  );
}
