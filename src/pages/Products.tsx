import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Filter,
  DollarSign,
  Clock,
  Package
} from "lucide-react";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Mock data
  const products = [
    {
      id: 1,
      name: "Sourdough Bread",
      category: "Bread",
      price: 8.50,
      cost: 3.20,
      prepTime: 240,
      status: "active",
      ingredients: ["Flour", "Water", "Salt", "Starter"],
      description: "Traditional sourdough with 24-hour fermentation"
    },
    {
      id: 2,
      name: "Chocolate Croissant",
      category: "Pastry", 
      price: 4.25,
      cost: 1.80,
      prepTime: 180,
      status: "active",
      ingredients: ["Butter", "Flour", "Chocolate", "Yeast"],
      description: "Flaky pastry with Belgian dark chocolate"
    },
    {
      id: 3,
      name: "Red Velvet Cupcake",
      category: "Cake",
      price: 3.75,
      cost: 1.50,
      prepTime: 45,
      status: "active",
      ingredients: ["Flour", "Cocoa", "Cream Cheese", "Eggs"],
      description: "Moist red velvet with cream cheese frosting"
    },
    {
      id: 4,
      name: "Blueberry Muffin",
      category: "Muffin",
      price: 3.00,
      cost: 1.20,
      prepTime: 30,
      status: "inactive",
      ingredients: ["Flour", "Blueberries", "Sugar", "Eggs"],
      description: "Fresh blueberries in vanilla muffin base"
    }
  ];

  const categories = ["all", "Bread", "Pastry", "Cake", "Muffin"];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Products</h1>
              <p className="text-muted-foreground">Manage your bakery's product catalog</p>
            </div>
            <Button asChild className="shadow-warm">
              <Link to="/products/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={filterCategory === category ? "default" : "outline"}
                  onClick={() => setFilterCategory(category)}
                  size="sm"
                >
                  {category === "all" ? "All" : category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="shadow-warm hover:shadow-glow transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{product.category}</Badge>
                      <Badge variant={product.status === "active" ? "default" : "outline"}>
                        {product.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/products/${product.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/products/${product.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-accent" />
                      <span className="font-medium">${product.price}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Cost: ${product.cost}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{product.prepTime} mins prep</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{product.ingredients.length} ingredients</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterCategory !== "all" 
                ? "Try adjusting your search or filters" 
                : "Get started by adding your first product"}
            </p>
            <Button asChild>
              <Link to="/products/new">Add Product</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;