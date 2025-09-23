import { useState } from "react";
import Layout from "../components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Package, Users } from "lucide-react";
import PurchaseOrdersTab from "@/components/purchases/PurchaseOrdersTab";
import GoodsReceivingTab from "@/components/purchases/GoodsReceivingTab";
import SuppliersTab from "@/components/purchases/SuppliersTab";


export default function Purchases() {
  const [activeTab, setActiveTab] = useState("purchase-orders");

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
            <p className="text-muted-foreground">
              Manage purchase orders, goods receiving, and suppliers
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="purchase-orders">
                <Package className="mr-2 h-4 w-4" />
                Purchase Orders
              </TabsTrigger>
              <TabsTrigger value="goods-receiving">
                <Truck className="mr-2 h-4 w-4" />
                Goods Received
              </TabsTrigger>
              <TabsTrigger value="suppliers">
                <Users className="mr-2 h-4 w-4" />
                Suppliers
              </TabsTrigger>
            </TabsList>
            <TabsContent value="purchase-orders">
              <PurchaseOrdersTab />
            </TabsContent>
            <TabsContent value="goods-receiving">
              <GoodsReceivingTab />
            </TabsContent>
            <TabsContent value="suppliers">
              <SuppliersTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}


