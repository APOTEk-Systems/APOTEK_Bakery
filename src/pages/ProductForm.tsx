import {useState, useEffect} from "react";
import {Link, useParams, useNavigate} from "react-router-dom";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import Layout from "../components/Layout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useToast} from "@/hooks/use-toast";
import {ArrowLeft, Save, Plus, Trash2, Loader2} from "lucide-react";
import {
  createProduct,
  updateProduct,
  getProduct,
  Product,
} from "../services/products";
import {getInventory, InventoryItem} from "../services/inventory";
import {ConfirmationDialog} from "@/components/ConfirmationDialog";

const ProductForm = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {toast} = useToast();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState<{
    name: string;
    price: string;
    prepTime: string;
    status: "active" | "inactive";
    description: string;
    instructions: string[];
    batchSize: string;
  }>({
    name: "",
    price: "",
    prepTime: "",
    status: "active",
    description: "",
    instructions: [""],
    batchSize: "1",
  });

  const [productRecipes, setProductRecipes] = useState<
    {inventoryItemId: string; amount: string; unit: string}[]
  >([]);
  const [activeTab, setActiveTab] = useState("details");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingProductData, setPendingProductData] = useState<any>(null);

  const isDetailsComplete = formData.name.trim() && formData.price.trim();

  const unitOptions = [
    {value: "kg", label: "kilograms (kg)"},
    {value: "g", label: "grams (g)"},
    {value: "l", label: "liters (l)"},
    {value: "ml", label: "milliliters (ml)"},
    {value: "pcs", label: "piece (pcs)"},
    {value: "pair", label: "pair"},
  ];

  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(Number(id)),
    enabled: isEdit,
  });

  const inventoryQuery = useQuery({
    queryKey: ["inventory"],
    queryFn: () => getInventory({type: "raw_material"}),
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      price: number;
      instructions: string[];
      productRecipes: {inventoryItemId: number; amountRequired: number}[];
      description?: string;
      prepTime?: number;
      status?: "active" | "inactive";
    }) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["products"]});
      toast({
        title: "Product Created",
        description: `${formData.name} has been created successfully.`,
      });
      navigate("/products");
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({id, data}: {id: string; data: Partial<Product>}) =>
      updateProduct(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["products"]});
      toast({
        title: "Product Updated",
        description: `${formData.name} has been updated successfully.`,
      });
      navigate("/products");
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (isEdit && productQuery.data) {
      const product = productQuery.data;
      setFormData({
        name: product.name,
        price: product.price.toString(),
        prepTime: product.prepTime?.toString() || "",
        status: product.status,
        description: product.description || "",
        instructions: product.instructions,
        batchSize: (product as any).batchSize?.toString() || "1",
      });
      if ((product as any).productRecipes) {
        setProductRecipes(
          (product as any).productRecipes.map((r: any) => ({
            inventoryItemId: r.inventoryItemId.toString(),
            amount: r.amountRequired.toString(),
            unit: "",
          }))
        );
      }
    }
  }, [productQuery.data]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData((prev) => ({...prev, instructions: newInstructions}));
  };

  const addInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index),
      }));
    }
  };

  const handleRecipeChange = (index: number, field: string, value: string) => {
    const newRecipes = [...productRecipes];
    newRecipes[index] = {...newRecipes[index], [field]: value};
    setProductRecipes(newRecipes);
  };

  const addRecipe = () => {
    setProductRecipes([
      ...productRecipes,
      {inventoryItemId: "", amount: "", unit: ""},
    ]);
  };

  const removeRecipe = (index: number) => {
    setProductRecipes(productRecipes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const convertedRecipes = productRecipes.map((recipe) => {
        let amountRequired = parseFloat(recipe.amount) || 0;
        if (
          recipe.unit.toLowerCase() === "kg" ||
          recipe.unit.toLowerCase() === "l"
        ) {
          amountRequired /= 1000;
        }
        return {
          inventoryItemId: parseInt(recipe.inventoryItemId),
          amountRequired,
        };
      });

      const productData = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price) || 0,
        prepTime: parseInt(formData.prepTime) || undefined,
        instructions: formData.instructions.filter((inst) => inst.trim()),
        status: formData.status,
        batchSize: parseInt(formData.batchSize) || 1,
        productRecipes: convertedRecipes,
      };

      setPendingProductData(productData);
      setShowConfirmDialog(true);
    } catch (err) {
      toast({
        title: "Error",
        description: isEdit
          ? "Failed to update product"
          : "Failed to create product",
        variant: "destructive",
      });
    }
  };

  const confirmSubmit = () => {
    if (!pendingProductData) return;

    if (isEdit && id) {
      updateMutation.mutate({id, data: pendingProductData});
    } else {
      createMutation.mutate(pendingProductData);
    }

    setShowConfirmDialog(false);
    setPendingProductData(null);
    navigate("/products");
  };

  if (isEdit && productQuery.isLoading) {
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
    <Layout>
      <div className="p-6">
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
              <h1 className="text-3xl font-bold text-foreground">
                {isEdit ? "Edit Product" : "Add New Product"}
              </h1>
              <p className="text-muted-foreground">
                {isEdit
                  ? "Update product information"
                  : "Create a new bakery product"}
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="recipe" disabled={!isDetailsComplete}>
              Recipe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <div className="space-y-6">
              {/* Basic Info */}
              <Card className="shadow-warm">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Describe your product"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Selling Price *</Label>
                      <Input
                        id="price"
                        type="text"
                        value={
                          formData.price
                            ? Number(formData.price).toLocaleString("en-US")
                            : ""
                        }
                        onChange={(e) => {
                          const raw = e.target.value.replace(/,/g, ""); // remove commas
                          handleInputChange("price", raw);
                        }}
                        placeholder="1,000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                      <Input
                        id="prepTime"
                        type="number"
                        value={formData.prepTime}
                        onChange={(e) =>
                          handleInputChange("prepTime", e.target.value)
                        }
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          handleInputChange("status", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

          

              {/* Actions */}
              <Card className="shadow-warm">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      asChild
                    >
                      <Link to="/products">Cancel</Link>
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={() => setActiveTab("recipe")}
                      disabled={!isDetailsComplete}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recipe" className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="shadow-warm">
                <CardHeader>
                  <CardTitle>Product Recipe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="batchSize">
                      Batch Size (units produced by this recipe)
                    </Label>
                    <Input
                      id="batchSize"
                      type="number"
                      value={formData.batchSize}
                      onChange={(e) =>
                        handleInputChange("batchSize", e.target.value)
                      }
                      placeholder="1"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addRecipe}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ingredient
                  </Button>
                  {productRecipes.map((recipe, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
                    >
                      <div>
                        <Label>Inventory Item</Label>
                        <Select
                          value={recipe.inventoryItemId}
                          onValueChange={(value) =>
                            handleRecipeChange(index, "inventoryItemId", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {(inventoryQuery.data as InventoryItem[])?.map(
                              (item) => (
                                <SelectItem
                                  key={item.id}
                                  value={item.id.toString()}
                                >
                                  {item.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={recipe.amount}
                          onChange={(e) =>
                            handleRecipeChange(index, "amount", e.target.value)
                          }
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Select
                          value={recipe.unit}
                          onValueChange={(value) =>
                            handleRecipeChange(index, "unit", value)
                          }
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRecipe(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="shadow-warm">
                <CardContent className="pt-6 space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isEdit ? "Update Product" : "Create Product"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link to="/products">Cancel</Link>
                  </Button>
                </CardContent>
              </Card>
            </form>
          </TabsContent>
        </Tabs>

        <ConfirmationDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          title={isEdit ? "Update Product" : "Create Product"}
          message="Please ensure all the details are correct. You are about to create a new product."
          onConfirm={confirmSubmit}
          confirmVariant="default"
        />
      </div>{" "}
    </Layout>
  );
};

export default ProductForm;
