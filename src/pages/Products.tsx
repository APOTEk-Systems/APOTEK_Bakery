import {useState} from "react";
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
import {Plus, Filter, Package, Edit, Trash2, Loader2, Search} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {getProducts, deleteProduct, Product} from "../services/products";
import {ConfirmationDialog} from "@/components/ConfirmationDialog";
import {DialogHeader, DialogFooter} from "@/components/ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog";
import {formatCurrency} from "@/lib/funcs";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  const {toast} = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const categories = ["all"];

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const products = productsQuery.data || [];
  const loading = productsQuery.isLoading;
  const error = productsQuery.error;

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "stock") return a.quantity - b.quantity;
      return 0;
    });

  const getStockStatus = (quantity: number) => {
    if (quantity < 10) return "Low Stock";
    if (quantity < 25) return "Medium Stock";
    return "In Stock";
  };

  const getStockColor = (quantity: number) => {
    if (quantity < 10) return "text-destructive";
    if (quantity < 25) return "text-warning";
    return "text-success";
  };

  const handleEditProduct = (product: Product) => {
    navigate(`/products/${product.id}/edit`);
  };

  const openDeleteDialog = (productId: number) => {
    setSelectedDeleteId(productId);
    setDeleteDialogOpen(true);
  };

  const deleteProductMutation = useMutation({
    mutationFn: (productId: number) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["products"]});
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      setDeleteDialogOpen(false);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const confirmDelete = (productId: number) => {
    deleteProductMutation.mutate(productId);
  };

  return (
    <Layout>
      {" "}
      <div className="p-6">
        <div className="mb-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Products</h1>
            </div>
            <Button className="shadow-warm" asChild>
              <Link to="/products/new">
                <Plus className="h-4 w-4 mr-2" />
                New Product
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters - Moved to top */}
        <Card className="bg-transparent shadow-none border-0 py-4">
          <CardContent className="space-y-4 py-0 flex items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* <div className="space-y-2" style={{marginTop: "0"}}>
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </CardContent>
        </Card>

        <div className="w-full flex justify-end mb-4"> </div>
        <div className="grid grid-cols-1 gap-6">
          {/* Products Table */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : productsQuery.error ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-destructive">
                    {productsQuery.error instanceof Error
                      ? productsQuery.error.message
                      : "Failed to load products"}
                  </p>
                  <Button
                    onClick={() => productsQuery.refetch()}
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
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStockColor(product.quantity)}
                          >
                            {getStockStatus(product.quantity)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteDialog(product.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No products found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search"
                : "Get started by adding your first product"}
            </p>
            <Button asChild>
              <Link to="/products/new">Add Product</Link>
            </Button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Confirm Delete"
          message="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={() => selectedDeleteId && confirmDelete(selectedDeleteId)}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Confirm Delete"
          message="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={() => selectedDeleteId && confirmDelete(selectedDeleteId)}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this product? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  selectedDeleteId && confirmDelete(selectedDeleteId)
                }
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>{" "}
    </Layout>
  );
};

export default Products;
