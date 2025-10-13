import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { GoodsReceiptResponse, purchasesService, type GoodsReceipt } from "@/services/purchases";
import { Link } from "react-router-dom";
import { DateRangePicker, DateRange } from "@/components/ui/DateRange";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

export default function GoodsReceivingTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGR, setSelectedGR] = useState<GoodsReceipt | null>(null);
  const [isViewGRDialogOpen, setIsViewGRDialogOpen] = useState(false);

  const goodsReceiptsQuery = useQuery<{ goodsReceipts: GoodsReceiptResponse[], total: number }>({
    queryKey: ['goodsReceipts', currentPage, filterStatus, dateRange, debouncedSearch],
    queryFn: () => purchasesService.getAllReceipts({
      page: currentPage,
      status: filterStatus === "all" ? undefined : filterStatus,
      startDate: dateRange?.from?.toISOString(),
      endDate: dateRange?.to?.toISOString(),
      search: debouncedSearch || undefined,
    }),
  });

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

  const goodsReceiving = goodsReceiptsQuery.data?.goodsReceipts || [];
  const total = goodsReceiptsQuery.data?.total || 0;
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);
  const isLoading = goodsReceiptsQuery.isLoading;
  const hasError = goodsReceiptsQuery.error;


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
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 w-full">
        {/* Search + Status */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
      
        </div>

        {/* Dates */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>
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
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading state
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center w-full">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading goods receipts...
                    </div>
                  </TableCell>
                </TableRow>
              ) : hasError ? (
                // Error state
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-destructive mb-2">Failed to load goods receipts</p>
                      <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : goodsReceiving.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center w-full">
                    <div className="flex flex-col items-center justify-center">
                      <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No goods receipts found
                      </h3>
                      <p className="text-muted-foreground">
                        {debouncedSearch || dateRange
                          ? "Try adjusting your filters or search terms"
                          : "Goods receipts will appear here when purchase orders are received"
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data rows
                goodsReceiving.map(gr => (
                  <TableRow key={gr.id}>
                    <TableCell>{gr.purchaseOrderId}</TableCell>
                    <TableCell>{format(new Date(gr.receivedDate), 'dd-MM-yyyy')}</TableCell>
                    <TableCell> {gr.supplierName} </TableCell>
                    <TableCell> {gr.total.toLocaleString()} </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(gr.status)}>
                        {capitalizeStatus(gr.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" >
                        <Link to={`/purchases/${gr.purchaseOrderId}/receive`} className="flex justify-between items-center"><Eye className="h-4 w-4 mr-1" />
                        View</Link>
                      </Button>
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