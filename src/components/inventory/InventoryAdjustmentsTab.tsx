import {useState, useEffect} from "react";
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
import {Calendar} from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {useToast} from "@/hooks/use-toast";
import {Search, Plus, Loader2, CalendarDays} from "lucide-react";
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
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [adjustments, setAdjustments] = useState([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [action, setAction] = useState<AdjustmentAction>("add");
  const [unit, setUnit] = useState("kg");
  const [submitLoading, setSubmitLoading] = useState(false);
  const {toast} = useToast();

  useEffect(() => {
    fetchInventory();
    fetchAdjustments();
  }, [date]);

  const fetchInventory = async () => {
    try {
      const data = await getInventory({type});
      setInventory(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load inventory",
        variant: "destructive",
      });
    }
  };

  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      const params = date ? {date: date.toISOString().split('T')[0], type} : {type};
      const data = await getAdjustments(params);
      setAdjustments(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load adjustments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !amount) return;

    try {
      setSubmitLoading(true);

      // Convert amount into base unit
      const rawAmount = parseFloat(amount);
      const convertedAmount = toBaseUnits(rawAmount, unit);

      // Apply add/minus action
      const adjustmentAmount =
        action === "add" ? convertedAmount : -convertedAmount;

      await createAdjustment({
        inventoryItemId: parseInt(selectedItemId),
        amount: adjustmentAmount, // stored in base unit
        reason: reason.trim() || undefined,
      });

      toast({
        title: "Success",
        description: "Adjustment created successfully",
      });

      // Reset
      setDialogOpen(false);
      setSelectedItemId("");
      setAmount("");
      setReason("");
      setAction("add");
      setUnit("kg");

      fetchAdjustments();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create adjustment",
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  setDate(selectedDate);
                  setDatePopoverOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button onClick={fetchAdjustments}>Filter</Button>
      </div>

      <Card className="shadow-warm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{title} Adjustments</CardTitle>
            <Button onClick={() => setDialogOpen(true)} className="shadow-warm">
              <Plus className="h-4 w-4 mr-2" />
              Add Adjustment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustments.map((adjustment) => {
                const item = inventory.find(
                  (i) => i.id === adjustment.inventoryItemId
                );
                const unit = item?.unit || "g"; // fallback
                const displayAmount = fromBaseUnits(
                  Math.abs(adjustment.amount),
                  unit
                );

                return (
                  <TableRow key={adjustment.id}>
                    <TableCell>{item?.name || "Unknown"}</TableCell>
                    <TableCell>
                      {adjustment.amount > 0 ? "+" : "-"}
                      {displayAmount} {unit}
                    </TableCell>
                    <TableCell>{adjustment.reason}</TableCell>
                    <TableCell>
                      {format(new Date(adjustment.createdAt), "dd-MM-yyyy")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {adjustments.length === 0 && !loading && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No adjustments found
              </h3>
              <p className="text-muted-foreground mb-4">
                {date
                  ? `No adjustments for ${format(date, "PPP")}`
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
                  {inventory.map((item) => (
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
                disabled={submitLoading || !selectedItemId || !amount}
              >
                {submitLoading ? (
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
