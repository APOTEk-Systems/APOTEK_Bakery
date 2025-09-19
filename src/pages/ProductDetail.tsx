import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Edit, 
  DollarSign,
  Clock,
  Package,
  TrendingUp,
  Calendar,
  Loader2
} from "lucide-react";
import { getProduct, Product } from "../services/products";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await getProduct(parseInt(id));
          setProduct(data);
        } catch (err) {
          setError("Failed to load product");
          toast({
            title: "Error",
            description: "Failed to load product",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Navigation />
        <main className="flex-1 ml-64 p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen bg-background">
        <Navigation />
        <main className="flex-1 ml-64 p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-destructive">{error || "Product not found"}</p>
              <Button asChild className="mt-4">
                <Link to="/products">Back to Products</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const cost = product.productRecipes ? product.productRecipes.reduce((sum, recipe) => sum + (recipe.amountRequired * recipe.inventoryItem.cost), 0) : 0;
  const margin = product.price - cost;

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Link>
            </Button>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Product</Badge>
                <Badge variant={product.status === "active" ? "default" : "outline"}>
                  {product.status}
                </Badge>
              </div>
            </div>
            <Button asChild className="shadow-warm">
              <Link to={`/products/${product.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{product.description || "No description available."}</p>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Ingredients & Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.productRecipes && product.productRecipes.length > 0 ? (
                    product.productRecipes.map((recipe, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{recipe.inventoryItem.name}</p>
                          <p className="text-sm text-muted-foreground">{recipe.amountRequired} {recipe.inventoryItem.unit}</p>
                        </div>
                        <p className="font-medium text-foreground">${(recipe.amountRequired * recipe.inventoryItem.cost).toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No ingredients configured</p>
                  )}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-foreground">Total Cost</p>
                      <p className="font-semibold text-foreground">${cost.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Preparation Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {product.instructions.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <p className="text-foreground">{step}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Selling Price</span>
                  <span className="font-bold text-lg text-foreground">${product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cost</span>
                  <span className="text-foreground">${cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground">Margin</span>
                  <span className="font-semibold text-green-600">${margin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Margin %</span>
                  <span className="font-semibold text-green-600">
                    {((margin / product.price) * 100).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Meta Info */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Prep Time</span>
                  <span className="text-foreground">{product.prepTime ? `${product.prepTime} mins` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ingredients</span>
                  <span className="text-foreground">{product.productRecipes ? product.productRecipes.length : 0} items</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Stock</span>
                  <span className="text-foreground">{product.quantity} units</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-foreground">{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="text-foreground">{new Date(product.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;