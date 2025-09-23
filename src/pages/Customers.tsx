import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Eye,
  Edit,
  User,
  Phone,
  Mail,
  ShoppingBag,
  DollarSign,
  Loader2,
  
 } from "lucide-react";
import {Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { PastryProSpinner } from "@/components/ui/PastryProSpinner";
import { customersService, type Customer } from "../services/customers";
import { format } from 'date-fns';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersService.getAll(),
  });

  const customers = customersQuery.data || [];
  const loading = customersQuery.isLoading;
  const error = customersQuery.error;

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone?.includes(searchTerm))
  );

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd-MM-yyyy');
  };

  // Compute stats from fetched data
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalOrdersSum = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
  const avgOrders = totalCustomers > 0 ? totalOrdersSum / totalCustomers : 0;
  const totalSpentSum = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const avgSpent = totalCustomers > 0 ? totalSpentSum / totalCustomers : 0;
  

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-destructive">{error instanceof Error ? error.message : 'Failed to fetch customers'}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Customers</h1>
              <p className="text-muted-foreground">Manage your customer relationships</p>
            </div>
            <Button asChild className="shadow-warm">
              <Link to="/customers/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Link>
            </Button>
          </div>

          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Customers List */}
        <Card>
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead className="text-center">Credit Status</TableHead>
          <TableHead className="text-center">Total Spent</TableHead>
          {/* <TableHead>Last Order</TableHead> */}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {filteredCustomers.map((customer, index) => (
          <TableRow key={customer.id} className={`hover:bg-muted/20 transition-colors ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
            {/* Customer Info */}
            <TableCell className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{customer.name}</span>
                  
                </div>
              
              </div>
            </TableCell>

            <TableCell>
              <Badge variant={getStatusColor(customer.status)}>{customer.status}</Badge>
               </TableCell>

            {/* Contact */}
            <TableCell>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {customer.email}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {customer.phone}
                </div>
              </div>
            </TableCell>

            {/* Orders */}
            <TableCell className="text-center font-bold">{customer.isCredit ? "True" : "False"}</TableCell>

            {/* Total Spent */}
            <TableCell className="text-center font-bold">
              ${customer.totalSpent?.toFixed(0) ?? 0}
            </TableCell>

            {/* Last Order */}
            {/* <TableCell className="text-sm text-muted-foreground">
              {formatDate(customer.lastOrder)}
            </TableCell> */}
         
            {/* Actions */}
            <TableCell className="text-right">
              <div className="flex gap-1 justify-end">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/customers/${customer.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/customers/${customer.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
        </Card>
      </div>
    </Layout>
    );
  };
  
  export default Customers;


