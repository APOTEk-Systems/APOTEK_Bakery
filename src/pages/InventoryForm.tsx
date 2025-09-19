import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "../components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { getInventoryItem, createInventoryItem, updateInventoryItem, InventoryItem } from "../services/inventory";

const InventoryForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    currentQuantity: "",
    minLevel: "",
    maxLevel: "",
    cost: ""
  });

  const itemQuery = useQuery({
    queryKey: ['inventoryItem', id],
    queryFn: () => getInventoryItem(id || '0'),
    enabled: isEdit,
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      unit: string;
      type: 'raw_material' | 'supplies';
      currentQuantity: number;
      minLevel: number;
      maxLevel: number;
      cost: number;
    }) => createInventoryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Raw Material Added",
        description: `${formData.name} raw material has been added to inventory.`
      });
      navigate("/inventory");
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: `Failed to add raw material`,
        variant: "destructive"
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) => updateInventoryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Raw Material Updated",
        description: `${formData.name} raw material has been updated successfully.`
      });
      navigate("/inventory");
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: `Failed to update raw material`,
        variant: "destructive"
      });
    },
  });

  useEffect(() => {
    if (isEdit && itemQuery.data) {
      const item = itemQuery.data;
      setFormData({
        name: item.name,
        unit: item.unit || "",
        currentQuantity: item.currentQuantity.toString(),
        minLevel: item.minLevel.toString(),
        maxLevel: item.maxLevel.toString(),
        cost: item.cost.toString()
      });
    }
  }, [itemQuery.data]);

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

    const submitData = {
      name: formData.name,
      unit: formData.unit || undefined,
      type: 'raw_material' as const,
      currentQuantity: parseInt(formData.currentQuantity) || 0,
      minLevel: parseInt(formData.minLevel) || 0,
      maxLevel: parseInt(formData.maxLevel) || 0,
      cost: parseFloat(formData.cost) || 0
    };

    if (isEdit && id) {
      updateMutation.mutate({ id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (itemQuery.isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Navigation />
        <main className="flex-1 ml-64 p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEdit ? "Edit Inventory Item" : "Add New Inventory Item"}
              </h1>
              <p className="text-muted-foreground">
                {isEdit ? "Update inventory item details" : "Add a new raw material or supply to inventory"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Inventory Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => handleInputChange("unit", e.target.value)}
                    placeholder="kg, liter, piece, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value="Raw Material"
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="cost">Unit Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => handleInputChange("cost", e.target.value)}
                    placeholder="0.00"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minLevel">Minimum Level</Label>
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
                  <Label htmlFor="maxLevel">Maximum Level</Label>
                  <Input
                    id="maxLevel"
                    type="number"
                    value={formData.maxLevel}
                    onChange={(e) => handleInputChange("maxLevel", e.target.value)}
                    placeholder="100"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 lg:col-span-2">
            <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEdit ? "Update Item" : "Add Item"}
            </Button>
            <Button type="button" variant="outline" className="w-full" asChild>
              <Link to="/inventory">Cancel</Link>
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default InventoryForm;