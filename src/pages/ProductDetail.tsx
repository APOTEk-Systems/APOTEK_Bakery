import { Link, useParams } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Edit, 
  DollarSign,
  Clock,
  Package,
  TrendingUp,
  Calendar
} from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  
  // Mock data - in real app, fetch by ID
  const product = {
    id: parseInt(id || "1"),
    name: "Sourdough Bread",
    category: "Bread",
    price: 8.50,
    cost: 3.20,
    margin: 5.30,
    prepTime: 240,
    status: "active",
    ingredients: [
      { name: "Bread Flour", amount: "500g", cost: 0.80 },
      { name: "Water", amount: "350ml", cost: 0.01 },
      { name: "Salt", amount: "10g", cost: 0.05 },
      { name: "Sourdough Starter", amount: "100g", cost: 0.50 }
    ],
    description: "Traditional sourdough with 24-hour fermentation process. Our signature bread made with natural wild yeast starter.",
    instructions: [
      "Feed starter 8-12 hours before baking",
      "Mix flour, water, and starter - autolyse 30 mins",
      "Add salt and mix until well combined",
      "Bulk fermentation with 4 sets of folds over 4 hours",
      "Pre-shape and rest 20 minutes",
      "Final shape and cold retard overnight",
      "Bake at 450°F with steam for 20 mins, then 425°F for 25 mins"
    ],
    stats: {
      soldThisWeek: 45,
      soldThisMonth: 180,
      averageRating: 4.8,
      totalReviews: 67
    },
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20"
  };

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
                <Badge variant="secondary">{product.category}</Badge>
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
                <p className="text-foreground">{product.description}</p>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Ingredients & Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{ingredient.name}</p>
                        <p className="text-sm text-muted-foreground">{ingredient.amount}</p>
                      </div>
                      <p className="font-medium text-foreground">${ingredient.cost.toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-foreground">Total Cost</p>
                      <p className="font-semibold text-foreground">${product.cost.toFixed(2)}</p>
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
                  <span className="text-foreground">${product.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground">Margin</span>
                  <span className="font-semibold text-green-600">${product.margin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Margin %</span>
                  <span className="font-semibold text-green-600">
                    {((product.margin / product.price) * 100).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Sales Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">This Week</span>
                  <span className="font-semibold text-foreground">{product.stats.soldThisWeek} sold</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-semibold text-foreground">{product.stats.soldThisMonth} sold</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg Rating</span>
                  <span className="font-semibold text-foreground">
                    {product.stats.averageRating}/5 ({product.stats.totalReviews} reviews)
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
                  <span className="text-foreground">{product.prepTime} mins</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ingredients</span>
                  <span className="text-foreground">{product.ingredients.length} items</span>
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