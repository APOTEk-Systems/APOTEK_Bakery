import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { purchasesService, type GoodsReceipt } from "@/services/purchases";

export default function GoodsReceivingTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [selectedGR, setSelectedGR] = useState<GoodsReceipt | null>(null);
  const [isViewGRDialogOpen, setIsViewGRDialogOpen] = useState(false);

  const goodsReceiptsQuery = useQuery<GoodsReceipt[]>({
    queryKey: ['goodsReceipts'],
    queryFn: () => purchasesService.getAllReceipts(),
  });

  const goodsReceiving = goodsReceiptsQuery.data || [];

  const filteredGR = goodsReceiving.filter(gr => {
    const dateKey = date ? new Date(date.setHours(0, 0, 0, 0)).toISOString().split('T')[0] : null;
    return (gr.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      gr.purchaseOrderId.toString().toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!dateKey || new Date(gr.receivedDate).toISOString().split('T')[0] === dateKey);
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved": case "completed": return "default";
      case "pending": return "outline";
      case "cancelled": return "secondary";
      default: return "default";
    }
  };

  const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleViewGR = (gr: GoodsReceipt) => {
    setSelectedGR(gr);
    setIsViewGRDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by ID or PO ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date || undefined}
              onSelect={(d) => setDate(d || null)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>PO ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGR.map(gr => (
                <TableRow key={gr.id}>
                  <TableCell>{gr.id}</TableCell>
                  <TableCell>{gr.purchaseOrderId}</TableCell>
                  <TableCell>{format(new Date(gr.receivedDate), 'dd-MM-yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(gr.status)}>
                      {capitalizeStatus(gr.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleViewGR(gr)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredGR.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No goods receipts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View GR Dialog */}
      <Dialog open={isViewGRDialogOpen} onOpenChange={setIsViewGRDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Goods Receipt Details</DialogTitle>
          </DialogHeader>
          {selectedGR && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Receipt ID</Label>
                  <p className="font-medium">{selectedGR.id}</p>
                </div>
                <div>
                  <Label>PO ID</Label>
                  <p className="font-medium">PO #{selectedGR.purchaseOrderId}</p>
                </div>
              </div>
              <div>
                <Label>Date Received</Label>
                <p>{format(new Date(selectedGR.receivedDate), 'dd-MM-yyyy')}</p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant={getStatusVariant(selectedGR.status)}>
                  {capitalizeStatus(selectedGR.status)}
                </Badge>
              </div>
              {selectedGR.notes && (
                <div>
                  <Label>Notes</Label>
                  <p>{selectedGR.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewGRDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}