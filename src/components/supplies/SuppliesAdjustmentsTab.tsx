import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Loader2, Calendar } from "lucide-react";
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
import { format } from 'date-fns';

type AdjustmentAction = 'add' | 'minus';

const SuppliesAdjustmentsTab = () => {
  const [date, setDate] = useState("");
  const [adjustments, setAdjustments] = useState([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [action, setAction] = useState<AdjustmentAction>('add');
  const [submitLoading, setSubmitLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInventory();
    fetchAdjustments();
  }, [date]);

  const fetchInventory = async () => {
    try {
      const data = await getInventory({ type: "supplies" });
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
      const params = date ? { date, type: "supplies" } : { type: "supplies" };
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
      const adjustmentAmount = action === 'add' ? parseFloat(amount) : -parseFloat(amount);
      await createAdjustment({
        inventoryItemId: parseInt(selectedItemId),
        amount: adjustmentAmount,
        reason: reason.trim() || undefined,
      });
      toast({
        title: "Success",
        description: "Adjustment created successfully",
      });
      setDialogOpen(false);
      setSelectedItemId("");
      setAmount("");
      setReason("");
      setAction('add');
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
        <div className="flex-1 relative">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="pl-10"
          />
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button onClick={fetchAdjustments}>Filter</Button>
      </div>

      <Card className="shadow-warm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Supplies Issued</CardTitle>
            <Button onClick={() => setDialogOpen(true)} className="shadow-warm">
              <Plus className="h-4 w-4 mr-2" />
              Issue Supplies
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
              {adjustments.map((adjustment) => (
                <TableRow key={adjustment.id}>
                  <TableCell>
                    {inventory.find(
                      (item) => item.id === adjustment.inventoryItemId
                    )?.name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    {adjustment.amount > 0
                      ? `+${adjustment.amount}`
                      : adjustment.amount}
                  </TableCell>
                  <TableCell>{adjustment.reason}</TableCell>
                  <TableCell>
                    {format(new Date(adjustment.createdAt), 'dd-MM-yyyy')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {adjustments.length === 0 && !loading && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No supplies issued
              </h3>
              <p className="text-muted-foreground mb-4">
                {date
                  ? "No supplies for selected date"
                  : "Get started issuing supplies"}
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                Issue Supplies
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Adjustment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Supplies Issue</DialogTitle>
            <DialogDescription>
              Issue new Supplies.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdjustment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item">Item</Label>
              <Select
                value={selectedItemId}
                onValueChange={setSelectedItemId}
              >
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
              <Label htmlFor="amount">Quantity</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter quantity to ${action}`}
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
                placeholder="Reason for issuing the supplies"
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

export default SuppliesAdjustmentsTab;