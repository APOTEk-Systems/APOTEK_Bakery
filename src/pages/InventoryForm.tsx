import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

const InventoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: isEdit ? "All-Purpose Flour" : "",
    category: isEdit ? "Flour" : "",
    currentStock: isEdit ? "15" : "",
    unit: isEdit ? "kg" : "",
    minLevel: isEdit ? "20" : "",
    maxLevel: isEdit ? "100" : "",
    cost: isEdit ? "1.20" : "",
    supplier: isEdit ? "Grain Co." : ""
  });

  const categories = ["Flour", "Dairy", "Sweetener", "Flavoring", "Spices", "Nuts", "Chocolate", "Fruit", "Other"];
  const units = ["kg", "g", "L", "ml", "pieces", "bottles", "bags", "boxes"];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Item name is required", variant: "destructive" });
      return;
    }
    
    if (!formData.category) {
      toast({ title: "Error", description: "Please select a category", variant: "destructive" });
      return;
    }

    toast({
      title: isEdit ? "Item Updated" : "Item Added",
      description: `${formData.name} has been ${isEdit ? "updated" : "added"} to inventory.`
    });
    
    navigate("/inventory");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/inventory">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Inventory
              </Link>
            </Button>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEdit ? "Edit Inventory Item" : "Add New Item"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "Update inventory item information" : "Add a new item to your inventory"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle>Item Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter item name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => handleInputChange("supplier", e.target.value)}
                    placeholder="Enter supplier name"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentStock">Current Stock</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) => handleInputChange("currentStock", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="minLevel">Min Level</Label>
                    <Input
                      id="minLevel"
                      type="number"
                      value={formData.minLevel}
                      onChange={(e) => handleInputChange("minLevel", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxLevel">Max Level</Label>
                    <Input
                      id="maxLevel"
                      type="number"
                      value={formData.maxLevel}
                      onChange={(e) => handleInputChange("maxLevel", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cost">Cost per Unit ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => handleInputChange("cost", e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {isEdit ? "Update Item" : "Add Item"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to="/inventory">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle>Stock Level Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">{formData.name || "Item Name"}</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Current Stock</span>
                      <span>{formData.currentStock || 0} {formData.unit || "units"}</span>
                    </div>
                    
                    {formData.currentStock && formData.minLevel && formData.maxLevel && (
                      <div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              parseInt(formData.currentStock) <= parseInt(formData.minLevel) ? "bg-destructive" :
                              parseInt(formData.currentStock) <= parseInt(formData.minLevel) * 1.5 ? "bg-orange-500" : "bg-green-500"
                            }`}
                            style={{ 
                              width: `${Math.max(5, Math.min(100, (parseInt(formData.currentStock) / parseInt(formData.maxLevel)) * 100))}%` 
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Min: {formData.minLevel}</span>
                          <span>Max: {formData.maxLevel}</span>
                        </div>
                      </div>
                    )}
                    
                    {formData.cost && (
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span>Value</span>
                        <span className="font-medium">
                          ${((parseFloat(formData.cost) || 0) * (parseInt(formData.currentStock) || 0)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default InventoryForm;