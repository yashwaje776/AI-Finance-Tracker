"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  Trash,
} from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 5;

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const categoryColors = {
  Salary: "#22c55e",
  Food: "#ef4444",
  Utilities: "#3b82f6",
  "Side Income": "#eab308",
};

const fallbackColors = [
  "#a855f7",
  "#f97316",
  "#06b6d4",
  "#ec4899",
  "#10b981",
];

function getCategoryColor(category) {
  if (categoryColors[category]) return categoryColors[category];
  const index = [...category].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return fallbackColors[index % fallbackColors.length];
}

export function TransactionTable({ transactions: initialTransactions = [] }) {
  const router = useRouter();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  function parseBalance(balance) {
    if (balance == null) return 0;
    if (typeof balance === "number") return balance;
    if (typeof balance === "string") {
      const n = Number(balance);
      return isNaN(n) ? 0 : n;
    }
    if (typeof balance === "object") {
      if ("$numberDecimal" in balance) {
        const n = parseFloat(balance.$numberDecimal);
        return isNaN(n) ? 0 : n;
      }
      const n = Number(balance.toString && balance.toString());
      return isNaN(n) ? 0 : n;
    }
    return 0;
  }

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((t) =>
        t.description?.toLowerCase().includes(searchLower)
      );
    }

    if (typeFilter) {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (recurringFilter) {
      result = result.filter((t) =>
        recurringFilter === "recurring" ? t.isRecurring : !t.isRecurring
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = parseBalance(a.amount) - parseBalance(b.amount);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  const totalPages = Math.ceil(
    filteredAndSortedTransactions.length / ITEMS_PER_PAGE
  );

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedTransactions, currentPage]);

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id, checked) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(paginatedTransactions.map((t) => t._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;
    const res = await fetch(`/api/transaction/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      toast.success("Transaction deleted successfully!");
    } else {
      toast.error(data.error || "Failed to delete transaction");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm("Are you sure you want to delete selected items?"))
      return;

    const res = await fetch(`/api/transaction/delete-multiple`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });

    const data = await res.json();

    if (res.ok) {
      setTransactions((prev) =>
        prev.filter((t) => !selectedIds.includes(t._id))
      );
      setSelectedIds([]);
      toast.success("Selected transactions deleted successfully!");
    } else {
      toast.error(data.error || "Failed to delete selected transactions");
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transactions</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setTransactions(initialTransactions);
            toast.success("Transaction list reset!");
          }}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recurringFilter}
            onValueChange={(v) => {
              setRecurringFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete Selected ({selectedIds.length})
            </Button>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <Button variant="outline" size="icon" onClick={handleClearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedIds.length === paginatedTransactions.length &&
                    paginatedTransactions.length > 0
                  }
                  onCheckedChange={(checked) => handleSelectAll(checked)}
                />
              </TableHead>
              <TableHead
                onClick={() => handleSort("date")}
                className="cursor-pointer"
              >
                Date{" "}
                {sortConfig.field === "date" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="inline h-4 w-4" />
                  ) : (
                    <ChevronDown className="inline h-4 w-4" />
                  ))}
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                onClick={() => handleSort("category")}
                className="cursor-pointer"
              >
                Category{" "}
                {sortConfig.field === "category" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="inline h-4 w-4" />
                  ) : (
                    <ChevronDown className="inline h-4 w-4" />
                  ))}
              </TableHead>
              <TableHead
                className="text-right cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                Amount{" "}
                {sortConfig.field === "amount" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="inline h-4 w-4" />
                  ) : (
                    <ChevronDown className="inline h-4 w-4" />
                  ))}
              </TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((t) => (
                <TableRow key={t._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(t._id)}
                      onCheckedChange={(checked) =>
                        handleSelect(t._id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell>{format(new Date(t.date), "PP")}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell>
                    <span
                      style={{
                        backgroundColor: getCategoryColor(t.category),
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      {t.category}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium cursor-pointer",
                      t.type === "EXPENSE" ? "text-red-500" : "text-green-500"
                    )}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            {t.type === "EXPENSE" ? "-" : "+"}₹{parseBalance(
                              t.amount
                            )}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t.description || "No description available"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    {t.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="gap-1 bg-purple-100 text-purple-700 cursor-pointer"
                            >
                              <RefreshCw className="h-3 w-3" />
                              {RECURRING_INTERVALS[t.recurringInterval]}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Next Date:{" "}
                              {t.nextRecurringDate
                                ? format(new Date(t.nextRecurringDate), "PP")
                                : "Not set"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        One-time
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/transaction/edit/${t._id}`)
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(t._id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
