import {useState} from "react";
import {Link} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import Layout from "../components/Layout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {
  Search,
  Plus,
  Eye,
  Edit,
  User,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {customersService, type Customer} from "../services/customers";
import {format} from "date-fns";
import {formatCurrency} from "@/lib/funcs";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const customersQuery = useQuery({
    queryKey: ["customers"],
    queryFn: () => customersService.getAll(),
  });

  const customers = [
    {
      id: "cash",
      name: "Cash",
      email: null,
      phone: null,
      address: null,
      isCredit: false,
      creditLimit: 0,
      currentCredit: 0,
      status: "active" as const,
      loyaltyPoints: 0,
      notes: "Default cash customer for walk-in sales",
      totalOrders: 0,
      totalSpent: 0,
    },
    ...(customersQuery.data || []),
  ];
  const loading = customersQuery.isLoading;
  const error = customersQuery.error;

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd-MM-yyyy");
  };

  // Compute stats from fetched data (only when not loading)
  const totalCustomers = loading ? 0 : customers.length;
  const activeCustomers = loading
    ? 0
    : customers.filter((c) => c.status === "active").length;
  const totalOrdersSum = loading
    ? 0
    : customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
  const avgOrders = totalCustomers > 0 ? totalOrdersSum / totalCustomers : 0;
  const totalSpentSum = loading
    ? 0
    : customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const avgSpent = totalCustomers > 0 ? totalSpentSum / totalCustomers : 0;

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-destructive">
                {error instanceof Error
                  ? error.message
                  : "Failed to fetch customers"}
              </p>
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
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-center">Credit Limit</TableHead>
                {/* <TableHead className="text-center">Total Spent</TableHead> */}
                {/* <TableHead>Last Order</TableHead> */}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                // Loading state
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading customers...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <User className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {searchTerm ? "No customers found" : "No customers yet"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm
                          ? "Try adjusting your search terms"
                          : "Get started by adding your first customer"}
                      </p>
                      {!searchTerm && (
                        <Button asChild>
                          <Link to="/customers/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Customer
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data rows
                filteredCustomers.map((customer, index) => (
                  <TableRow
                    key={customer.id}
                    className={`hover:bg-muted/20 transition-colors ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    {/* Customer Info */}
                    <TableCell className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{customer.name}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {customer.email || "—"}
                      </div>
                    </TableCell>

                    {/* Phone */}
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {customer.phone || "—"}
                      </div>
                    </TableCell>

                    {/* Credit Status */}
                    <TableCell className="text-center font-bold">
                      {formatCurrency(customer.creditLimit)}
                    </TableCell>

                    {/* Total Spent */}
                    {/* <TableCell className="text-center font-bold">
                ${customer.totalSpent?.toFixed(0) ?? 0}
              </TableCell> */}
                    <TableCell>
                      <Badge variant={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    {/* Actions */}
                    <TableCell className="text-right">
                      {customer.id === "cash" ? (
                        <span className="text-muted-foreground text-sm">
                          Default
                        </span>
                      ) : (
                        <div className="flex gap-1 justify-end">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/customers/${customer.id}`}>
                              <Eye className="h-4 w-4" />
                              Edit
                            </Link>
                          </Button>
                          <Button variant="destructive" size="sm" asChild>
                            <Link to={`/customers/${customer.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              Delete
                            </Link>
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
};

export default Customers;
