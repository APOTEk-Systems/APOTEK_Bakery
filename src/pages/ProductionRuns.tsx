import {useState, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
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
import {Badge} from "@/components/ui/badge";
import {useToast} from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {format} from "date-fns";
import {
  Plus,
  Filter,
  Package,
  Edit,
  Trash2,
  Loader2,
  Calendar as CalendarIcon,
  Search,
  Eye,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getProductionRuns,
  createProductionRun,
  deleteProductionRun,
  ProductionRun,
} from "../services/productionRuns";
import {getProducts, Product} from "../services/products";
import {formatCurrency} from "@/lib/funcs";

const ProductionRuns = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState(new Date());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    notes: "",
  });
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const {toast} = useToast();

  const today = format(date, "yyyy-MM-dd");

  const queryClient = useQueryClient();

  const productionRunsQuery = useQuery({
    queryKey: ["productionRuns", today],
    queryFn: () => getProductionRuns({date: today, limit: 100}),
    enabled: !!today,
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createProductionRun(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["productionRuns", today]});
      toast({
        title: "Success",
        description: "Production run created successfully",
      });
      setCreateDialogOpen(false);
      setFormData({productId: "", quantity: "", notes: ""});
      setQuantityError(null);
    },
    onError: (error: any) => {
      if (error.response?.status !== 500) {
        const errorMsg =
          error.response?.data?.error || "Failed to create production run";
        toast({
          title: "Warning",
          description: errorMsg,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Server error occurred",
          variant: "destructive",
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProductionRun(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["productionRuns", today]});
      toast({
        title: "Success",
        description: "Production run deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete production run",
        variant: "destructive",
      });
    },
  });

  const productionRuns = productionRunsQuery.data || [];
  const products = productsQuery.data || [];
  const loading = productionRunsQuery.isLoading || productsQuery.isLoading;
  const error = productionRunsQuery.error || productsQuery.error;

  useEffect(() => {
    if (formData.productId) {
      const selectedProduct = products.find(
        (p) => p.id.toString() === formData.productId
      );
      if (selectedProduct) {
        setFormData((prev) => ({
          ...prev,
          quantity: selectedProduct.batchSize.toString(),
        }));
        setQuantityError(null);
      }
    }
  }, [formData.productId, products]);

  const filteredRuns = productionRuns.filter(
    (run) =>
      run.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      products
        .find((p) => p.id === Number(run.productId))
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    if (!formData.productId || !formData.quantity) {
      toast({
        title: "Error",
        description: "Product and quantity are required",
        variant: "destructive",
      });
      return;
    }
    if (quantityError) {
      toast({
        title: "Warning",
        description: quantityError,
        variant: "default",
      });
      return;
    }
    createMutation.mutate({
      productId: parseInt(formData.productId),
      quantity: parseInt(formData.quantity),
      notes: formData.notes || undefined,
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this production run?"))
      return;
    deleteMutation.mutate(id);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen bg-background">
          <main className="p-6 flex items-center w-full justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </main>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {" "}
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Production
              </h1>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-warm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Production
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Production</DialogTitle>
                  <DialogDescription>
                    Start a new production run for a product.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productId">Product</Label>
                    <Select
                      value={formData.productId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({...prev, productId: value}))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem
                            key={String(product.id)}
                            value={product.id.toString()}
                          >
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => {
                        const newQuantity = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          quantity: newQuantity,
                        }));
                        const val = parseInt(newQuantity);
                        if (isNaN(val) || val <= 0) {
                          setQuantityError(
                            "Quantity must be a positive number"
                          );
                        } else {
                          const selectedProduct = products.find(
                            (p) => p.id.toString() === formData.productId
                          );
                          if (
                            selectedProduct &&
                            val % selectedProduct.batchSize !== 0
                          ) {
                            setQuantityError(
                              `Quantity must be a multiple of ${selectedProduct.batchSize}`
                            );
                          } else {
                            setQuantityError(null);
                          }
                        }
                      }}
                      placeholder="Enter quantity"
                      disabled={createMutation.isPending}
                    />
                    {quantityError && (
                      <p className="text-yellow-600 text-sm mt-1">
                        {quantityError}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Optional notes"
                      disabled={createMutation.isPending}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    disabled={createMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={
                      !formData.productId ||
                      !formData.quantity ||
                      createMutation.isPending
                    }
                  >
                    {createMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters - Moved to top */}
        <Card className="shadow-none bg-transparent border-0 mb-6">
          <CardContent className="p-4">
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search production runs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="mr-2">
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[240px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd-MM-yyyy") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            {/* Stats card commented out */}
            {/*
            <Card className="shadow-warm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Today's Runs:</span>
                  <span className="float-right text-foreground">{productionRuns.length}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Total Produced:</span>
                  <span className="float-right text-foreground">{productionRuns.reduce((sum, run) => sum + run.quantityProduced, 0)}</span>
                </div>
              </CardContent>
            </Card>
            */}
            {error ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-destructive">
                    {error
                      ? (error as Error)?.message || "Failed to load data"
                      : "Failed to load data"}
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="mt-4"
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Profit Margin</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRuns.map((run) => {
                      const product = products.find((p) => p.id === Number(run.productId));
                      const productName = product?.name || "Unknown";
                      const costPerProduct = Number(run.cost) / run.quantityProduced;
                      const sellingPrice = product?.price || 0;
                      const profitMargin = sellingPrice > 0 ? ((sellingPrice - costPerProduct) / sellingPrice) * 100 : 0;
                      return (
                        <TableRow key={run.id}>
                          <TableCell className="font-medium">
                            {productName}
                          </TableCell>
                          <TableCell>{run.quantityProduced}</TableCell>
                          <TableCell>
                            {format(new Date(run.date), 'dd-MM-yyyy')}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(Number(run.cost))}
                          </TableCell>
                          <TableCell>
                            <Badge variant={profitMargin >= 0 ? "default" : "destructive"}>
                              {profitMargin.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                disabled={deleteMutation.isPending}
                              >
                                <Link to={`/production-runs/${run.id}`}>
                                  <Eye className="h-3 w-3" />
                                    View
                                </Link>
                              
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(run.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        </div>

        {filteredRuns.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No production runs for {format(date, "MMMM do, yyyy")}
            </h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first production run
            </p>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Production Run
                </Button>
              </DialogTrigger>
              {/* Dialog content as above */}
            </Dialog>
          </div>
        )}
      </div>{" "}
    </Layout>
  );
};

export default ProductionRuns;
