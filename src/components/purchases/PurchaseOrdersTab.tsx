import { useState, useEffect } from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Loader2,
  Trash,
  Eye,
  Truck,
} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {suppliersService, type Supplier} from "@/services/suppliers";
import {purchasesService, type PurchaseOrder} from "@/services/purchases";
import type {InventoryItem} from "@/services/inventory";
import {getInventory} from "@/services/inventory";
import {formatCurrency} from "@/lib/funcs";
import {Link} from "react-router-dom";
import { DateRangePicker, DateRange } from "@/components/ui/DateRange";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import type {GoodsReceiptItem} from "@/services/purchases";
import { format } from "date-fns";

interface POItem {
  inventoryItemId: string;
  quantity: number;
  price: number;
  unit: string;
}
export default function PurchaseOrdersTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreatePODialogOpen, setIsCreatePODialogOpen] = useState(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [selectedPOForReceive, setSelectedPOForReceive] =
    useState<PurchaseOrder | null>(null);
  const [receiveForm, setReceiveForm] = useState<GoodsReceiptItem[]>([]);
  const [receiveNotes, setReceiveNotes] = useState("");
  const [createPOForm, setCreatePOForm] = useState<{
    supplierId: string;
    items: POItem[];
  }>({
    supplierId: "",
    items: [{inventoryItemId: "", quantity: 0, price: 0, unit: ""}],
  });
  const {toast} = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, dateRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const suppliersQuery = useQuery<Supplier[]>({
    queryKey: ["suppliers"],
    queryFn: () => suppliersService.getAll(),
  });

  const purchaseOrdersQuery = useQuery<{ purchaseOrders: PurchaseOrder[], total: number }>({
    queryKey: ["purchaseOrders", currentPage, filterStatus, dateRange, debouncedSearch],
    queryFn: () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      return purchasesService.getAllPOs({
        page: currentPage,
        status: filterStatus === "all" ? undefined : filterStatus,
        startDate: dateRange?.from?.toISOString() ?? startOfMonth.toISOString(),
        endDate: dateRange?.to?.toISOString() ?? now.toISOString(),
        search: debouncedSearch || undefined,
      });
    },
  });

  const inventoryQuery = useQuery<InventoryItem[]>({
    queryKey: ["inventory"],
    queryFn: () => getInventory(),
  });

  const suppliers = suppliersQuery.data || [];
  const purchaseOrders = purchaseOrdersQuery.data?.purchaseOrders || [];
  const total = purchaseOrdersQuery.data?.total || 0;
  const inventoryItems: InventoryItem[] = inventoryQuery.data || [];
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  const isLoading =
    suppliersQuery.isLoading ||
    purchaseOrdersQuery.isLoading ||
    inventoryQuery.isLoading;
  const hasError =
    suppliersQuery.error || purchaseOrdersQuery.error || inventoryQuery.error;

  const supplierMap = suppliers.reduce((acc, s) => {
    acc[s.id] = s.name;
    return acc;
  }, {} as Record<number, string>);

  const inventoryMap = inventoryItems.reduce((acc, i) => {
    acc[i.id] = i.name;
    return acc;
  }, {} as Record<number, string>);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return "default";
      case "pending":
        return "outline";
      case "cancelled":
        return "secondary";
      default:
        return "default";
    }
  };

  const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const createPOMutation = useMutation({
    mutationFn: (data: any) => purchasesService.createPO(data),
    onSuccess: (newPO) => {
      queryClient.invalidateQueries({queryKey: ["purchaseOrders"]});
      toast({
        title: "PO Created",
        description: `Purchase order created successfully.`,
      });
      setIsCreatePODialogOpen(false);
      setCreatePOForm({
        supplierId: "",
        items: [{inventoryItemId: "", quantity: 0, price: 0, unit: ""}],
      });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: "Failed to create PO",
        variant: "destructive",
      });
    },
  });

  const receiveMutation = useMutation({
    mutationFn: (data: {
      purchaseOrderId: number;
      items: GoodsReceiptItem[];
      notes?: string;
    }) => purchasesService.createReceipt(data),
    onSuccess: (newReceipt) => {
      queryClient.invalidateQueries({queryKey: ["purchaseOrders"]});
      toast({
        title: "Materials Received",
        description: `Materials received successfully.`,
      });
      setIsReceiveDialogOpen(false);
      setSelectedPOForReceive(null);
      setReceiveForm([]);
      setReceiveNotes("");
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: "Failed to create goods receipt",
        variant: "destructive",
      });
    },
  });

  const addItemToForm = () => {
    setCreatePOForm({
      ...createPOForm,
      items: [
        ...createPOForm.items,
        {inventoryItemId: "", quantity: 0, price: 0, unit: ""},
      ],
    });
  };

  const removeItemFromForm = (index: number) => {
    const newItems = createPOForm.items.filter((_, i) => i !== index);
    setCreatePOForm({...createPOForm, items: newItems});
  };

  const updateItemId = (index: number, id: string) => {
    const selectedItem = inventoryItems.find((inv) => inv.id.toString() === id);
    const newItems = createPOForm.items.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          inventoryItemId: id,
          price: selectedItem?.cost || 0,
          unit: selectedItem?.unit || "",
        };
      }
      return item;
    });
    setCreatePOForm({...createPOForm, items: newItems});
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = createPOForm.items.map((item, i) => {
      if (i === index) {
        return {...item, quantity};
      }
      return item;
    });
    setCreatePOForm({...createPOForm, items: newItems});
  };

  const updateItemPrice = (index: number, price: number) => {
    const newItems = createPOForm.items.map((item, i) => {
      if (i === index) {
        return {...item, price};
      }
      return item;
    });
    setCreatePOForm({...createPOForm, items: newItems});
  };

  const updateItemUnit = (index: number, unit: string) => {
    const newItems = createPOForm.items.map((item, i) => {
      if (i === index) {
        return {...item, unit};
      }
      return item;
    });
    setCreatePOForm({...createPOForm, items: newItems});
  };

  const calculateTotal = () => {
    return createPOForm.items.reduce((sum, item) => {
      let price = item.price;
      if (item.unit.toLowerCase() === "l" || item.unit.toLowerCase() === "kg") {
        price *= 1000;
      }
      return sum + item.quantity * price;
    }, 0);
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    const supplierId = parseInt(createPOForm.supplierId);
    if (
      isNaN(supplierId) ||
      createPOForm.items.some(
        (item) => !item.inventoryItemId || item.quantity === 0
      )
    ) {
      toast({
        title: "Invalid Form",
        description: "Please select supplier and fill item fields",
        variant: "destructive",
      });
      return;
    }
    const items = createPOForm.items.map((item) => {
      const quantity = item.quantity;
      let price = item.price;

      if (item.unit.toLowerCase() === "l" || item.unit.toLowerCase() === "kg") {
        price *= 1000;
      }

      return {
        inventoryItemId: parseInt(item.inventoryItemId, 10),
        quantity,
        price: price,
      };
    });
    const totalCost = calculateTotal();
    createPOMutation.mutate({supplierId, items, totalCost});
  };

  const handleReceiveGoods = (po: PurchaseOrder) => {
    const initialItems = po.items.map((item) => ({
      inventoryItemId: item.inventoryItemId,
      receivedQuantity: item.quantity,
      cost: item.price,
    }));
    setReceiveForm(initialItems);
    setReceiveNotes("");
    setSelectedPOForReceive(po);
    setIsReceiveDialogOpen(true);
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedPOForReceive ||
      receiveForm.some((item) => item.receivedQuantity <= 0)
    ) {
      toast({
        title: "Invalid Form",
        description: "Please enter valid received quantities",
        variant: "destructive",
      });
      return;
    }
    receiveMutation.mutate({
      purchaseOrderId: selectedPOForReceive.id,
      items: receiveForm,
      notes: receiveNotes,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end w-full">
        <Button
          onClick={() => setIsCreatePODialogOpen(true)}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Purchase Order
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
        {/* Search + Status */}
        <div className="flex sm:flex-row gap-4 w-full">
          <Input
            placeholder="Search by Order # or Supplier"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

           <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
        </div>

       
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading state
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading purchase orders...
                    </div>
                  </TableCell>
                </TableRow>
              ) : hasError ? (
                // Error state
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-destructive mb-2">
                        Failed to load purchase orders
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : purchaseOrders.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No purchase orders found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {filterStatus !== "all" || debouncedSearch || dateRange
                          ? "Try adjusting your filters or search terms"
                          : "Get started by creating your first purchase order"}
                      </p>
                      {!debouncedSearch && filterStatus === "all" && !dateRange && (
                        <Button onClick={() => setIsCreatePODialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          New Purchase Order
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data rows
                purchaseOrders.map((po) => (
                  <TableRow key={po.id} className="py-0">
                    <TableCell>{po.id}</TableCell>
                    <TableCell>{format(new Date(po.createdAt), "dd-MM-yyyy")}</TableCell>
                    <TableCell>
                      {supplierMap[po.supplierId] || "Unknown"}
                    </TableCell>
                    <TableCell>{po.items.length}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(po.totalCost).replace("TSH", "") ||
                        "0.00"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(po.status)}>
                        {capitalizeStatus(po.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          to={`/purchases/${po.id}`}
                          className="flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      {po.status === "approved" && (
                        <Button
                          variant="default"
                          onClick={() => handleReceiveGoods(po)}
                          disabled={receiveMutation.isPending}
                        >
                          {receiveMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Truck className="h-4 w-4 mr-1" />
                          )}
                          Receive
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                  isActive={currentPage === page}
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

      {/* Create PO Dialog */}
      <Dialog
        open={isCreatePODialogOpen}
        onOpenChange={setIsCreatePODialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePO} className="space-y-4">
            <div>
              <Label htmlFor="supplierId">Supplier *</Label>
              <Select
                value={createPOForm.supplierId}
                onValueChange={(v) =>
                  setCreatePOForm((prev) => ({...prev, supplierId: v}))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Items *</Label>
              <div className="space-y-2">
                <div className="flex gap-2 text-xs font-medium text-muted-foreground mb-1">
                  <div className="flex-1">Item</div>
                  <div className="w-20">Quantity</div>
                  <div className="w-20">Unit</div>
                  <div className="w-20">Price</div>
                </div>
                {createPOForm.items.map((item, index) => {
                  let displayPrice = item.price;
                  if (item.unit === "kg") {
                    displayPrice = item.price * 1000;
                  } else if (item.unit === "l") {
                    displayPrice = item.price * 1000;
                  }
                  return (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="sr-only">Item</Label>
                        <Select
                          value={item.inventoryItemId}
                          onValueChange={(v) => updateItemId(index, v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventoryItems.map((i) => (
                              <SelectItem key={i.id} value={i.id.toString()}>
                                {i.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-20">
                        <Label className="sr-only">Quantity</Label>
                        <Input
                          type="text"
                          value={item.quantity ? item.quantity.toLocaleString() : ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/,/g, "");
                            updateItemQuantity(
                              index,
                              val === "" ? 0 : parseInt(val, 10)
                            );
                          }}
                          placeholder="Qty"
                          className="w-full"
                          min="1"
                        />
                      </div>
                      <div className="w-20">
                        <Label className="sr-only">Unit</Label>
                        <Select
                          value={item.unit}
                          onValueChange={(v) => updateItemUnit(index, v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pieces">pieces</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="l">l</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-20">
                        <Label className="sr-only">Price</Label>
                        <Input
          type="text"
          value={
            displayPrice
              ? displayPrice.toLocaleString("en-US")
              : ""
          }
          onChange={(e) => {
            const raw = e.target.value.replace(/,/g, "");
            const userPrice = parseFloat(raw) || 0;

            // --- Convert back to base unit before saving ---
            let basePrice = userPrice;
            if (item.unit === "kg") {
              basePrice = userPrice / 1000; // convert kg → g
            } else if (item.unit === "l") {
              basePrice = userPrice / 1000; // convert l → ml
            }

            updateItemPrice(index, basePrice);
          }}
          placeholder="1,000"
          className="w-full text-right"
          inputMode="numeric"
          pattern="[0-9,]*"
        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeItemFromForm(index)}
                        variant="destructive"
                        size="sm"
                        disabled={createPOForm.items.length === 1}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
              <Button
                type="button"
                onClick={addItemToForm}
                variant="outline"
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Cost:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => setIsCreatePODialogOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createPOMutation.isPending}>
                {createPOMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create PO
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receive Goods Dialog */}
      <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Receive Goods for PO # {selectedPOForReceive?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedPOForReceive && (
            <form onSubmit={handleSubmitReceipt} className="space-y-4">
              <div>
                {/* <Label>Items and Costs</Label> */}
                <div className="space-y-2">
                  <div className="flex gap-2 text-xs font-medium text-muted-foreground mb-1">
                    <div className="flex-1">Item</div>
                    <div className="w-20">Quantity</div>
                    <div className="w-20">Unit</div>
                    {/* <div className="w-24">Unit Cost</div> */}
                    <div className="w-24">Total Cost</div>
                  </div>
                  {selectedPOForReceive.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input
                          value={
                            inventoryItems.find(
                              (i) => i.id === item.inventoryItemId
                            )?.name || "Unknown"
                          }
                          className="bg-muted"
                          readOnly
                        />
                      </div>
                      <div className="w-20">
                        <Input
                          type="number"
                          value={receiveForm[index]?.receivedQuantity?.toString() || ''}
                          onChange={(e) => {
                            const newForm = [...receiveForm];
                            newForm[index] = { ...newForm[index], receivedQuantity: parseFloat(e.target.value) || 0 };
                            setReceiveForm(newForm);
                          }}
                          className="bg-muted text-center"
                          readOnly
                        />
                      </div>
                      <div className="w-20">
                        <Input
                          value={
                            inventoryItems.find(
                              (i) => i.id === item.inventoryItemId
                            )?.unit || ""
                          }
                          className="bg-muted text-center"
                          readOnly
                        />
                      </div>
                      {/* <div className="w-24">
                        <Input
                          type="number"
                          step="0.01"
                          value={receiveForm[index]?.cost?.toString() || ''}
                          onChange={(e) => {
                            const newForm = [...receiveForm];
                            newForm[index] = { ...newForm[index], cost: parseFloat(e.target.value) || 0 };
                            setReceiveForm(newForm);
                          }}
                          className="bg-muted text-center"
                          readOnly
                        />
                      </div> */}
                      <div className="w-24">
                        <Input
                          value={formatCurrency((receiveForm[index]?.receivedQuantity || 0) * (receiveForm[index]?.cost || 0)).replace('TSH', '')}
                          className="bg-muted text-center"
                          readOnly
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="receiveNotes">Notes</Label>
                <Textarea
                  id="receiveNotes"
                  value={receiveNotes}
                  onChange={(e) => setReceiveNotes(e.target.value)}
                  placeholder="Add any notes..."
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => setIsReceiveDialogOpen(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={receiveMutation.isPending}>
                  {receiveMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Truck className="mr-2 h-4 w-4" />
                  )}
                  Receive Goods
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
