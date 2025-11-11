
import { useState, Suspense, lazy } from "react";
import Layout from "../components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PastryProSpinner } from "@/components/ui/PastryProSpinner";

const SalesReportsTab = lazy(() => import("@/components/reports/SalesReportsTab"));
const PurchasesReportsTab = lazy(() => import("@/components/reports/PurchasesReportsTab"));
const InventoryReportsTab = lazy(() => import("@/components/reports/InventoryReportsTab"));
const ProductionReportsTab = lazy(() => import("@/components/reports/ProductionReportsTab"));
const AccountingReportsTab = lazy(() => import("@/components/reports/AccountingReportsTab"));

const Reports = () => {
  const [activeTab, setActiveTab] = useState("sales");

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="material">Inventory</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="financial">Accounting</TabsTrigger>
          </TabsList>

          <Suspense fallback={<div className="flex justify-center items-center h-64"><PastryProSpinner /></div>}>
            <TabsContent value="sales" className="mt-6">
              <SalesReportsTab />
            </TabsContent>
            <TabsContent value="purchases" className="mt-6">
              <PurchasesReportsTab />
            </TabsContent>
            <TabsContent value="material" className="mt-6">
              <InventoryReportsTab />
            </TabsContent>
            <TabsContent value="production" className="mt-6">
              <ProductionReportsTab />
            </TabsContent>
            <TabsContent value="financial" className="mt-6">
              <AccountingReportsTab />
            </TabsContent>
          </Suspense>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;
