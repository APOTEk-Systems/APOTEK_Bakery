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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {DateRangePicker, DateRange} from "@/components/ui/DateRange";
import {
  getInventory,
  getAdjustments,
  createAdjustment,
  InventoryItem,
} from "../../services/inventory";
import {format} from "date-fns";
import {fromBaseUnits, toBaseUnits} from "@/lib/funcs";

type AdjustmentAction = "add" | "minus";

interface InventoryAdjustmentsTabProps {
  type: "raw_material" | "supplies";
  title: string;
}

const InventoryAdjustmentsTab = ({
  type,
  title,
}: InventoryAdjustmentsTabProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [action, setAction] = useState<AdjustmentAction>("add");
  const [unit, setUnit] = useState("kg");
  const {toast} = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const inventoryQuery = useQuery({
    queryKey: ['inventory', type],
    queryFn: () => getInventory({type}),
  });

  const adjustmentsQuery = useQuery({
    queryKey: ['adjustments', type, dateRange, debouncedSearchTerm],
    queryFn: () => {
      const params: any = {type};
      if (debouncedSearchTerm.trim()) {
        params.name = debouncedSearchTerm.trim();
      } else {
        if (dateRange?.from) {
          params.startDate = dateRange.from.toISOString().split('T')[0];
        }
        if (dateRange?.to) {
          params.endDate = dateRange.to.toISOString().split('T')[0];
        }
      }
      return getAdjustments(params);
    },
  });

  const createAdjustmentMutation = useMutation({
    mutationFn: createAdjustment,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Adjustment created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['adjustments'] });
      // Reset form
      setDialogOpen(false);
      setSelectedItemId("");
      setAmount("");
      setReason("");
      setAction("add");
      setUnit("kg");
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
    if (!selectedItemId || !amount) return;

    // Convert amount into base unit
    const rawAmount = parseFloat(amount);
    const convertedAmount = toBaseUnits(rawAmount, unit);

    // Apply add/minus action
    const adjustmentAmount =
      action === "add" ? convertedAmount : -convertedAmount;

    createAdjustmentMutation.mutate({
      inventoryItemId: parseInt(selectedItemId),
      amount: adjustmentAmount, // stored in base unit
      reason: reason.trim() || undefined,
    });
  };

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
              placeholder="Search by item name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Adjustment
          </Button>
        </div>
      </div>

      <Card className="shadow-warm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Material Adjustments</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reason</TableHead>
                
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustmentsQuery.data?.adjustments?.map((adjustment) => {
                const item = adjustment.inventoryItem;
                const unit = item?.unit || "g"; // fallback
                const displayAmount = fromBaseUnits(
                  Math.abs(adjustment.amount),
                  unit
                );

                return (
                  <TableRow key={adjustment.id}>
                       <TableCell>
                      {format(new Date(adjustment.createdAt), "dd-MM-yyyy")}
                    </TableCell>
                    <TableCell>{item?.name || "Unknown"}</TableCell>
                    <TableCell>
                      {adjustment.amount > 0 ? "+" : "-"}
                      {displayAmount} {unit}
                    </TableCell>
                    <TableCell>{adjustment.reason}</TableCell>

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
              <p className="text-muted-foreground mb-4">
                {dateRange
                  ? "No adjustments for selected date range"
                  : "Get started by adding your first adjustment"}
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                Add Adjustment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Adjustment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Adjustment</DialogTitle>
            <DialogDescription>
              Create a new adjustment for {title.toLowerCase()} inventory.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdjustment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item">Item</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryQuery.data?.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select
                  value={action}
                  onValueChange={(value: AdjustmentAction) => setAction(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add</SelectItem>
                    <SelectItem value="minus">Minus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="l">l</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="pieces">pieces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Quantity</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter quantity in ${unit}`}
                step="0.01"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for adjustment"
              />
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
                disabled={createAdjustmentMutation.isPending || !selectedItemId || !amount}
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
    </div>
  );
};

export default InventoryAdjustmentsTab;
