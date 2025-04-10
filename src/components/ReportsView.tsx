import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Transaction {
  id: string;
  date: string;
  assetType: "car" | "speedboat" | "restaurant";
  assetName: string;
  rentalType?: "drop" | "harian";
  route?: string;
  price: number;
  operationalCosts?: {
    fuel?: number;
    driver?: number;
  };
  trips: number;
  days?: number;
  dailyCash: number;
}

interface MonthlyExpense {
  id: string;
  date: string;
  month: string;
  year: string;
  staffSalary: number;
  nightGuardSalary: number;
  electricityBill: number;
  waterBill: number;
  internetBill: number;
  totalExpense: number;
}

const ReportsView = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(new Date(), "yyyy-MM"),
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([]);
  const [daysInMonth, setDaysInMonth] = useState<number[]>([]);

  // Generate array of days in the selected month
  useEffect(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const daysCount = new Date(year, month, 0).getDate();
    setDaysInMonth(Array.from({ length: daysCount }, (_, i) => i + 1));

    // Load transactions from localStorage
    const loadTransactions = () => {
      // Try to load from both possible localStorage keys
      const storedData = localStorage.getItem("transactions");
      const oldStoredData = localStorage.getItem("bjt-financial-data");

      let allTransactions: Transaction[] = [];

      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          allTransactions = parsedData;
        } catch (error) {
          console.error("Error parsing transactions:", error);
        }
      }

      // Filter transactions for the selected month
      const filteredTransactions = allTransactions.filter((t) => {
        try {
          const transactionDate = new Date(t.date);
          return (
            transactionDate.getFullYear() === year &&
            transactionDate.getMonth() + 1 === month
          );
        } catch (error) {
          console.error("Error filtering transaction:", t, error);
          return false;
        }
      });

      setTransactions(filteredTransactions);
    };

    // Load monthly expenses from localStorage
    const loadMonthlyExpenses = () => {
      const storedExpenses = localStorage.getItem("monthly-expenses");
      if (storedExpenses) {
        try {
          const expenses = JSON.parse(storedExpenses);
          // Filter expenses for the selected month
          const filteredExpenses = expenses.filter(
            (e: MonthlyExpense) =>
              e.month === month.toString().padStart(2, "0") &&
              e.year === year.toString(),
          );
          setMonthlyExpenses(filteredExpenses);
        } catch (error) {
          console.error("Error parsing monthly expenses:", error);
        }
      } else {
        setMonthlyExpenses([]);
      }
    };

    loadTransactions();
    loadMonthlyExpenses();
  }, [selectedMonth]);

  // Generate months for the select dropdown
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Generate options for the current year and previous year
    for (let year = currentYear; year >= currentYear - 1; year--) {
      for (let month = 12; month >= 1; month--) {
        // Skip future months
        if (year === currentYear && month > currentDate.getMonth() + 1)
          continue;

        const monthValue = `${year}-${month.toString().padStart(2, "0")}`;
        const monthName = format(new Date(year, month - 1, 1), "MMMM yyyy", {
          locale: id,
        });
        options.push({ value: monthValue, label: monthName });
      }
    }

    return options;
  };

  // Calculate daily income for each asset
  const calculateDailyIncome = (
    day: number,
    assetType?: "car" | "speedboat" | "restaurant",
    assetName?: string,
  ) => {
    const dayStr = day.toString().padStart(2, "0");
    const dateStr = `${selectedMonth}-${dayStr}`;

    return transactions
      .filter((t) => {
        const matches = t.date === dateStr;
        if (assetType && t.assetType !== assetType) return false;
        if (assetName && t.assetName !== assetName) return false;
        return matches;
      })
      .reduce((sum, t) => sum + t.price, 0);
  };

  // Calculate daily expenses for each asset
  const calculateDailyExpenses = (day: number, assetName?: string) => {
    const dayStr = day.toString().padStart(2, "0");
    const dateStr = `${selectedMonth}-${dayStr}`;

    return transactions
      .filter((t) => {
        const matches = t.date === dateStr && t.assetType === "car";
        if (assetName && t.assetName !== assetName) return false;
        return matches;
      })
      .reduce((sum, t) => {
        const fuelCost = t.operationalCosts?.fuel || 0;
        const driverCost = t.operationalCosts?.driver || 0;
        return sum + fuelCost + driverCost;
      }, 0);
  };

  // Calculate daily cash for each asset type
  const calculateDailyCash = (
    day: number,
    assetType?: "car" | "speedboat" | "restaurant",
  ) => {
    const dayStr = day.toString().padStart(2, "0");
    const dateStr = `${selectedMonth}-${dayStr}`;

    return transactions
      .filter((t) => {
        const matches = t.date === dateStr;
        if (assetType && t.assetType !== assetType) return false;
        return matches;
      })
      .reduce((sum, t) => sum + t.dailyCash, 0);
  };

  // Get unique car names from transactions
  const getCarNames = () => {
    const carNames = new Set<string>();
    transactions
      .filter((t) => t.assetType === "car")
      .forEach((t) => carNames.add(t.assetName));
    return Array.from(carNames);
  };

  // Get unique speedboat names from transactions
  const getSpeedboatNames = () => {
    const speedboatNames = new Set<string>();
    transactions
      .filter((t) => t.assetType === "speedboat")
      .forEach((t) => speedboatNames.add(t.assetName));
    return Array.from(speedboatNames);
  };

  // Calculate total income for a specific asset or type
  const calculateTotalIncome = (
    assetType?: "car" | "speedboat" | "restaurant",
    assetName?: string,
  ) => {
    return daysInMonth.reduce((sum, day) => {
      return sum + calculateDailyIncome(day, assetType, assetName);
    }, 0);
  };

  // Calculate total expenses for a specific asset
  const calculateTotalExpenses = (assetName?: string) => {
    return daysInMonth.reduce((sum, day) => {
      return sum + calculateDailyExpenses(day, assetName);
    }, 0);
  };

  // Calculate total cash for a specific asset type
  const calculateTotalCash = (
    assetType?: "car" | "speedboat" | "restaurant",
  ) => {
    const totalCashBeforeExpenses = daysInMonth.reduce((sum, day) => {
      return sum + calculateDailyCash(day, assetType);
    }, 0);

    // If we're calculating the total cash (no specific asset type),
    // subtract the monthly expenses
    if (!assetType) {
      const totalMonthlyExpenses = monthlyExpenses.reduce(
        (sum, expense) => sum + expense.totalExpense,
        0,
      );
      return totalCashBeforeExpenses - totalMonthlyExpenses;
    }

    return totalCashBeforeExpenses;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const carNames = getCarNames();
  const speedboatNames = getSpeedboatNames();
  const totalIncome = calculateTotalIncome();
  const totalExpenses = calculateTotalExpenses();
  const totalMonthlyExpenses = monthlyExpenses.reduce(
    (sum, expense) => sum + expense.totalExpense,
    0,
  );
  const totalBalance = totalIncome - totalExpenses - totalMonthlyExpenses;

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
          Laporan Keuangan
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
          <div className="w-full sm:w-64">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {generateMonthOptions().map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-sm"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="income" className="w-full">
        <TabsList className="mb-3 sm:mb-4 w-full sm:w-auto">
          <TabsTrigger
            value="income"
            className="flex-1 sm:flex-none text-xs sm:text-sm py-1.5 sm:py-2"
          >
            Pendapatan
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            className="flex-1 sm:flex-none text-xs sm:text-sm py-1.5 sm:py-2"
          >
            Pengeluaran
          </TabsTrigger>
          <TabsTrigger
            value="summary"
            className="flex-1 sm:flex-none text-xs sm:text-sm py-1.5 sm:py-2"
          >
            Ringkasan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
              <CardTitle className="text-base sm:text-lg">
                Pendapatan Bulanan
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Laporan pendapatan{" "}
                {format(new Date(selectedMonth + "-01"), "MMMM yyyy", {
                  locale: id,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6 py-2 sm:py-4">
              <div className="w-full overflow-x-auto touch-pan-x">
                <div className="min-w-[600px] sm:min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-white z-10 min-w-[200px]">
                          Aset
                        </TableHead>
                        {daysInMonth.map((day) => (
                          <TableHead key={day} className="text-center">
                            {day}
                          </TableHead>
                        ))}
                        <TableHead className="text-center font-bold">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Car income rows */}
                      {carNames.map((carName) => (
                        <React.Fragment key={`car-${carName}`}>
                          {/* Drop rentals */}
                          <TableRow>
                            <TableCell className="sticky left-0 bg-white z-10 font-medium">
                              {carName} (Drop)
                            </TableCell>
                            {daysInMonth.map((day) => (
                              <TableCell key={day} className="text-right">
                                {formatCurrency(
                                  transactions
                                    .filter(
                                      (t) =>
                                        t.date ===
                                          `${selectedMonth}-${day.toString().padStart(2, "0")}` &&
                                        t.assetType === "car" &&
                                        t.assetName === carName &&
                                        (!t.rentalType ||
                                          t.rentalType === "drop"),
                                    )
                                    .reduce((sum, t) => sum + t.price, 0),
                                )}
                              </TableCell>
                            ))}
                            <TableCell className="text-right font-bold">
                              {formatCurrency(
                                transactions
                                  .filter(
                                    (t) =>
                                      t.assetType === "car" &&
                                      t.assetName === carName &&
                                      (!t.rentalType ||
                                        t.rentalType === "drop"),
                                  )
                                  .reduce((sum, t) => sum + t.price, 0),
                              )}
                            </TableCell>
                          </TableRow>

                          {/* Daily rentals */}
                          <TableRow>
                            <TableCell className="sticky left-0 bg-white z-10 font-medium">
                              {carName} (Harian)
                            </TableCell>
                            {daysInMonth.map((day) => (
                              <TableCell key={day} className="text-right">
                                {formatCurrency(
                                  transactions
                                    .filter(
                                      (t) =>
                                        t.date ===
                                          `${selectedMonth}-${day.toString().padStart(2, "0")}` &&
                                        t.assetType === "car" &&
                                        t.assetName === carName &&
                                        t.rentalType === "harian",
                                    )
                                    .reduce((sum, t) => sum + t.price, 0),
                                )}
                              </TableCell>
                            ))}
                            <TableCell className="text-right font-bold">
                              {formatCurrency(
                                transactions
                                  .filter(
                                    (t) =>
                                      t.assetType === "car" &&
                                      t.assetName === carName &&
                                      t.rentalType === "harian",
                                  )
                                  .reduce((sum, t) => sum + t.price, 0),
                              )}
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))}

                      {/* Speedboat income rows */}
                      {speedboatNames.map((speedboatName) => (
                        <TableRow key={`speedboat-${speedboatName}`}>
                          <TableCell className="sticky left-0 bg-white z-10 font-medium">
                            {speedboatName}
                          </TableCell>
                          {daysInMonth.map((day) => (
                            <TableCell key={day} className="text-right">
                              {formatCurrency(
                                calculateDailyIncome(
                                  day,
                                  "speedboat",
                                  speedboatName,
                                ),
                              )}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-bold">
                            {formatCurrency(
                              calculateTotalIncome("speedboat", speedboatName),
                            )}
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Restaurant income row */}
                      <TableRow>
                        <TableCell className="sticky left-0 bg-white z-10 font-medium">
                          Resto
                        </TableCell>
                        {daysInMonth.map((day) => (
                          <TableCell key={day} className="text-right">
                            {formatCurrency(
                              calculateDailyIncome(day, "restaurant"),
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-bold">
                          {formatCurrency(calculateTotalIncome("restaurant"))}
                        </TableCell>
                      </TableRow>

                      {/* Daily cash row */}
                      <TableRow>
                        <TableCell className="sticky left-0 bg-white z-10 font-medium">
                          Kas Harian
                        </TableCell>
                        {daysInMonth.map((day) => (
                          <TableCell key={day} className="text-right">
                            {formatCurrency(calculateDailyCash(day))}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-bold">
                          {formatCurrency(
                            daysInMonth.reduce(
                              (sum, day) => sum + calculateDailyCash(day),
                              0,
                            ),
                          )}
                        </TableCell>
                      </TableRow>

                      {/* Total income row */}
                      <TableRow className="bg-muted/50">
                        <TableCell className="sticky left-0 bg-muted/50 z-10 font-bold">
                          Total Pendapatan
                        </TableCell>
                        {daysInMonth.map((day) => {
                          const dailyTotal =
                            calculateDailyIncome(day) + calculateDailyCash(day);
                          return (
                            <TableCell
                              key={day}
                              className="text-right font-bold"
                            >
                              {formatCurrency(dailyTotal)}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-bold">
                          {formatCurrency(totalIncome + calculateTotalCash())}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
              <CardTitle className="text-base sm:text-lg">
                Pengeluaran Bulanan
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Laporan pengeluaran{" "}
                {format(new Date(selectedMonth + "-01"), "MMMM yyyy", {
                  locale: id,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6 py-2 sm:py-4">
              <div className="w-full overflow-x-auto touch-pan-x">
                <div className="min-w-[600px] sm:min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-white z-10 min-w-[200px]">
                          Aset
                        </TableHead>
                        {daysInMonth.map((day) => (
                          <TableHead key={day} className="text-center">
                            {day}
                          </TableHead>
                        ))}
                        <TableHead className="text-center font-bold">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Car expense rows */}
                      {carNames.map((carName) => (
                        <TableRow key={`car-expense-${carName}`}>
                          <TableCell className="sticky left-0 bg-white z-10 font-medium">
                            {carName}
                          </TableCell>
                          {daysInMonth.map((day) => (
                            <TableCell key={day} className="text-right">
                              {formatCurrency(
                                transactions
                                  .filter(
                                    (t) =>
                                      t.date ===
                                        `${selectedMonth}-${day.toString().padStart(2, "0")}` &&
                                      t.assetType === "car" &&
                                      t.assetName === carName &&
                                      (!t.rentalType ||
                                        t.rentalType === "drop"),
                                  )
                                  .reduce((sum, t) => {
                                    const fuelCost =
                                      t.operationalCosts?.fuel || 0;
                                    const driverCost =
                                      t.operationalCosts?.driver || 0;
                                    return sum + fuelCost + driverCost;
                                  }, 0),
                              )}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-bold">
                            {formatCurrency(
                              transactions
                                .filter(
                                  (t) =>
                                    t.assetType === "car" &&
                                    t.assetName === carName &&
                                    (!t.rentalType || t.rentalType === "drop"),
                                )
                                .reduce((sum, t) => {
                                  const fuelCost =
                                    t.operationalCosts?.fuel || 0;
                                  const driverCost =
                                    t.operationalCosts?.driver || 0;
                                  return sum + fuelCost + driverCost;
                                }, 0),
                            )}
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Car expenses rows */}
                      {carNames.map((carName) => (
                        <TableRow key={`car-expense-${carName}`}>
                          <TableCell className="sticky left-0 bg-white z-10 font-medium">
                            {carName}
                          </TableCell>
                          {daysInMonth.map((day) => (
                            <TableCell key={day} className="text-right">
                              {formatCurrency(
                                transactions
                                  .filter(
                                    (t) =>
                                      t.date ===
                                        `${selectedMonth}-${day.toString().padStart(2, "0")}` &&
                                      t.assetType === "car" &&
                                      t.assetName === carName &&
                                      (!t.rentalType ||
                                        t.rentalType === "drop"),
                                  )
                                  .reduce((sum, t) => {
                                    const fuelCost =
                                      t.operationalCosts?.fuel || 0;
                                    const driverCost =
                                      t.operationalCosts?.driver || 0;
                                    return sum + fuelCost + driverCost;
                                  }, 0),
                              )}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-bold">
                            {formatCurrency(
                              transactions
                                .filter(
                                  (t) =>
                                    t.assetType === "car" &&
                                    t.assetName === carName &&
                                    (!t.rentalType || t.rentalType === "drop"),
                                )
                                .reduce((sum, t) => {
                                  const fuelCost =
                                    t.operationalCosts?.fuel || 0;
                                  const driverCost =
                                    t.operationalCosts?.driver || 0;
                                  return sum + fuelCost + driverCost;
                                }, 0),
                            )}
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Monthly expenses rows */}
                      {monthlyExpenses.length > 0 && (
                        <>
                          <TableRow>
                            <TableCell className="sticky left-0 bg-white z-10 font-medium">
                              Gaji Karyawan
                            </TableCell>
                            {daysInMonth.map((day) => (
                              <TableCell key={day} className="text-right">
                                {day === 1
                                  ? formatCurrency(
                                      monthlyExpenses[0]?.staffSalary || 0,
                                    )
                                  : formatCurrency(0)}
                              </TableCell>
                            ))}
                            <TableCell className="text-right font-bold">
                              {formatCurrency(
                                monthlyExpenses[0]?.staffSalary || 0,
                              )}
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell className="sticky left-0 bg-white z-10 font-medium">
                              Gaji Penjaga Malam
                            </TableCell>
                            {daysInMonth.map((day) => (
                              <TableCell key={day} className="text-right">
                                {day === 1
                                  ? formatCurrency(
                                      monthlyExpenses[0]?.nightGuardSalary || 0,
                                    )
                                  : formatCurrency(0)}
                              </TableCell>
                            ))}
                            <TableCell className="text-right font-bold">
                              {formatCurrency(
                                monthlyExpenses[0]?.nightGuardSalary || 0,
                              )}
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell className="sticky left-0 bg-white z-10 font-medium">
                              Beban Listrik
                            </TableCell>
                            {daysInMonth.map((day) => (
                              <TableCell key={day} className="text-right">
                                {day === 1
                                  ? formatCurrency(
                                      monthlyExpenses[0]?.electricityBill || 0,
                                    )
                                  : formatCurrency(0)}
                              </TableCell>
                            ))}
                            <TableCell className="text-right font-bold">
                              {formatCurrency(
                                monthlyExpenses[0]?.electricityBill || 0,
                              )}
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell className="sticky left-0 bg-white z-10 font-medium">
                              Beban PDAM
                            </TableCell>
                            {daysInMonth.map((day) => (
                              <TableCell key={day} className="text-right">
                                {day === 1
                                  ? formatCurrency(
                                      monthlyExpenses[0]?.waterBill || 0,
                                    )
                                  : formatCurrency(0)}
                              </TableCell>
                            ))}
                            <TableCell className="text-right font-bold">
                              {formatCurrency(
                                monthlyExpenses[0]?.waterBill || 0,
                              )}
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell className="sticky left-0 bg-white z-10 font-medium">
                              Beban Internet
                            </TableCell>
                            {daysInMonth.map((day) => (
                              <TableCell key={day} className="text-right">
                                {day === 1
                                  ? formatCurrency(
                                      monthlyExpenses[0]?.internetBill || 0,
                                    )
                                  : formatCurrency(0)}
                              </TableCell>
                            ))}
                            <TableCell className="text-right font-bold">
                              {formatCurrency(
                                monthlyExpenses[0]?.internetBill || 0,
                              )}
                            </TableCell>
                          </TableRow>
                        </>
                      )}

                      {/* Total expenses row */}
                      <TableRow className="bg-muted/50">
                        <TableCell className="sticky left-0 bg-muted/50 z-10 font-bold">
                          Total Pengeluaran
                        </TableCell>
                        {daysInMonth.map((day) => (
                          <TableCell key={day} className="text-right font-bold">
                            {formatCurrency(
                              calculateDailyExpenses(day) +
                                (day === 1 && monthlyExpenses.length > 0
                                  ? monthlyExpenses[0].totalExpense
                                  : 0),
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-bold">
                          {formatCurrency(
                            totalExpenses +
                              (monthlyExpenses.length > 0
                                ? monthlyExpenses[0].totalExpense
                                : 0),
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
              <CardTitle className="text-base sm:text-lg">
                Ringkasan Keuangan
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Ringkasan keuangan{" "}
                {format(new Date(selectedMonth + "-01"), "MMMM yyyy", {
                  locale: id,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 py-2 sm:py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="bg-blue-50">
                    <CardHeader className="pb-1 sm:pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">
                        Total Pendapatan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg sm:text-2xl font-bold text-blue-800">
                        {formatCurrency(totalIncome + calculateTotalCash())}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50">
                    <CardHeader className="pb-1 sm:pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium text-red-700">
                        Total Pengeluaran
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg sm:text-2xl font-bold text-red-800">
                        {formatCurrency(totalExpenses + totalMonthlyExpenses)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className={totalBalance >= 0 ? "bg-green-50" : "bg-red-50"}
                  >
                    <CardHeader className="pb-1 sm:pb-2">
                      <CardTitle
                        className={`text-xs sm:text-sm font-medium ${totalBalance >= 0 ? "text-green-700" : "text-red-700"}`}
                      >
                        Saldo Bersih
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p
                        className={`text-lg sm:text-2xl font-bold ${totalBalance >= 0 ? "text-green-800" : "text-red-800"}`}
                      >
                        {formatCurrency(totalBalance + calculateTotalCash())}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-4 sm:mt-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    Rincian Pendapatan
                  </h3>
                  <div className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span>Pendapatan Mobil:</span>
                      <span className="font-medium">
                        {formatCurrency(calculateTotalIncome("car"))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pendapatan Speedboat:</span>
                      <span className="font-medium">
                        {formatCurrency(calculateTotalIncome("speedboat"))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pendapatan Resto:</span>
                      <span className="font-medium">
                        {formatCurrency(calculateTotalIncome("restaurant"))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kas Harian:</span>
                      <span className="font-medium">
                        {formatCurrency(calculateTotalCash())}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-bold">Total Pendapatan:</span>
                      <span className="font-bold">
                        {formatCurrency(totalIncome + calculateTotalCash())}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    Rincian Pengeluaran
                  </h3>
                  <div className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span>Operasional Mobil:</span>
                      <span className="font-medium">
                        {formatCurrency(totalExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between pl-4">
                      <span>- Biaya Bensin:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          transactions
                            .filter((t) => t.assetType === "car")
                            .reduce(
                              (sum, t) => sum + (t.operationalCosts?.fuel || 0),
                              0,
                            ),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between pl-4">
                      <span>- Ongkos Sopir:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          transactions
                            .filter((t) => t.assetType === "car")
                            .reduce(
                              (sum, t) =>
                                sum + (t.operationalCosts?.driver || 0),
                              0,
                            ),
                        )}
                      </span>
                    </div>
                    {monthlyExpenses.length > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span>Gaji Karyawan:</span>
                          <span className="font-medium">
                            {formatCurrency(monthlyExpenses[0].staffSalary)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gaji Penjaga Malam:</span>
                          <span className="font-medium">
                            {formatCurrency(
                              monthlyExpenses[0].nightGuardSalary,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Beban Listrik:</span>
                          <span className="font-medium">
                            {formatCurrency(monthlyExpenses[0].electricityBill)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Beban PDAM:</span>
                          <span className="font-medium">
                            {formatCurrency(monthlyExpenses[0].waterBill)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Beban Internet:</span>
                          <span className="font-medium">
                            {formatCurrency(monthlyExpenses[0].internetBill)}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-bold">Total Pengeluaran:</span>
                      <span className="font-bold">
                        {formatCurrency(totalExpenses + totalMonthlyExpenses)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsView;
