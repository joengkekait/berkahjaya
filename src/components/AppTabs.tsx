import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InputForm from "./InputForm";
import ReportsView from "./ReportsView";
import MonthlyExpenses from "./MonthlyExpenses";

interface AppTabsProps {
  className?: string;
}

const AppTabs: React.FC<AppTabsProps> = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState("input");

  return (
    <div className={`w-full bg-background ${className}`}>
      <Tabs
        defaultValue="input"
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <div className="flex justify-center mb-4 sm:mb-6">
          <TabsList className="grid w-full max-w-xs sm:max-w-md grid-cols-3">
            <TabsTrigger
              value="input"
              className="text-xs sm:text-sm md:text-base py-2 sm:py-3"
            >
              Input Data
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="text-xs sm:text-sm md:text-base py-2 sm:py-3"
            >
              Beban
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="text-xs sm:text-sm md:text-base py-2 sm:py-3"
            >
              Laporan Keuangan
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="input" className="mt-1 sm:mt-2">
          <InputForm />
        </TabsContent>

        <TabsContent value="expenses" className="mt-1 sm:mt-2">
          <MonthlyExpenses />
        </TabsContent>

        <TabsContent value="reports" className="mt-1 sm:mt-2">
          <ReportsView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppTabs;
