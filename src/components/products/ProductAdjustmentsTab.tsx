import {useState, useEffect} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
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
import {useToast} from "@/hooks/use-toast";
import {Search, Plus, Loader2} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {DateRangePicker, DateRange} from "@/components/ui/DateRange";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  getProducts,
  getProductAdjustments,
  createProductAdjustment,
} from "../../services/products";
import { settingsService } from "../../services/settings";
import {format} from "date-fns";
import { useAuth } from '@/contexts/AuthContext';

type AdjustmentAction = "minus";

// Helper function to check permissions
const hasPermission = (user: any, permission: string): boolean => {
  if (!user) return false;
  if (user.permissions?.includes("all") || user.permissions?.includes("*")) {
    return true;
  }
  return user.permissions?.includes(permission) || false;
};

const ProductAdjustmentsTab = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const {toast} = useToast();
  const queryClient = useQueryClient();

  const pageSize = 10;

  const hasViewProductAdjustments = hasPermission(user, "view:product adjustments");
  const hasCreateProductAdjustments = hasPermission(user, "create:product adjustments");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
  });

  const reasonsQuery = useQuery({
    queryKey: ["adjustmentReasons"],
    queryFn: () => settingsService.getAdjustmentReasons(),
  });

  const adjustmentsQuery = useQuery({
    queryKey: ['product-adjustments', dateRange, debouncedSearchTerm, currentPage],
    queryFn: () => {
      const params: any = {page: currentPage, limit: pageSize};
      if (debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim();
      } else {
        if (dateRange?.from) {
          params.startDate = format(dateRange.from, "yyyy-MM-dd");
        }
        if (dateRange?.to) {
          params.endDate = format(dateRange.to, "yyyy-MM-dd");
        }
      }
      return getProductAdjustments(params);
    },
    enabled: hasViewProductAdjustments,
  });

  const totalPages = adjustmentsQuery.data ? Math.ceil(adjustmentsQuery.data.total / pageSize) : 0;

  const createAdjustmentMutation = useMutation({
    mutationFn: createProductAdjustment,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Adjustment created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['product-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Reset form
      setDialogOpen(false);
      setSelectedProductId("");
      setAmount("");
      setReason("");
      // setAction("add"); // Removed - only minus actions allowed
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create adjustment",
        variant: "destructive",
      });
    },
  });

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !amount || !reason) return;

    const rawAmount = parseFloat(amount);
    
    // Find the selected product to get current quantity
    const selectedProduct = productsQuery.data?.find(p => p.id.toString() === selectedProductId);
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Selected product not found",
        variant: "destructive",
      });
      return;
    }

    // Validate that reduction doesn't exceed current quantity
    if (rawAmount > selectedProduct.quantity) {
      toast({
        title: "Error",
        description: "Reduction amount cannot exceed current quantity",
        variant: "destructive",
      });
      return;
    }

    // Apply reduction (always negative for expirations/waste)
    const adjustmentAmount = rawAmount;

    createAdjustmentMutation.mutate({
      productId: parseInt(selectedProductId),
      amount: adjustmentAmount,
      reason: reason,
    });
  };

  if (!hasViewProductAdjustments) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h1 className="text-2xl font-bold text-muted-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to view product adjustments.</p>
        </div>
      </div>
    );
  }

  if (adjustmentsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search Adjustments"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          {hasCreateProductAdjustments && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Adjustment
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-warm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Adjustments</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Created By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustmentsQuery.data?.adjustments?.map((adjustment) => {
                const product = adjustment.product;
                
                return (
                  <TableRow key={adjustment.id}>
                       <TableCell>
                      {format(new Date(adjustment.createdAt), "dd-MM-yyyy")}
                    </TableCell>
                    <TableCell>{product?.name || "Unknown"}</TableCell>
                    <TableCell>
                      
                      {adjustment.amount}
                    </TableCell>
                    <TableCell>{adjustment.reason}</TableCell>
                    <TableCell>
                      {adjustment.createdBy ? `${adjustment.createdBy.name}` : 'Unknown'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {adjustmentsQuery.data?.adjustments?.length === 0 && !adjustmentsQuery.isLoading && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No adjustments found
              </h3>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Add Adjustment Dialog */}
      {hasCreateProductAdjustments && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Product Adjustments</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitAdjustment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={selectedProductId}
                  onValueChange={(value) => {
                    setSelectedProductId(value);
                    setAmount(""); // Clear amount when product changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {productsQuery.data?.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedProductId && (
                <div className="space-y-2">
                  <Label>Current Stock</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-lg font-semibold">
                      {(() => {
                        const selectedProduct = productsQuery.data?.find(p => p.id.toString() === selectedProductId);
                        return selectedProduct?.quantity?.toLocaleString() || '0';
                      })()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Available for reduction
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="amount">Quantity to Reduce</Label>
                <Input
                  id="amount"
                  type="text"
                  value={amount ? parseFloat(amount).toLocaleString() : ''}
                  onChange={(e) => setAmount(e.target.value.replace(/,/g, ''))}
                  placeholder="Enter quantity to reduce"
                  max={selectedProductId ? productsQuery.data?.find(p => p.id.toString() === selectedProductId)?.quantity : undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonsQuery.data?.map((reason) => (
                      <SelectItem key={reason.id} value={reason.name}>
                        {reason.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAdjustmentMutation.isPending || !selectedProductId || !amount || !reason}
                >
                  {createAdjustmentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Adjustment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProductAdjustmentsTab;