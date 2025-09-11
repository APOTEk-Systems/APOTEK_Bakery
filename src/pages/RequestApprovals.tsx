import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StockRequest {
  id: string;
  item: string;
  category: string;
  currentStock: number;
  requestedAmount: number;
  unit: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  reason: string;
  requestedBy: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  estimatedCost?: number;
  supplier?: string;
}

const mockPendingRequests: StockRequest[] = [
  {
    id: "REQ-004",
    item: "Active Dry Yeast",
    category: "Baking Ingredients",
    currentStock: 3,
    requestedAmount: 20,
    unit: "packets",
    priority: "Critical",
    reason: "Essential for bread production, current stock will last only 2 days",
    requestedBy: "Sarah Johnson",
    requestDate: "2024-01-16",
    status: "Pending",
    estimatedCost: 35.00,
    supplier: "Baker's Supply Co."
  },
  {
    id: "REQ-005",
    item: "Chocolate Chips",
    category: "Baking Ingredients", 
    currentStock: 12,
    requestedAmount: 30,
    unit: "kg",
    priority: "High",
    reason: "High demand for chocolate chip cookies and muffins, need to restock",
    requestedBy: "Mike Chen",
    requestDate: "2024-01-15",
    status: "Pending",
    estimatedCost: 120.00,
    supplier: "Sweet Ingredients Ltd."
  },
  {
    id: "REQ-006",
    item: "Parchment Paper",
    category: "Packaging",
    currentStock: 5,
    requestedAmount: 20,
    unit: "rolls",
    priority: "Medium",
    reason: "Need for daily baking operations and packaging",
    requestedBy: "Emma Davis",
    requestDate: "2024-01-14",
    status: "Pending",
    estimatedCost: 45.00,
    supplier: "Packaging Plus"
  }
];

export default function RequestApprovals() {
  const [requests, setRequests] = useState<StockRequest[]>(mockPendingRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const { toast } = useToast();

  const filteredRequests = requests.filter(request => 
    request.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'destructive';
      case 'High': return 'outline';  
      case 'Medium': return 'secondary';
      case 'Low': return 'default';
      default: return 'default';
    }
  };

  const handleApprove = (requestId: string) => {
    setRequests(requests.filter(r => r.id !== requestId));
    toast({
      title: "Request Approved",
      description: `Stock request ${requestId} has been approved and converted to purchase order`
    });
    setIsDialogOpen(false);
    setApprovalNotes("");
  };

  const handleReject = (requestId: string) => {
    setRequests(requests.filter(r => r.id !== requestId));
    toast({
      title: "Request Rejected",
      description: `Stock request ${requestId} has been rejected`,
      variant: "destructive"
    });
    setIsDialogOpen(false);
    setApprovalNotes("");
  };

  const openRequestDialog = (request: StockRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Request Approvals</h1>
              <p className="text-muted-foreground">
                Review and approve or reject stock requests from staff
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search requests by ID, item, or requester..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{requests.length}</p>
                    <p className="text-sm text-muted-foreground">Pending Approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{requests.filter(r => r.priority === 'Critical').length}</p>
                    <p className="text-sm text-muted-foreground">Critical Priority</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{requests.filter(r => r.priority === 'High').length}</p>
                    <p className="text-sm text-muted-foreground">High Priority</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 text-green-500">$</div>
                  <div>
                    <p className="text-2xl font-bold">
                      ${requests.reduce((sum, r) => sum + (r.estimatedCost || 0), 0).toFixed(0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Est. Cost</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Requests */}
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{request.item}</CardTitle>
                        <Badge variant={getPriorityColor(request.priority)}>
                          {request.priority} Priority
                        </Badge>
                      </div>
                      <CardDescription>
                        Request ID: {request.id} • Requested by: {request.requestedBy} • {request.requestDate}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Est. Cost</p>
                      <p className="text-lg font-semibold">${request.estimatedCost?.toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current Stock</p>
                      <p className="text-lg font-semibold text-orange-600">
                        {request.currentStock} {request.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Requested Amount</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {request.requestedAmount} {request.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                      <p className="font-medium">{request.supplier}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Reason for Request</p>
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRequestDialog(request)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(request.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Review Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Review Stock Request</DialogTitle>
                <DialogDescription>
                  Request ID: {selectedRequest?.id}
                </DialogDescription>
              </DialogHeader>
              
              {selectedRequest && (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Item</p>
                          <p className="text-lg">{selectedRequest.item}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Category</p>
                          <p>{selectedRequest.category}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Current Stock</p>
                          <p className="text-orange-600 font-semibold">
                            {selectedRequest.currentStock} {selectedRequest.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Requested</p>
                          <p className="text-blue-600 font-semibold">
                            {selectedRequest.requestedAmount} {selectedRequest.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Priority</p>
                          <Badge variant={getPriorityColor(selectedRequest.priority)}>
                            {selectedRequest.priority}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Estimated Cost</p>
                          <p className="text-lg font-semibold">${selectedRequest.estimatedCost?.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div>
                    <p className="text-sm font-medium mb-2">Reason for Request</p>
                    <Card>
                      <CardContent className="p-3">
                        <p className="text-sm">{selectedRequest.reason}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Approval Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      placeholder="Add any notes about this approval/rejection..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
              
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => selectedRequest && handleReject(selectedRequest.id)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => selectedRequest && handleApprove(selectedRequest.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {filteredRequests.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm 
                    ? "No requests match your search criteria"
                    : "No pending requests require approval at this time"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}