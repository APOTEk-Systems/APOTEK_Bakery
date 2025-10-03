import {useState, useEffect} from "react";
import {Link, useParams, useNavigate} from "react-router-dom";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import Layout from "../components/Layout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {useToast} from "@/hooks/use-toast";
import {ArrowLeft, Save, Loader2} from "lucide-react";
import {
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  getInventory,
  InventoryItem,
} from "../services/inventory";
import {fromBaseUnits, denormalizeCost, normalizeCost, toBaseUnits} from "@/lib/funcs";

const InventoryForm = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {toast} = useToast();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    currentQuantity: "",
    minLevel: "",
    maxLevel: "",
    cost: "",
  });

  const [costCalcOpen, setCostCalcOpen] = useState(false);
  const [calcAmount, setCalcAmount] = useState("");
  const [calcUnit, setCalcUnit] = useState("");
  const [calcTotalCost, setCalcTotalCost] = useState("");
  const [nameError, setNameError] = useState("");

  const unitOptions = [
    {value: "kg", label: "kilograms (kg)"},
    {value: "g", label: "grams (g)"},
    {value: "l", label: "liters (l)"},
    {value: "ml", label: "milliliters (ml)"},
    {value: "pcs", label: "piece (pcs)"},
    {value: "pair", label: "pair"},
  ];

  const itemQuery = useQuery({
    queryKey: ["inventoryItem", id],
    queryFn: () => getInventoryItem(id || "0"),
    enabled: isEdit,
  });

  const existingItemsQuery = useQuery({
    queryKey: ["inventory", "raw_material"],
    queryFn: () => getInventory({ type: "raw_material" }),
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      unit: string;
      type: "raw_material" | "supplies";
      currentQuantity: number;
      minLevel: number;
      maxLevel: number;
      cost: number;
    }) => createInventoryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["inventory"]});
      toast({
        title: "Material Added",
        description: `${formData.name} material has been added.`,
      });
      navigate("/materials");
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: `Failed to add material`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({id, data}: {id: string; data: Partial<InventoryItem>}) =>
      updateInventoryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["inventory"]});
      toast({
        title: "Material Updated",
        description: `${formData.name} material has been updated successfully.`,
      });
      navigate("/materials");
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: `Failed to update material`,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (isEdit && itemQuery.data) {
      const item = itemQuery.data;
      const unit = item.unit || "";

      setFormData({
        name: item.name,
        unit,
        currentQuantity: fromBaseUnits(item.currentQuantity, unit) === 0 ? "" : fromBaseUnits(item.currentQuantity, unit).toString(),
        minLevel: fromBaseUnits(item.minLevel, unit) === 0 ? "" : fromBaseUnits(item.minLevel, unit).toString(),
        maxLevel: fromBaseUnits(item.maxLevel, unit) === 0 ? "" : fromBaseUnits(item.maxLevel, unit).toString(),
        cost: denormalizeCost(item.cost, unit).toString(),
      });
    }
  }, [itemQuery.data]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({...prev, [field]: value}));

    if (field === "name") {
      setNameError("");
      if (value.trim() && existingItemsQuery.data) {
        const exists = existingItemsQuery.data.some(
          (item) =>
            item.name.toLowerCase() === value.toLowerCase() &&
            (!isEdit || item.id.toString() !== id)
        );
        if (exists) {
          setNameError("Material name already exists");
        }
      }
    }
  };

  const calculateCost = () => {
    const amount = parseFloat(calcAmount);
    const totalCost = parseFloat(calcTotalCost);
    if (!amount || !totalCost || !calcUnit) return;

    let costPerBaseUnit = 0;
    if (calcUnit === "g") {
      costPerBaseUnit = totalCost / amount;
    } else if (calcUnit === "kg") {
      costPerBaseUnit = totalCost / (amount * 1000);
    } else if (calcUnit === "ml") {
      costPerBaseUnit = totalCost / amount;
    } else if (calcUnit === "l") {
      costPerBaseUnit = totalCost / (amount * 1000);
    } else if (calcUnit === "pcs" || calcUnit === "pair") {
      costPerBaseUnit = totalCost / amount;
    }

    handleInputChange("cost", costPerBaseUnit.toFixed(0));
    setCostCalcOpen(false);
    setCalcAmount("");
    setCalcUnit("");
    setCalcTotalCost("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Item name is required",
        variant: "destructive",
      });
      return;
    }

    if (nameError) {
      toast({
        title: "Error",
        description: nameError,
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.cost) <= 0) {
      toast({
        title: "Error",
        description: "Cost must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (
      parseInt(formData.currentQuantity) < 0 ||
      parseInt(formData.minLevel) < 0 ||
      parseInt(formData.maxLevel) < 0
    ) {
      toast({
        title: "Error",
        description: "Quantities cannot be negative",
        variant: "destructive",
      });
      return;
    }

    if (parseInt(formData.minLevel) >= parseInt(formData.maxLevel)) {
      toast({
        title: "Error",
        description: "Min level must be less than max level",
        variant: "destructive",
      });
      return;
    }

    let unit = formData.unit;
    let currentQuantity = parseFloat(formData.currentQuantity) || 0;
    let minLevel = parseFloat(formData.minLevel) || 0;
    let maxLevel = parseFloat(formData.maxLevel) || 0;
    let cost = parseFloat(formData.cost) || 0;

    // Convert to base units for DB
    currentQuantity = toBaseUnits(currentQuantity, unit);
    minLevel = toBaseUnits(minLevel, unit);
    maxLevel = toBaseUnits(maxLevel, unit);
    cost = normalizeCost(cost, unit);

    const submitData = {
      name: formData.name,
      unit,
      type: "raw_material" as const,
      currentQuantity,
      minLevel,
      maxLevel,
      cost,
    };

    if (isEdit && id) {
      updateMutation.mutate({id, data: submitData});
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (itemQuery.isLoading) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/materials">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Materials
              </Link>
            </Button>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEdit ? "Edit Material" : "Add New Material"}
              </h1>
          
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Material Details</CardTitle>
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
                {nameError && (
                  <p className="text-sm text-destructive mt-1">{nameError}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit">
                    Unit {formData.unit.toLowerCase()}
                  </Label>
                  <Select
                    value={formData.unit.toLowerCase()}
                    onValueChange={(value) => handleInputChange("unit", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value="Material"
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentQuantity">
                    Current Quantity
                  </Label>
                  <Input
                    id="currentQuantity"
                    type="number"
                    value={formData.currentQuantity}
                    onChange={(e) =>
                      handleInputChange("currentQuantity", e.target.value)
                    }
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder=""
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Unit Cost *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cost"
                      type="text"
                      value={formData.cost ? parseFloat(formData.cost).toLocaleString('en-US') : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        if (!isNaN(Number(value)) || value === '') {
                          handleInputChange("cost", value);
                        }
                      }}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder=""
                      required
                    />
                    <Dialog open={costCalcOpen} onOpenChange={setCostCalcOpen}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline" size="sm">
                                Calculate
                              </Button>
                            </DialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Calculate cost per unit from your purchase details
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cost Calculator</DialogTitle>
                          <DialogDescription>
                            Enter the details of your purchase to calculate the
                            cost per unit.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Purchased Quantity</Label>
                            <Input
                              type="number"
                              value={calcAmount}
                              onChange={(e) => setCalcAmount(e.target.value)}
                              placeholder="e.g., 500"
                            />
                          </div>
                          <div>
                            <Label>Unit</Label>
                            <Select
                              value={calcUnit}
                              onValueChange={setCalcUnit}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {unitOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Total Cost Paid</Label>
                            <Input
                              type="text"
                              value={calcTotalCost ? parseFloat(calcTotalCost).toLocaleString('en-US') : ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/,/g, '');
                                if (!isNaN(Number(value)) || value === '') {
                                  setCalcTotalCost(value);
                                }
                              }}
                              placeholder="e.g., 8,500"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCostCalcOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={calculateCost}
                            disabled={
                              !calcAmount || !calcUnit || !calcTotalCost
                            }
                          >
                            Calculate
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minLevel">Minimum Level</Label>
                  <Input
                    id="minLevel"
                    type="number"
                    value={formData.minLevel}
                    onChange={(e) =>
                      handleInputChange("minLevel", e.target.value)
                    }
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder=""
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="maxLevel">Maximum Level</Label>
                  <Input
                    id="maxLevel"
                    type="number"
                    value={formData.maxLevel}
                    onChange={(e) =>
                      handleInputChange("maxLevel", e.target.value)
                    }
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder=""
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 lg:col-span-2">
            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEdit ? "Update Material" : "Add Material"}
            </Button>
            <Button type="button" variant="outline" className="w-full" asChild>
              <Link to="/inventory">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default InventoryForm;
