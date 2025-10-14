import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Package, Users } from "lucide-react";
import PurchaseOrdersTab from "@/components/purchases/PurchaseOrdersTab";
import GoodsReceivingTab from "@/components/purchases/GoodsReceivingTab";
import SuppliersTab from "@/components/purchases/SuppliersTab";
import { useAuth } from "@/contexts/AuthContext";

// Helper function to check permissions
const hasPermission = (user: any, permission: string): boolean => {
  if (!user) return false;
  if (user.permissions?.includes("all")) return true;
  return user.permissions?.includes(permission) || false;
};


export default function Purchases() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || "purchase-orders");

  const hasViewPurchases = hasPermission(user, "view:purchases");
  const hasReceiveGoods = hasPermission(user, "receive:goods");
  const hasViewSuppliers = hasPermission(user, "view:suppliers");

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className={`grid w-full ${hasViewPurchases && hasReceiveGoods && hasViewSuppliers ? 'grid-cols-3' : hasViewPurchases && hasReceiveGoods ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {hasViewPurchases && (
                <TabsTrigger value="purchase-orders">
                  <Package className="mr-2 h-4 w-4" />
                  Purchase Orders
                </TabsTrigger>
              )}
              {hasReceiveGoods && (
                <TabsTrigger value="goods-receiving">
                  <Truck className="mr-2 h-4 w-4" />
                  Materials Received
                </TabsTrigger>
              )}
              {hasViewSuppliers && (
                <TabsTrigger value="suppliers">
                  <Users className="mr-2 h-4 w-4" />
                  Suppliers
                </TabsTrigger>
              )}
            </TabsList>
            {hasViewPurchases && (
              <TabsContent value="purchase-orders">
                <PurchaseOrdersTab />
              </TabsContent>
            )}
            {hasReceiveGoods && (
              <TabsContent value="goods-receiving">
                <GoodsReceivingTab />
              </TabsContent>
            )}
            {hasViewSuppliers && (
              <TabsContent value="suppliers">
                <SuppliersTab />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}


