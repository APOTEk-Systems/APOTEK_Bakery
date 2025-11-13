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
import { settingsService } from "../../services/settings";
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

  const reasonsQuery = useQuery({
    queryKey: ["adjustmentReasons"],
    queryFn: () => settingsService.getAdjustmentReasons(),
  });

  const adjustmentsQuery = useQuery({
    queryKey: ['adjustments', type, dateRange, debouncedSearchTerm],
    queryFn: () => {
      const params: any = {type, page: 1, limit: 100};
      if (debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim();
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
    if (!selectedItemId || !amount || !reason) return;

    // Convert amount into base unit
    const rawAmount = parseFloat(amount);
    const convertedAmount = toBaseUnits(rawAmount, unit);

    // Apply add/minus action
    const adjustmentAmount =
      action === "add" ? convertedAmount : -convertedAmount;

    createAdjustmentMutation.mutate({
      inventoryItemId: parseInt(selectedItemId),
      amount: adjustmentAmount, // stored in base unit
      reason: reason,
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
            New Adjustment
          </Button>
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
                <TableHead>Item Name</TableHead>
                <TableHead>Unit</TableHead>
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
                    <TableCell>{unit}</TableCell>
                    <TableCell>
                      {adjustment.amount > 0 ? "+" : "-"}
                      {displayAmount.toLocaleString()}
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
            <DialogTitle>New Material Adjustment</DialogTitle>
            {/* <DialogDescription>
              Create a new adjustment for {title.toLowerCase()} inventory.
            </DialogDescription> */}
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
                type="text"
                value={amount ? parseFloat(amount).toLocaleString() : ''}
                onChange={(e) => setAmount(e.target.value.replace(/,/g, ''))}
                placeholder={`Enter quantity in ${unit}`}
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
                disabled={createAdjustmentMutation.isPending || !selectedItemId || !amount || !reason}
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
