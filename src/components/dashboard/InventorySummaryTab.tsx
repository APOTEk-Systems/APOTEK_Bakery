import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, AlertTriangle, TrendingUp } from "lucide-react";

const InventorySummaryTab = () => {
  const [expandedCard, setExpandedCard] = useState<string>("lowStock");
  const { data: inventoryData, isPending: loading } = useQuery({
    queryKey: ["inventoryDashboard"],
    queryFn: () => dashboardService.getInventoryDashboard(),
  });

  if (loading) {
    return (
      <div className="flex flex-col w-full justify-center items-center p-6">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Loading ...</p>
      </div>
    );
  }

  const toggleCard = (cardKey: string) => {
    setExpandedCard(expandedCard === cardKey ? "" : cardKey);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(() => {
          // Priority: show outOfStock if it has items, otherwise show lowStock if it has items
          if (inventoryData?.outOfStock && inventoryData.outOfStock.count > 0) {
            return (
              <Card
                className={`cursor-pointer transition-colors ${
                  expandedCard === "outOfStock"
                    ? "ring-2 ring-red-500"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => toggleCard("outOfStock")}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Out of Stock
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {inventoryData.outOfStock.count}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Items at zero stock
                  </p>
                </CardContent>
              </Card>
            );
          } else if (
            inventoryData?.lowStock &&
            inventoryData.lowStock.count > 0
          ) {
            return (
              <Card
                className={`cursor-pointer transition-colors ${
                  expandedCard === "lowStock"
                    ? "ring-2 ring-orange-500"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => toggleCard("lowStock")}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Low Stock Items
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {inventoryData.lowStock.count}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Items below minimum
                  </p>
                </CardContent>
              </Card>
            );
          }
          return null;
        })()}

        {inventoryData?.materialsUsed && (
          <Card
            className={`cursor-pointer transition-colors ${
              expandedCard === "materialsUsed"
                ? "ring-2 ring-blue-500"
                : "hover:bg-muted/50"
            }`}
            onClick={() => toggleCard("materialsUsed")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Materials Used
              </CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventoryData.materialsUsed.count}
              </div>
              <p className="text-xs text-muted-foreground">
                Production records
              </p>
            </CardContent>
          </Card>
        )}

        {inventoryData?.topSellingProducts && (
          <Card
            className={`cursor-pointer transition-colors ${
              expandedCard === "topSellingProducts"
                ? "ring-2 ring-green-500"
                : "hover:bg-muted/50"
            }`}
            onClick={() => toggleCard("topSellingProducts")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Top Selling Products
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventoryData.topSellingProducts.count}
              </div>
              <p className="text-xs text-muted-foreground">
                Best selling items
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tables Section */}
      {expandedCard === "lowStock" && inventoryData?.lowStock && (
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Quantity</th>
                    <th className="text-left p-2">Min Level</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.lowStock.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 capitalize">{item.type}</td>
                      <td className="p-2">{item.currentQuantity}</td>
                      <td className="p-2">{item.minLevel}</td>
                      <td className="p-2">
                        <Badge variant="secondary">Low</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {expandedCard === "outOfStock" && inventoryData?.outOfStock && (
        <Card>
          <CardHeader>
            <CardTitle>Out of Stock Items Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Current</th>
                    <th className="text-left p-2">Min Level</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.outOfStock.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 capitalize">{item.type}</td>
                      <td className="p-2">{item.currentQuantity}</td>
                      <td className="p-2">{item.minLevel}</td>
                      <td className="p-2">
                        <Badge variant="destructive">Out of Stock</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {expandedCard === "materialsUsed" && inventoryData?.materialsUsed && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Materials Used </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Material</th>
                    <th className="text-left p-2">Used</th>
                    <th className="text-left p-2">Unit</th>
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Produced</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.materialsUsed.items.map((item, index) => {
                    let displayQuantity = item.amountDeducted;
                    let displayUnit = item.unit;

                    if (item.unit === "kg" || item.unit === "l") {
                      if (item.amountDeducted >= 1000) {
                        displayQuantity = item.amountDeducted / 1000;
                        displayUnit = item.unit;
                      } else {
                        displayUnit = item.unit === "kg" ? "g" : "ml";
                      }
                    }

                    return (
                      <tr key={index} className="border-b">
                        <td className="p-2">{item.materialName}</td>
                        <td className="p-2">{displayQuantity.toFixed(2)}</td>
                        <td className="p-2">{displayUnit}</td>
                        <td className="p-2">{item.productName}</td>
                        <td className="p-2">{item.quantityProduced}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {expandedCard === "topSellingProducts" &&
        inventoryData?.topSellingProducts && (
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Product</th>
                      <th className="text-left p-2">Total Quantity Sold</th>
                      <th className="text-left p-2">Number of Sales</th>
                      <th className="text-left p-2">Quantity on Hand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.topSellingProducts.items.map(
                      (item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.productName}</td>
                          <td className="p-2">{item.totalQuantitySold}</td>
                          <td className="p-2">{item.numberOfSales}</td>
                          <td className="p-2">{item.quantityOnHand}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
};

export default InventorySummaryTab;