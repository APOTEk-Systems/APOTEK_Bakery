import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getProductionRun } from "../services/productionRuns";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "../lib/funcs";
import { format } from 'date-fns';

const ProductionRunDetail = () => {
  const { id } = useParams<{ id: string }>();
  const runId = id || '';

  const { data: run, isLoading, error } = useQuery({
    queryKey: ['productionRun', runId],
    queryFn: () => getProductionRun(runId),
    enabled: !!runId,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !run) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">Production run not found or error loading details.</p>
              <Button asChild>
                <Link to="/production-runs">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Production Runs
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/production-runs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Production Runs
            </Link>
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Production Run #{run.id}</h1>
              <p className="text-muted-foreground">Production run details and breakdown</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-6">
          {/* Main Run Info */}
          <Card>
            <CardHeader>
              <CardTitle>Production Run Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Product</Label>
                  <p className="font-medium">{(run as any).product?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Quantity Produced</Label>
                  <p className="font-medium">{run.quantityProduced}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                  <p className="font-medium">{format(new Date(run.date), 'dd-MM-yyyy')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Cost</Label>
                  <p className="font-medium">{formatCurrency(Number(run.cost))}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Cost per Product</Label>
                  <p className="font-medium">{formatCurrency(Number(run.cost) / run.quantityProduced)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Profit Margin</Label>
                  {(() => {
                    const costPerProduct = Number(run.cost) / run.quantityProduced;
                    const sellingPrice = (run as any).product?.price || 0;
                    const profitMargin = sellingPrice > 0 ? ((sellingPrice - costPerProduct) / sellingPrice) * 100 : 0;
                    return (
                      <p className={`font-medium ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitMargin.toFixed(1)}%
                      </p>
                    );
                  })()}
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="font-medium">{run.notes || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients Deducted */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients Deducted</CardTitle>
              <p className="text-sm text-muted-foreground">{(run as any).ingredientsDeducted?.length || 0} ingredients</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(run as any).ingredientsDeducted?.map((ingredient: any, index: number) => 
                  {
                    let unit = ingredient.unit;

                    if(unit.toLowerCase() === "kg"){
                      unit = "g"
                    } else if(unit.toLowerCase() === "l"){
                      unit = "ml"
                    }

                    return(<div key={ingredient.id} className="flex justify-between items-center p-3 border rounded">
                    <div className="flex-1">
                      <span className="font-medium">{ingredient.name}</span>
                    </div>
                    <div className="flex space-x-4 text-sm text-muted-foreground">
                      <span>{ingredient.amountDeducted} {unit}</span>
                      <span>{formatCurrency(Number(ingredient.cost))}</span>
                    </div>
                  </div>)
                  }
                ) || <p>No ingredients deducted</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProductionRunDetail;


