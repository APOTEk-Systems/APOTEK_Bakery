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
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp
} from "lucide-react";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const inventory = [
    {
      id: 1,
      name: "All-Purpose Flour",
      category: "Flour",
      currentStock: 15,
      unit: "kg",
      minLevel: 20,
      maxLevel: 100,
      cost: 1.20,
      supplier: "Grain Co.",
      status: "low"
    },
    {
      id: 2,
      name: "Butter",
      category: "Dairy",
      currentStock: 8,
      unit: "kg",
      minLevel: 10,
      maxLevel: 50,
      cost: 8.50,
      supplier: "Farm Fresh",
      status: "low"
    },
    {
      id: 3,
      name: "Vanilla Extract",
      category: "Flavoring",
      currentStock: 2,
      unit: "bottles",
      minLevel: 5,
      maxLevel: 20,
      cost: 12.00,
      supplier: "Spice World",
      status: "critical"
    },
    {
      id: 4,
      name: "Sugar",
      category: "Sweetener",
      currentStock: 45,
      unit: "kg",
      minLevel: 20,
      maxLevel: 80,
      cost: 0.80,
      supplier: "Sweet Supply",
      status: "good"
    }
  ];

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "destructive";
      case "low": return "secondary";
      case "good": return "default";
      default: return "outline";
    }
  };

  const getStockPercentage = (current: number, min: number, max: number) => {
    return ((current - min) / (max - min)) * 100;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
              <p className="text-muted-foreground">Track your bakery's ingredients and supplies</p>
            </div>
            <Button asChild className="shadow-warm">
              <Link to="/inventory/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Link>
            </Button>
          </div>

          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="shadow-warm">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">3</p>
                    <p className="text-sm text-muted-foreground">Critical Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-warm">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">5</p>
                    <p className="text-sm text-muted-foreground">Low Stock</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-warm">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">25</p>
                    <p className="text-sm text-muted-foreground">Good Stock</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-warm">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">33</p>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Inventory Table */}
        <Card className="shadow-warm">
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInventory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <Badge variant={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Supplier: {item.supplier}</p>
                    </div>
                    
                    <div className="w-48">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Stock Level</span>
                        <span>{item.currentStock} {item.unit}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.status === "critical" ? "bg-destructive" :
                            item.status === "low" ? "bg-orange-500" : "bg-green-500"
                          }`}
                          style={{ width: `${Math.max(10, getStockPercentage(item.currentStock, item.minLevel, item.maxLevel))}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Min: {item.minLevel}</span>
                        <span>Max: {item.maxLevel}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-foreground">${item.cost.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">per {item.unit}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/inventory/${item.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredInventory.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No items found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Try adjusting your search" : "Get started by adding your first inventory item"}
                </p>
                <Button asChild>
                  <Link to="/inventory/new">Add Item</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Inventory;