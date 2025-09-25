import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Edit,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  Trash2,
  Loader2,
  Plus as PlusIcon
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getInventory, deleteInventoryItem, createAdjustment, InventoryItem } from "../../services/inventory";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/funcs";

interface InventoryListTabProps {
  type: 'raw_material' | 'supplies';
  title: string;
}

const InventoryListTab = ({ type, title }: InventoryListTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedDeleteId, setSelectedDeleteId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const inventoryQuery = useQuery({
    queryKey: ['inventory', type],
    queryFn: () => getInventory({ type }),
  });

  const adjustMutation = useMutation({
    mutationFn: (data: { inventoryItemId: number; amount: number; reason?: string }) => createAdjustment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', type] });
      toast({
        title: "Success",
        description: "Quantity adjusted successfully",
      });
      setAdjustDialogOpen(false);
      setAmount("");
      setReason("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to adjust quantity",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', type] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const inventoryData = inventoryQuery.data || [];
  const loading = inventoryQuery.isLoading;
  const error = inventoryQuery.error;

  const filteredInventory = inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatus = (currentQuantity: number, minLevel: number) => {
    if (currentQuantity <= minLevel * 0.5) return "critical";
    if (currentQuantity <= minLevel) return "low";
    return "in-stock";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "destructive";
      case "low": return "secondary";
      case "in-stock": return "default";
      default: return "outline";
    }
  };

  const openAdjustDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setAmount("");
    setReason("");
    setAdjustDialogOpen(true);
  };

  const handleAdjustQuantity = () => {
    if (!selectedItem || !amount || parseFloat(amount) === 0) return;
    adjustMutation.mutate({
      inventoryItemId: selectedItem.id,
      amount: parseFloat(amount),
      reason: reason.trim() || undefined
    });
  };

  const openDeleteDialog = (id: string) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Add Button */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button asChild className="shadow-warm">
          <Link to={`/${type === 'raw_material' ? 'inventory' : 'supplies'}/new`}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add {type === 'raw_material' ? 'Raw Material' : 'Supply'}
          </Link>
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{error instanceof Error ? error.message : 'Failed to load inventory'}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-warm">
          <CardHeader>
            <CardTitle>{title} Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Min Level</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => {
                  const status = getStatus(item.currentQuantity, item.minLevel);

                  // Convert display values for kg/l units
                  let displayUnit = item.unit || 'N/A';
                  let displayQuantity = item.currentQuantity;
                  let displayMinLevel = item.minLevel;
                  let displayCost = item.cost;

                  if (item.unit.toLowerCase() === 'kg') {
                    displayUnit = 'kg';
                    displayQuantity = item.currentQuantity / 1000;
                    displayCost = item.cost * 1000
                  } else if (item.unit.toLowerCase() === 'l') {
                    displayUnit = 'l';
                    displayQuantity = item.currentQuantity / 1000;
                    displayCost = item.cost * 1000
                  } else {
                    // Leave as is for other units
                  }

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{displayUnit}</TableCell>
                      <TableCell>{displayQuantity}</TableCell>
                      <TableCell>{displayMinLevel}</TableCell>
                      <TableCell>{formatCurrency(displayCost)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(status)}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/${type === 'raw_material' ? 'inventory' : 'supplies'}/${item.id}/edit`}>
                              <Edit className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(item.id.toString())}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAdjustDialog(item)}
                            disabled={adjustMutation.isPending}
                          >
                            <PlusIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredInventory.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No items found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Try adjusting your search" : `Get started by adding your first ${title.toLowerCase()} item`}
                </p>
                <Button asChild>
                  <Link to={`/${type === 'raw_material' ? 'inventory' : 'supplies'}/new`}>Add {title}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quantity Adjustment Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Quantity</DialogTitle>
            <DialogDescription>
              Adjust the quantity for {selectedItem?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (positive to add, negative to subtract)"
                step="0.01"
                disabled={adjustMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for adjustment"
                disabled={adjustMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAdjustDialogOpen(false)} disabled={adjustMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleAdjustQuantity}
              disabled={!amount || parseFloat(amount) === 0 || adjustMutation.isPending}
            >
              {adjustMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adjust
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedDeleteId && confirmDelete(selectedDeleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryListTab;