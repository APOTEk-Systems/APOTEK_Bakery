import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { getInventoryItem, createInventoryItem, updateInventoryItem, InventoryItem } from "../services/inventory";

const SuppliesForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    currentQuantity: "",
    minLevel: "",
    maxLevel: "",
    cost: ""
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchItem = async () => {
        try {
          setLoading(true);
          const item = await getInventoryItem(id);
          setFormData({
            name: item.name,
            unit: item.unit || "",
            currentQuantity: item.currentQuantity.toString(),
            minLevel: item.minLevel.toString(),
            maxLevel: item.maxLevel.toString(),
            cost: item.cost.toString()
          });
        } catch (err) {
          toast({
            title: "Error",
            description: "Failed to load supply",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      };
      fetchItem();
    } else {
      setLoading(false);
    }
  }, [id, isEdit, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Item name is required", variant: "destructive" });
      return;
    }

    if (parseFloat(formData.cost) <= 0) {
      toast({ title: "Error", description: "Cost must be greater than 0", variant: "destructive" });
      return;
    }

    if (parseInt(formData.currentQuantity) < 0 || parseInt(formData.minLevel) < 0 || parseInt(formData.maxLevel) < 0) {
      toast({ title: "Error", description: "Quantities cannot be negative", variant: "destructive" });
      return;
    }

    if (parseInt(formData.minLevel) >= parseInt(formData.maxLevel)) {
      toast({ title: "Error", description: "Min level must be less than max level", variant: "destructive" });
      return;
    }

    try {
      setSubmitLoading(true);
      if (isEdit && id) {
        await updateInventoryItem(id, {
          name: formData.name,
          unit: formData.unit,
          type: 'supplies',
          currentQuantity: parseInt(formData.currentQuantity),
          minLevel: parseInt(formData.minLevel),
          maxLevel: parseInt(formData.maxLevel),
          cost: parseFloat(formData.cost)
        });
        toast({
          title: "Supply Updated",
          description: `${formData.name} supply has been updated successfully.`
        });
      } else {
        await createInventoryItem({
          name: formData.name,
          unit: formData.unit,
          type: 'supplies',
          currentQuantity: parseInt(formData.currentQuantity),
          minLevel: parseInt(formData.minLevel),
          maxLevel: parseInt(formData.maxLevel),
          cost: parseFloat(formData.cost)
        });
        toast({
          title: "Supply Added",
          description: `${formData.name} supply has been added to inventory.`
        });
      }
      navigate("/supplies");
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "add"} supply`,
        variant: "destructive"
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen bg-background">
          <main className="flex-1 ml-64 p-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </main>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>\r\n      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/supplies">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Supplies
              </Link>
            </Button>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEdit ? "Edit Supply" : "Add New Supply"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "Update supply information" : "Add a new supply to your inventory"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle>Supply Information</CardTitle>
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
                
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="l">l</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="pcs">pcs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentQuantity">Current Quantity</Label>
                    <Input
                      id="currentQuantity"
                      type="number"
                      value={formData.currentQuantity}
                      onChange={(e) => handleInputChange("currentQuantity", e.target.value)}
                      placeholder="0"
                      min="0"
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
                      min="0"
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
                      min="0"
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
                    min="0"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1" disabled={submitLoading}>
                    {submitLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    {isEdit ? "Update Supply" : "Add Supply"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to="/supplies">Cancel</Link>
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
                  <h4 className="font-medium text-foreground mb-2">{formData.name || "Supply Name"}</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Current Quantity</span>
                      <span>{formData.currentQuantity || 0}</span>
                    </div>
                    
                    {formData.currentQuantity && formData.minLevel && formData.maxLevel && (
                      <div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              parseInt(formData.currentQuantity) <= parseInt(formData.minLevel) ? "bg-destructive" :
                              parseInt(formData.currentQuantity) <= parseInt(formData.minLevel) * 1.5 ? "bg-orange-500" : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.max(5, Math.min(100, (parseInt(formData.currentQuantity) / parseInt(formData.maxLevel)) * 100))}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Min: {formData.minLevel}</span>
                          <span>Max: {formData.maxLevel}</span>
                        </div>
                      </div>
                    )}
                    
                    {formData.cost && formData.currentQuantity && (
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span>Value</span>
                        <span className="font-medium">
                          ${((parseFloat(formData.cost) || 0) * (parseInt(formData.currentQuantity) || 0)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>\r\n    </Layout>
  );
};

export default SuppliesForm;


