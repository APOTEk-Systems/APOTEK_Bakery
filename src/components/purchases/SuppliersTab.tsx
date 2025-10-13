import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash, Save, Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suppliersService, type Supplier } from "@/services/suppliers";
import axios from "axios";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "../ui/badge";

export default function SuppliersTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
    null
  );
  const [editingSupplierId, setEditingSupplierId] = useState<number | null>(
    null
  );
  const [newSupplier, setNewSupplier] = useState<{
    id?: number;
    name: string;
    contactInfo: string;
    email: string;
    address: string;
  }>({ name: "", contactInfo: "", email: "", address: "" });
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    contactInfo?: string;
    address?: string;
  }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const suppliersQuery = useQuery<Supplier[]>({
    queryKey: ["suppliers"],
    queryFn: () => suppliersService.getAll(),
  });

  const supplierPOsQuery = useQuery({
    queryKey: ["supplierPOs", supplierToDelete?.id],
    queryFn: () =>
      supplierToDelete
        ? suppliersService.getPOsBySupplier(supplierToDelete.id)
        : Promise.resolve([]),
    enabled: !!supplierToDelete,
  });

  const allSuppliers = suppliersQuery.data || [];
  const suppliers = allSuppliers;
  const isLoading = suppliersQuery.isLoading;
  const hasError = suppliersQuery.error;

  let errorMessage = "Failed to load suppliers";
  if (
    hasError &&
    axios.isAxiosError(hasError) &&
    hasError.response?.status !== 500
  ) {
    errorMessage = hasError.response?.data?.message || hasError.message;
  }

  const filteredSuppliers = suppliers.filter(
    (sup) =>
      sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sup.contactInfo || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (sup.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sup.address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageSize = 10;
  const totalPages = Math.ceil(filteredSuppliers.length / pageSize);
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) {
      return "Phone number is required";
    }

    // Remove any spaces or hyphens
    const cleanPhone = phone.replace(/[\s-]/g, "");

    // Check for 07 or 06 prefix (10 digits total)
    if (/^(07|06)\d{8}$/.test(cleanPhone)) {
      return undefined;
    }

    // Allow numbers starting with 7 or 6 (leading zero ignored)
    if (/^(7|6)\d*$/.test(cleanPhone)) {
      return undefined;
    }

    return "Phone number must start with 07, 06, 7, or 6";
  };

  const validateAddress = (address: string): string | undefined => {
    if (!address.trim()) {
      return "Address is required";
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: { email?: string; contactInfo?: string; address?: string } =
      {};

    const emailError = validateEmail(newSupplier.email);
    if (emailError) errors.email = emailError;

    const phoneError = validatePhone(newSupplier.contactInfo);
    if (phoneError) errors.contactInfo = phoneError;

    const addressError = validateAddress(newSupplier.address);
    if (addressError) errors.address = addressError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateSupplierMutation = useMutation({
    mutationFn: (data: {
      name: string;
      contactInfo: string;
      email?: string;
      address?: string;
    }) =>
      editingSupplierId
        ? suppliersService.update(editingSupplierId, data)
        : suppliersService.create(data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: editingSupplierId ? "Supplier Updated" : "Supplier Added",
      });
      setIsSupplierDialogOpen(false);
      setNewSupplier({ name: "", contactInfo: "", email: "", address: "" });
      setValidationErrors({});
      setEditingSupplierId(null);
    },
    onError: (err) => {
      let errorMessage = "Failed to save supplier";
      if (axios.isAxiosError(err) && err.response?.status !== 500) {
        const serverMessage = err.response?.data?.message || err.message;
        if (serverMessage.toLowerCase().includes("already exists")) {
          errorMessage = "Supplier already exists";
        } else {
          errorMessage = serverMessage;
        }
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) =>
      suppliersService.update(id, { status: "inactive" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Supplier Deactivated",
        description: `Supplier deactivated.`,
        variant: "default",
      });
      setIsDeleteConfirmOpen(false);
      setDeleteItemId(null);
      setSupplierToDelete(null);
    },
    onError: (err) => {
      let errorMessage = "Failed to deactivate";
      if (axios.isAxiosError(err) && err.response?.status !== 500) {
        errorMessage = err.response?.data?.message || err.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => suppliersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Supplier Deleted",
        description: `Supplier deleted.`,
        variant: "default",
      });
      setIsDeleteConfirmOpen(false);
      setDeleteItemId(null);
      setSupplierToDelete(null);
    },
    onError: (err) => {
      let errorMessage = "Failed to delete";
      if (axios.isAxiosError(err) && err.response?.status !== 500) {
        errorMessage = err.response?.data?.message || err.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name.trim()) return;

    // Validate form
    if (!validateForm()) return;

    const data = {
      name: newSupplier.name,
      contactInfo: newSupplier.contactInfo.trim()
        ? "+255" + newSupplier.contactInfo.replace(/^0/, "")
        : "",
      email: newSupplier.email,
      address: newSupplier.address,
    };
    updateSupplierMutation.mutate(data);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplierId(supplier.id);
    setNewSupplier({
      id: supplier.id,
      name: supplier.name,
      contactInfo: supplier.contactInfo
        ? supplier.contactInfo.startsWith("+255")
          ? supplier.contactInfo.substring(4)
          : supplier.contactInfo
        : "",
      email: supplier.email || "",
      address: supplier.address || "",
    });
    setIsSupplierDialogOpen(true);
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteItemId(supplier.id);
    setIsDeleteConfirmOpen(true);
  };

  const hasPurchases = supplierPOsQuery.data
    ? supplierPOsQuery.data.length > 0
    : false;
  const isCheckingPurchases = supplierPOsQuery.isLoading;

  const confirmDelete = () => {
    if (deleteItemId) {
      if (hasPurchases) {
        deactivateMutation.mutate(deleteItemId);
      } else {
        deleteMutation.mutate(deleteItemId);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Input
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button
          onClick={() => {
            setEditingSupplierId(null);
            setNewSupplier({
              name: "",
              contactInfo: "",
              email: "",
              address: "",
            });
            setValidationErrors({});
            setIsSupplierDialogOpen(true);
          }}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading state
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading suppliers...
                    </div>
                  </TableCell>
                </TableRow>
              ) : hasError ? (
                // Error state
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-destructive mb-2">{errorMessage}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <User className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No suppliers found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm
                          ? "Try adjusting your search terms"
                          : "Get started by adding your first supplier"}
                      </p>
                      {!searchTerm && (
                        <Button
                          onClick={() => {
                            setEditingSupplierId(null);
                            setNewSupplier({
                              name: "",
                              contactInfo: "",
                              email: "",
                              address: "",
                            });
                            setValidationErrors({});
                            setIsSupplierDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Supplier
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data rows
                paginatedSuppliers.map((sup) => (
                  <TableRow key={sup.id}>
                    <TableCell>{sup.name}</TableCell>
                    <TableCell>{sup.contactInfo || "-"}</TableCell>
                    <TableCell>{sup.email || "-"}</TableCell>
                    <TableCell>{sup.address || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sup.status === "active" ? "default" : "secondary"
                        }
                      >
                        {sup.status || "active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSupplier(sup)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSupplier(sup)}
                        className="ml-2"
                        disabled={sup.status === "inactive"}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
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
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
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
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Supplier Dialog */}
      <Dialog
        open={isSupplierDialogOpen}
        onOpenChange={setIsSupplierDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSupplierId ? "Edit Supplier" : "Add Supplier"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSupplier} className="space-y-4">
            <div>
              <Label htmlFor="supplierName">Name *</Label>
              <Input
                id="supplierName"
                value={newSupplier.name}
                onChange={(e) =>
                  setNewSupplier((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="contactInfo">Phone *</Label>
              <div className="flex items-center">
                <span className="border border-input bg-muted px-3 py-2 rounded-l-md text-muted-foreground border-r-0">
                  +255
                </span>
                <Input
                  id="contactInfo"
                  value={newSupplier.contactInfo}
                  onChange={(e) => {
                    setNewSupplier((prev) => ({
                      ...prev,
                      contactInfo: e.target.value,
                    }));
                    // Clear validation error when user starts typing
                    if (validationErrors.contactInfo) {
                      setValidationErrors((prev) => ({
                        ...prev,
                        contactInfo: undefined,
                      }));
                    }
                  }}
                  placeholder="enter phone number"
                  className={`rounded-l-none ${
                    validationErrors.contactInfo ? "border-destructive" : ""
                  }`}
                />
              </div>
              {validationErrors.contactInfo && (
                <p className="text-sm text-destructive mt-1">
                  {validationErrors.contactInfo}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newSupplier.email}
                onChange={(e) => {
                  setNewSupplier((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }));
                  // Clear validation error when user starts typing
                  if (validationErrors.email) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      email: undefined,
                    }));
                  }
                }}
                placeholder="supplier@example.com"
                className={validationErrors.email ? "border-destructive" : ""}
              />
              {validationErrors.email && (
                <p className="text-sm text-destructive mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={newSupplier.address}
                onChange={(e) => {
                  setNewSupplier((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }));
                  // Clear validation error when user starts typing
                  if (validationErrors.address) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      address: undefined,
                    }));
                  }
                }}
                placeholder="Supplier address..."
                className={validationErrors.address ? "border-destructive" : ""}
              />
              {validationErrors.address && (
                <p className="text-sm text-destructive mt-1">
                  {validationErrors.address}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  setIsSupplierDialogOpen(false);
                  setNewSupplier({
                    name: "",
                    contactInfo: "",
                    email: "",
                    address: "",
                  });
                  setValidationErrors({});
                  setEditingSupplierId(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  updateSupplierMutation.isPending ||
                  !newSupplier.name.trim() ||
                  !newSupplier.contactInfo.trim() ||
                  !newSupplier.address.trim()
                }
              >
                {updateSupplierMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Supplier
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title={`Confirm ${hasPurchases ? "Deactivation" : "Deletion"}`}
        message={
          isCheckingPurchases
            ? "Checking for linked purchases..."
            : hasPurchases
            ? "This supplier has linked purchases. They will be deactivated but their data will be preserved."
            : "This supplier has no linked purchases. They will be permanently deleted."
        }
        onConfirm={confirmDelete}
        confirmVariant="destructive"
      />
    </div>
  );
}
