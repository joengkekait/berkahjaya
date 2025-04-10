import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  otherExpenses: number;
  totalExpense: number;
}

const MonthlyExpenses = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [staffSalary, setStaffSalary] = useState("");
  const [nightGuardSalary, setNightGuardSalary] = useState("");
  const [electricityBill, setElectricityBill] = useState("");
  const [waterBill, setWaterBill] = useState("");
  const [internetBill, setInternetBill] = useState("");
  const [otherExpenses, setOtherExpenses] = useState("");
  const [availableCash, setAvailableCash] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([]);

  // Calculate total available cash from all transactions
  useEffect(() => {
    const calculateAvailableCash = () => {
      const storedData = localStorage.getItem("transactions");
      const storedExpenses = localStorage.getItem("monthly-expenses");

      let totalCash = 0;
      let totalExpenses = 0;

      // Calculate total cash from transactions
      if (storedData) {
        try {
          const transactions = JSON.parse(storedData);
          totalCash = transactions.reduce(
            (sum: number, t: any) => sum + (t.dailyCash || 0),
            0,
          );
        } catch (error) {
          console.error("Error calculating available cash:", error);
        }
      }

      // Calculate total expenses already spent
      if (storedExpenses) {
        try {
          const expenses = JSON.parse(storedExpenses);
          totalExpenses = expenses.reduce(
            (sum: number, e: MonthlyExpense) => sum + e.totalExpense,
            0,
          );
        } catch (error) {
          console.error("Error calculating total expenses:", error);
        }
      }

      // Available cash is total cash minus expenses already spent
      setAvailableCash(totalCash - totalExpenses);
    };

    calculateAvailableCash();

    // Load monthly expenses
    const loadMonthlyExpenses = () => {
      const storedExpenses = localStorage.getItem("monthly-expenses");
      if (storedExpenses) {
        try {
          const expenses = JSON.parse(storedExpenses);
          setMonthlyExpenses(expenses);
        } catch (error) {
          console.error("Error parsing monthly expenses:", error);
        }
      }
    };

    loadMonthlyExpenses();
  }, []);

  const calculateTotalExpense = () => {
    const staff = parseFloat(staffSalary) || 0;
    const nightGuard = parseFloat(nightGuardSalary) || 0;
    const electricity = parseFloat(electricityBill) || 0;
    const water = parseFloat(waterBill) || 0;
    const internet = parseFloat(internetBill) || 0;
    const other = parseFloat(otherExpenses) || 0;

    return staff + nightGuard + electricity + water + internet + other;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      alert("Tanggal harus diisi");
      return;
    }

    const totalExpense = calculateTotalExpense();

    if (totalExpense <= 0) {
      alert("Minimal satu pengeluaran harus diisi");
      return;
    }

    if (totalExpense > availableCash) {
      alert(
        `Total pengeluaran (${totalExpense.toLocaleString()}) melebihi kas yang tersedia (${availableCash.toLocaleString()})`,
      );
      return;
    }

    const formattedDate = format(date, "yyyy-MM-dd");
    const month = format(date, "MM");
    const year = format(date, "yyyy");

    // Check if expense for this month already exists
    const existingExpenseIndex = monthlyExpenses.findIndex(
      (exp) => exp.month === month && exp.year === year,
    );

    const newExpense: MonthlyExpense = {
      id:
        existingExpenseIndex >= 0
          ? monthlyExpenses[existingExpenseIndex].id
          : Date.now().toString(),
      date: formattedDate,
      month,
      year,
      staffSalary: parseFloat(staffSalary) || 0,
      nightGuardSalary: parseFloat(nightGuardSalary) || 0,
      electricityBill: parseFloat(electricityBill) || 0,
      waterBill: parseFloat(waterBill) || 0,
      internetBill: parseFloat(internetBill) || 0,
      otherExpenses: parseFloat(otherExpenses) || 0,
      totalExpense,
    };

    let updatedExpenses;
    if (existingExpenseIndex >= 0) {
      // Update existing expense
      updatedExpenses = [...monthlyExpenses];
      updatedExpenses[existingExpenseIndex] = newExpense;
    } else {
      // Add new expense
      updatedExpenses = [...monthlyExpenses, newExpense];
    }

    // Save to localStorage
    localStorage.setItem("monthly-expenses", JSON.stringify(updatedExpenses));
    setMonthlyExpenses(updatedExpenses);

    // Update available cash immediately after saving expenses
    setAvailableCash((prevCash) => prevCash - totalExpense);

    // Reset form
    setStaffSalary("");
    setNightGuardSalary("");
    setElectricityBill("");
    setWaterBill("");
    setInternetBill("");
    setOtherExpenses("");

    alert("Data pengeluaran bulanan berhasil disimpan!");
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
        <CardTitle className="text-center text-gray-800 text-lg sm:text-xl">
          Input Pengeluaran Bulanan
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Bulan dan Tahun</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, "MMMM yyyy")
                    ) : (
                      <span>Pilih bulan</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-salary">Gaji Karyawan (Rp)</Label>
              <Input
                id="staff-salary"
                type="number"
                value={staffSalary}
                onChange={(e) => setStaffSalary(e.target.value)}
                placeholder="Masukkan jumlah gaji karyawan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="night-guard-salary">
                Gaji Penjaga Malam (Rp)
              </Label>
              <Input
                id="night-guard-salary"
                type="number"
                value={nightGuardSalary}
                onChange={(e) => setNightGuardSalary(e.target.value)}
                placeholder="Masukkan jumlah gaji penjaga malam"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="electricity-bill">Beban Listrik (Rp)</Label>
              <Input
                id="electricity-bill"
                type="number"
                value={electricityBill}
                onChange={(e) => setElectricityBill(e.target.value)}
                placeholder="Masukkan jumlah beban listrik"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="water-bill">Beban PDAM (Rp)</Label>
              <Input
                id="water-bill"
                type="number"
                value={waterBill}
                onChange={(e) => setWaterBill(e.target.value)}
                placeholder="Masukkan jumlah beban PDAM"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internet-bill">Beban Internet (Rp)</Label>
              <Input
                id="internet-bill"
                type="number"
                value={internetBill}
                onChange={(e) => setInternetBill(e.target.value)}
                placeholder="Masukkan jumlah beban internet"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="other-expenses">Beban Lain - Lain (Rp)</Label>
              <Input
                id="other-expenses"
                type="number"
                value={otherExpenses}
                onChange={(e) => setOtherExpenses(e.target.value)}
                placeholder="Masukkan jumlah beban lain-lain"
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-md space-y-2">
              <p className="text-sm font-medium text-blue-800">
                Total Kas Tersedia: Rp{availableCash.toLocaleString()}
              </p>
              <p className="text-sm font-medium text-blue-800">
                Total Pengeluaran: Rp{calculateTotalExpense().toLocaleString()}
              </p>
              <p className="text-xs text-blue-600">
                Pengeluaran bulanan akan diambil dari total kas yang terkumpul
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-sm sm:text-base py-2 sm:py-3"
          >
            Simpan Pengeluaran
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MonthlyExpenses;
