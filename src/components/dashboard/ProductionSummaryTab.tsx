import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, TrendingUp, Banknote } from "lucide-react";
import { formatCurrency } from "@/lib/funcs";

const ProductionSummaryTab = () => {
  const [expandedCard, setExpandedCard] = useState<string>(
    "weeklyIngredientUsage"
  );
  const { data: productionData, isPending: loading } = useQuery({
    queryKey: ["productionSummary"],
    queryFn: () => dashboardService.getProductionDashboard(),
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
        {productionData?.weeklyIngredientUsage && (
          <Card
            className={`cursor-pointer transition-colors ${
              expandedCard === "weeklyIngredientUsage"
                ? "ring-2 ring-blue-500"
                : "hover:bg-muted/50"
            }`}
            onClick={() => toggleCard("weeklyIngredientUsage")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Ingredient Usage
              </CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productionData.weeklyIngredientUsage.count}
              </div>
              <p className="text-xs text-muted-foreground">
                Ingredients tracked
              </p>
            </CardContent>
          </Card>
        )}

        {productionData?.weeklyProduction && (
          <Card
            className={`cursor-pointer transition-colors ${
              expandedCard === "weeklyProduction"
                ? "ring-2 ring-blue-500"
                : "hover:bg-muted/50"
            }`}
            onClick={() => toggleCard("weeklyProduction")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Weekly Production
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productionData.weeklyProduction.count}
              </div>
              <p className="text-xs text-muted-foreground">
                Products made this week
              </p>
            </CardContent>
          </Card>
        )}

        {productionData?.productionVsSales &&
          productionData.productionVsSales.count > 0 && (
            <Card
              className={`cursor-pointer transition-colors ${
                expandedCard === "productionVsSales"
                  ? "ring-2 ring-blue-500"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => toggleCard("productionVsSales")}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Weekly Production vs Sales
                </CardTitle>
                <Banknote className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {productionData.productionVsSales.count}
                </div>
                <p className="text-xs text-muted-foreground">
                  Comparison metrics
                </p>
              </CardContent>
            </Card>
          )}
      </div>

      {/* Tables Section */}
      {expandedCard === "weeklyIngredientUsage" &&
        productionData?.weeklyIngredientUsage && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Ingredient Usage Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Ingredient</th>
                      <th className="text-left p-2">Used</th>
                      <th className="text-left p-2">Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionData.weeklyIngredientUsage.items.map(
                      (item, index) => {
                        let displayQuantity = item.quantity;
                        let displayUnit = item.unit;
                        let displayAvailable = item.available;
                        let displayAvailableUnit = item.unit;

                        if (item.unit === "kg" || item.unit === "l") {
                          if (item.quantity >= 1000) {
                            displayQuantity = item.quantity / 1000;
                            displayUnit = item.unit;
                          } else {
                            displayUnit = item.unit === "kg" ? "g" : "ml";
                          }

                          // Apply the same unit logic to available
                          if (item.available >= 1000) {
                            displayAvailable = item.available / 1000;
                            displayAvailableUnit =
                              item.unit === "kg" ? "kg" : "l";
                          } else {
                            displayAvailable = item.available;
                            displayAvailableUnit = item.unit;
                          }
                        }

                        return (
                          <tr key={index} className="border-b">
                            <td className="p-2">{item.name}</td>
                            <td className="p-2">
                              {displayQuantity.toLocaleString()} {displayUnit}
                            </td>
                            <td className="p-2">
                              {displayAvailable.toLocaleString()}{" "}
                              {displayAvailableUnit}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

      {expandedCard === "weeklyProduction" &&
        productionData?.weeklyProduction && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Production Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Product</th>
                      <th className="text-left p-2">Quantity Produced</th>
                      <th className="text-left p-2">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionData.weeklyProduction.items.map(
                      (item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.productName}</td>
                          <td className="p-2">{item.quantityProduced.toLocaleString()}</td>
                          <td className="p-2">{formatCurrency(item.cost)}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

      {expandedCard === "productionVsSales" &&
        productionData?.productionVsSales && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Production vs Sales Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Product</th>
                      <th className="text-left p-2">Produced</th>
                      <th className="text-left p-2">Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionData.productionVsSales.items.map(
                      (item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.productName}</td>
                          <td className="p-2">{item.produced.toLocaleString()}</td>
                          <td className="p-2">{item.sold.toLocaleString()}</td>
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

export default ProductionSummaryTab;