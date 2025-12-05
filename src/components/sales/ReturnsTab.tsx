import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateRangePicker, DateRange } from '@/components/ui/DateRange';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2, RotateCcw, Check, X } from 'lucide-react';
import { api } from '@/lib/api';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Helper function to check permissions
const hasPermission = (user: any, permission: string): boolean => {
  if (!user) return false;
  if (user.permissions?.includes("all") || user.permissions?.includes("*")) {
    return true;
  }
  return user.permissions?.includes(permission) || false;
};

// Types for sales adjustments (returns)
interface SalesAdjustment {
  id: number;
  saleId: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  createdAt: string;
  requestedBy: {
    id: number;
    name: string;
  };
  approvedBy?: {
    id: number;
    name: string;
  };
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    notes?: string;
    product?: {
      id: number;
      name: string;
      price: number;
    };
  }>;
  sale?: {
    id: number;
    customer?: {
      name: string;
    };
    total: number;
    createdAt: string;
  };
}

// API service for sales adjustments
const salesAdjustmentsApi = {
getAll: async (params: any = {}) => {
  const response = await api.get('/sales-adjustments', { params });
  return response.data;
},
approve: async (id: number) => {
  const response = await api.patch(`/sales-adjustments/${id}/approve`);
  return response.data;
},
decline: async (id: number) => {
  const response = await api.patch(`/sales-adjustments/${id}/decline`);
  return response.data;
},
};

const ReturnsTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedReturn, setSelectedReturn] = useState<SalesAdjustment | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);

  const getVisiblePages = (current: number, total: number): (number | string)[] => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < total - 1) {
      rangeWithDots.push('...', total);
    } else if (total > 1) {
      rangeWithDots.push(total);
    }

    return rangeWithDots;
  };

  const hasViewSales = hasPermission(user, "view:sales-adjustments");
  const hasApproveAdjustments = hasPermission(user, "approve:sales-adjustments");

  // Fetch returns (sales adjustments) using React Query
  const { data: returnsData, isLoading: loading, error } = useQuery({
    queryKey: ['sales-adjustments', searchTerm, dateRange, page, limit],
    queryFn: async () => {
      const params: any = { page, limit };
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (dateRange?.from) {
        params.startDate = dateRange.from.toISOString().split('T')[0];
      }
      if (dateRange?.to) {
        params.endDate = dateRange.to.toISOString().split('T')[0];
      }
      
      const response = await salesAdjustmentsApi.getAll(params);
      return {
        adjustments: response.returns || [],
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: response.currentPage || page,
      };
    },
    enabled: hasViewSales,
  });

  const returns = returnsData?.adjustments || [];
  const totalPages = returnsData?.totalPages || 1;
  const currentPage = returnsData?.currentPage || 1;


  // Mutations for approving/declining returns
  const approveMutation = useMutation({
    mutationFn: (id: number) => salesAdjustmentsApi.approve(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Return approved successfully",
      });
      setIsApproveDialogOpen(false);
      setSelectedReturn(null);
      queryClient.invalidateQueries({ queryKey: ['sales-adjustments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to approve return",
        variant: "destructive",
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (id: number) => salesAdjustmentsApi.decline(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Return declined successfully",
      });
      setIsDeclineDialogOpen(false);
      setSelectedReturn(null);
      queryClient.invalidateQueries({ queryKey: ['sales-adjustments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to decline return",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (returnItem: SalesAdjustment) => {
    setSelectedReturn(returnItem);
    setIsApproveDialogOpen(true);
  };

  const handleDecline = (returnItem: SalesAdjustment) => {
    setSelectedReturn(returnItem);
    setIsDeclineDialogOpen(true);
  };

  const confirmApprove = () => {
    if (selectedReturn) {
      approveMutation.mutate(selectedReturn.id);
    }
  };

  const confirmDecline = () => {
    if (selectedReturn) {
      declineMutation.mutate(selectedReturn.id);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-TZ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-TZ');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'APPROVED':
        return <Badge variant="default">Approved</Badge>;
      case 'PENDING':
        return <Badge variant="outline">Pending</Badge>;
      case 'DECLINED':
        return <Badge variant="secondary">Declined</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const calculateReturnValue = (returnItem: SalesAdjustment) => {
    return returnItem.items.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + (Math.abs(item.quantity) * price);
    }, 0);
  };

  if (!hasViewSales) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h1 className="text-2xl font-bold text-muted-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to view returns.</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className='py-4'>
        {/* <CardTitle>Returns</CardTitle> */}
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-2">
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by receipt # or customer"
            className="flex-1"
          />
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={(newRange) => {
              setDateRange(newRange);
              setPage(1);
            }}
          />
        </div>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2 text-muted-foreground">Loading returns...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Error loading returns
          </div>
        ) : returns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No returns found
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Reason</TableHead>
                  {/* <TableHead className="text-right">Return Value</TableHead> */}
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.map((returnItem: SalesAdjustment, index: number) => (
                  <TableRow key={returnItem.id} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                    <TableCell>
                      {formatDate(returnItem.createdAt)}
                    </TableCell>
                    <TableCell>
                      {returnItem.saleId}
                    </TableCell>
                    <TableCell>
                      {returnItem.sale?.customer?.name || 'CASH'}
                    </TableCell>
                    <TableCell>{returnItem.reason}</TableCell>
                    {/* <TableCell className="text-right">
                      <span className="text-destructive font-medium">
                        -{formatCurrency(calculateReturnValue(returnItem))}
                      </span>
                    </TableCell> */}
                    <TableCell>
                      {getStatusBadge(returnItem.status)}
                    </TableCell>
                    <TableCell>
                      {returnItem.status === 'PENDING' && hasApproveAdjustments ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(returnItem)}
                            disabled={approveMutation.isPending || declineMutation.isPending}
                            className="bg-primary hover:bg-primary/90 text-white"
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDecline(returnItem)}
                            disabled={approveMutation.isPending || declineMutation.isPending}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                          >
                            <X className="h-4 w-4" />
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No actions
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {getVisiblePages(currentPage, totalPages).map((pageNum, index) => (
                      <PaginationItem key={index}>
                        {pageNum === '...' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => setPage(pageNum as number)}
                            isActive={pageNum === currentPage}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}

        {/* Approve Confirmation Dialog */}
        <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Return</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve this return request? This will process the return and update inventory accordingly.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmApprove}
                disabled={approveMutation.isPending}
                className="bg-primary"
              >
                {approveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Approve Return
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Decline Confirmation Dialog */}
        <AlertDialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Decline Return</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to decline this return request? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDecline}
                disabled={declineMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {declineMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Declining...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Decline Return
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default ReturnsTab;