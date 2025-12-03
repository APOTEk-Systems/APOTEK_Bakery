import {useState} from "react";
import {Link} from "react-router-dom";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import Layout from "../components/Layout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import {useToast} from "@/hooks/use-toast";
import {Search, Plus, Edit, User, Loader2, Trash} from "lucide-react";
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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const {toast} = useToast();
  const queryClient = useQueryClient();

  console.log("Customer", customerToDelete);
  const customersQuery = useQuery({
    queryKey: ["customers"],
    queryFn: () => customersService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({id, hasSales}: {id: number, hasSales: boolean}) => {
      if (hasSales) {
        return customersService.update(id, { status: "inactive" });
      } else {
        await customersService.delete(id);
        return null;
      }
    },
    onSuccess: (_, {hasSales}) => {
      queryClient.invalidateQueries({queryKey: ["customers"]});
      toast({
        title: hasSales ? "Customer Deactivated" : "Customer Deleted",
        description: hasSales ? "Customer deactivated successfully." : "Customer deleted successfully.",
        variant: "default",
      });
      setIsDeleteConfirmOpen(false);
      setDeleteItemId(null);
      setCustomerToDelete(null);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: "Failed to deactivate customer",
        variant: "destructive",
      });
    },
  });

  const allCustomers = [
    // {
    //   id: "cash",
    //   name: "Cash",
    //   email: null,
    //   phone: null,
    //   address: null,
    //   isCredit: false,
    //   creditLimit: 0,
    //   currentCredit: 0,
    //   status: "active" as const,
    //   loyaltyPoints: 0,
    //   notes: "Default cash customer for walk-in sales",
    //   totalOrders: 0,
    //   totalSpent: 0,
    // },
    ...(customersQuery.data || []),
  ];

  const customers = allCustomers;
  const loading = customersQuery.isLoading;
  const error = customersQuery.error;

  console.log(allCustomers)

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

  const handleDeleteCustomer = (customer: any) => {
    setCustomerToDelete(customer);
    setDeleteItemId(customer.id);
    setIsDeleteConfirmOpen(true);
  };

  const hasSales = customerToDelete ? (customerToDelete.sales?.length || 0) > 0 : false;

  const confirmDelete = () => {
    if (deleteItemId && customerToDelete) {
      deleteMutation.mutate({id: deleteItemId, hasSales});
    }
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
                <TableHead>Phone</TableHead>
                 <TableHead>Total Credit</TableHead>
                <TableHead className="text-center">Credit Limit</TableHead>
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
                    <TableCell className="align-middle">
                      <span className="">{customer.name}</span>
                    </TableCell>
                

                    {/* Phone */}
                    <TableCell className="align-middle">
                      <span className="text-sm text-muted-foreground">
                        {customer.phone || "—"}
                      </span>
                    </TableCell>

                    <TableCell className="align-middle">
                      <span className="text-sm text-muted-foreground text-center align-middle">
                        {customer.currentCredit || "—"}
                      </span>
                    </TableCell>

                    {/* Credit Status */}
                    <TableCell className="text-center align-middle">
                      {formatCurrency(customer.creditLimit || 0)}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="align-middle">
                      <Badge variant={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right align-middle">
                      {customer.id === "cash" ? (
                        <span className="text-muted-foreground text-sm">
                          Default
                        </span>
                      ) : (
                        <div className="flex gap-1 justify-end">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/customers/${customer.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              Edit
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteCustomer(customer)
                            }
                            disabled={deleteMutation.isPending || customer.status === "inactive"}
                          >
                            <Trash className="h-4 w-4" />
                            Delete
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

        {/* Delete Confirmation */}
        <ConfirmationDialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
          title={`Confirm ${hasSales ? 'Deactivation' : 'Deletion'}`}
          message={
            hasSales
              ? "This customer has made sales. They will be deactivated but their data will be preserved."
              : "This customer has no sales history. They will be permanently deleted."
          }
          onConfirm={confirmDelete}
          confirmVariant="destructive"
        />
      </div>
    </Layout>
  );
};

export default Customers;
