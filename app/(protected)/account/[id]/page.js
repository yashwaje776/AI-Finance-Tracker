"use client";

import React, {use, useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { Suspense } from "react";
import { AccountChart } from "./_components/AccountChart";
import { TransactionTable } from "./_components/TransactionTable";
import toast from "react-hot-toast";

export default function AccountPage({ params }) {
  const { id } = use(params); 

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAccount = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/account/${id}`, { cache: "no-store" });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to load account");
      }

      setAccount(result.data);
      toast.success("Account loaded successfully!");
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchAccount();
  }, [id]);

  const displayBalance =
    account &&
    typeof account.balance === "object" &&
    account.balance !== null &&
    "$numberDecimal" in account.balance
      ? parseFloat(account.balance.$numberDecimal)
      : Number(account?.balance || 0);

  if (loading)
    return (
      <div className="p-4">
        <BarLoader width="100%" color="#9333ea" />
      </div>
    );

  if (error)
    return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8 px-5">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
          </p>
        </div>

        <div className="text-left sm:text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ₹{displayBalance.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">
            {account.transactions?.length || 0} Transactions
          </p>
        </div>
      </div>

      <Suspense
        fallback={<BarLoader className="mt-4" width="100%" color="#9333ea" />}
      >
        <AccountChart transactions={account.transactions} />
      </Suspense>

      <Suspense
        fallback={<BarLoader className="mt-4" width="100%" color="#9333ea" />}
      >
        <TransactionTable transactions={account.transactions} />
      </Suspense>
    </div>
  );
}
