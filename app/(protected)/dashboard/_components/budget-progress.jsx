"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Pencil, Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function BudgetProgress({ initialBudget, currentExpenses }) {
  const userId = useSelector((state) => state.user.user?._id);

  const [budget, setBudget] = useState(initialBudget?.amount || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const percentUsed = budget > 0 ? (currentExpenses / budget) * 100 : 0;

  const getProgressColor = () => {
    if (percentUsed < 50) return "bg-green-500";
    if (percentUsed < 75) return "bg-yellow-400";
    if (percentUsed < 90) return "bg-orange-500";
    return "bg-red-600";
  };

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!userId) {
      toast.error("User ID missing. Please log in first.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, userId }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update budget");

      setBudget(amount);
      toast.success("Budget saved successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save budget");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNewBudget(budget.toString());
    setIsEditing(false);
  };

  useEffect(() => {
    if (initialBudget?.amount) {
      setBudget(initialBudget.amount);
      setNewBudget(initialBudget.amount.toString());
    }
  }, [initialBudget]);

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-sm font-medium">
            Monthly Budget (Default Account)
          </CardTitle>

          <div className="flex items-center gap-2 mt-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-32"
                  placeholder="Enter amount"
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription>
                  ₹{currentExpenses.toFixed(2)} of ₹{budget.toFixed(2)} spent
                </CardDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {budget > 0 && (
          <div className="space-y-2">
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-3 ${getProgressColor()} transition-all duration-700 ease-in-out`}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground text-right">
              {percentUsed.toFixed(1)}% used
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
