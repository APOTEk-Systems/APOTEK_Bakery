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
import { Plus, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
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
  status: 'Pending' | 'Approved' | 'Rejected' | 'In Progress';
  approvedBy?: string;
  approvalDate?: string;
  estimatedCost?: number;
}

const mockRequests: StockRequest[] = [
  {
    id: "REQ-001",
    item: "All-Purpose Flour",
    category: "Baking Ingredients",
    currentStock: 5,
    requestedAmount: 50,
    unit: "kg",
    priority: "Critical",
    reason: "Running low on main ingredient, needed for daily bread production",
    requestedBy: "Sarah Johnson",
    requestDate: "2024-01-15",
    status: "Pending",
    estimatedCost: 85.00
  },
  {
    id: "REQ-002", 
    item: "Granulated Sugar",
    category: "Baking Ingredients",
    currentStock: 8,
    requestedAmount: 25,
    unit: "kg",
    priority: "High",
    reason: "Stock getting low, needed for pastries and cakes",
    requestedBy: "Mike Chen",
    requestDate: "2024-01-14",
    status: "Approved",
    approvedBy: "Admin",
    approvalDate: "2024-01-15",
    estimatedCost: 45.00
  },
  {
    id: "REQ-003",
    item: "Vanilla Extract",
    category: "Flavoring",
    currentStock: 2,
    requestedAmount: 6,
    unit: "bottles",
    priority: "Medium",
    reason: "Backup stock needed for cake orders",
    requestedBy: "Emma Davis",
    requestDate: "2024-01-13",
    status: "In Progress",
    approvedBy: "Admin",
    approvalDate: "2024-01-14",
    estimatedCost: 36.00
  }
];

export default function StockRequests() {
  const [requests, setRequests] = useState<StockRequest[]>(mockRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newRequest, setNewRequest] = useState({
    item: "",
    category: "",
    currentStock: "",
    requestedAmount: "",
    unit: "",
    priority: "Medium" as const,
    reason: ""
  });

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || request.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'outline';
      case 'Approved': return 'default';
      case 'Rejected': return 'destructive';
      case 'In Progress': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'destructive';
      case 'High': return 'outline';  
      case 'Medium': return 'secondary';
      case 'Low': return 'default';
      default: return 'default';
    }
  };

  const handleSubmitRequest = () => {
    if (!newRequest.item || !newRequest.requestedAmount || !newRequest.reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const request: StockRequest = {
      id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
      item: newRequest.item,
      category: newRequest.category,
      currentStock: parseInt(newRequest.currentStock) || 0,
      requestedAmount: parseInt(newRequest.requestedAmount),
      unit: newRequest.unit,
      priority: newRequest.priority,
      reason: newRequest.reason,
      requestedBy: "Current User",
      requestDate: new Date().toISOString().split('T')[0],
      status: "Pending"
    };

    setRequests([request, ...requests]);
    setIsDialogOpen(false);
    setNewRequest({
      item: "",
      category: "",
      currentStock: "",
      requestedAmount: "",
      unit: "",
      priority: "Medium",
      reason: ""
    });

    toast({
      title: "Request Submitted",
      description: `Stock request ${request.id} has been submitted for approval`
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Stock Requests</h1>
              <p className="text-muted-foreground">
                Manage inventory requests and approval workflow
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Submit Stock Request</DialogTitle>
                  <DialogDescription>
                    Request additional inventory items when stock levels are low
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="item">Item Name*</Label>
                      <Input
                        id="item"
                        value={newRequest.item}
                        onChange={(e) => setNewRequest({...newRequest, item: e.target.value})}
                        placeholder="e.g., All-Purpose Flour"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select onValueChange={(value) => setNewRequest({...newRequest, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baking-ingredients">Baking Ingredients</SelectItem>
                          <SelectItem value="flavoring">Flavoring</SelectItem>
                          <SelectItem value="packaging">Packaging</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="cleaning">Cleaning Supplies</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentStock">Current Stock</Label>
                      <Input
                        id="currentStock"
                        type="number"
                        value={newRequest.currentStock}
                        onChange={(e) => setNewRequest({...newRequest, currentStock: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requestedAmount">Requested Amount*</Label>
                      <Input
                        id="requestedAmount"
                        type="number"
                        value={newRequest.requestedAmount}
                        onChange={(e) => setNewRequest({...newRequest, requestedAmount: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Select onValueChange={(value) => setNewRequest({...newRequest, unit: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lbs">lbs</SelectItem>
                          <SelectItem value="pieces">pieces</SelectItem>
                          <SelectItem value="bottles">bottles</SelectItem>
                          <SelectItem value="boxes">boxes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select onValueChange={(value: any) => setNewRequest({...newRequest, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Request*</Label>
                    <Textarea
                      id="reason"
                      value={newRequest.reason}
                      onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                      placeholder="Explain why this stock is needed..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitRequest}>
                    Submit Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search requests by item or requester..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{requests.filter(r => r.status === 'Pending').length}</p>
                    <p className="text-sm text-muted-foreground">Pending Approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{requests.filter(r => r.status === 'Approved').length}</p>
                    <p className="text-sm text-muted-foreground">Approved</p>
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
                  <XCircle className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-2xl font-bold">{requests.filter(r => r.status === 'Rejected').length}</p>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{request.item}</CardTitle>
                        <Badge variant={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge variant={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Request ID: {request.id} • Category: {request.category}
                      </CardDescription>
                    </div>
                    {request.estimatedCost && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Est. Cost</p>
                        <p className="text-lg font-semibold">${request.estimatedCost.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Current Stock</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {request.currentStock} {request.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Requested Amount</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {request.requestedAmount} {request.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Requested By</p>
                      <p className="font-medium">{request.requestedBy}</p>
                      <p className="text-sm text-muted-foreground">{request.requestDate}</p>
                    </div>
                    {request.approvedBy && (
                      <div>
                        <p className="text-sm font-medium">Approved By</p>
                        <p className="font-medium">{request.approvedBy}</p>
                        <p className="text-sm text-muted-foreground">{request.approvalDate}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Reason for Request</p>
                    <p className="text-sm text-muted-foreground">{request.reason}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRequests.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No stock requests found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || filterStatus !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "Start by submitting your first stock request"
                  }
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Submit Request
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}