 import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash, Save, Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suppliersService, type Supplier } from "@/services/suppliers";

export default function SuppliersTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
  const [newSupplier, setNewSupplier] = useState<{ id?: number; name: string; contactInfo: string; email: string; address: string }>({ name: "", contactInfo: "", email: "", address: "" });
  const [validationErrors, setValidationErrors] = useState<{ email?: string; contactInfo?: string; address?: string }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const suppliersQuery = useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: () => suppliersService.getAll(),
  });

  const suppliers = suppliersQuery.data || [];
  const isLoading = suppliersQuery.isLoading;
  const hasError = suppliersQuery.error;

  const filteredSuppliers = suppliers.filter(sup =>
    sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sup.contactInfo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sup.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sup.address || '').toLowerCase().includes(searchTerm.toLowerCase())
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
    const cleanPhone = phone.replace(/[\s\-]/g, '');

    // Check for +255 prefix (12 digits total including +)
    if (cleanPhone.startsWith('+255')) {
      if (cleanPhone.length !== 13) { // +255 + 10 digits = 13
        return "Phone number with +255 must be 13 characters (including +)";
      }
      return undefined;
    }

    // Check for 07 or 06 prefix (10 digits total)
    if (cleanPhone.startsWith('07') || cleanPhone.startsWith('06')) {
      if (cleanPhone.length !== 10) {
        return "Phone number with 07/06 must be 10 digits";
      }
      return undefined;
    }

    return "Phone number must start with 07, 06, or +255";
  };

  const validateAddress = (address: string): string | undefined => {
    if (!address.trim()) {
      return "Address is required";
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: { email?: string; contactInfo?: string; address?: string } = {};

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
    mutationFn: (data: { name: string; contactInfo: string }) => 
      editingSupplierId 
        ? suppliersService.update(editingSupplierId, data) 
        : suppliersService.create(data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: editingSupplierId ? "Supplier Updated" : "Supplier Added" });
      setIsSupplierDialogOpen(false);
      setNewSupplier({ name: "", contactInfo: "", email: "", address: "" });
      setEditingSupplierId(null);
    },
    onError: (err) => {
      toast({ title: "Error", description: "Failed to save supplier", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => suppliersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: "Supplier Deleted", description: `Supplier deleted.`, variant: "default" });
      setIsDeleteConfirmOpen(false);
      setDeleteItemId(null);
    },
    onError: (err) => {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    },
  });

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name.trim()) return;

    // Validate form
    if (!validateForm()) return;

    const data = { name: newSupplier.name, contactInfo: newSupplier.contactInfo, email: newSupplier.email, address: newSupplier.address };
    updateSupplierMutation.mutate(data);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplierId(supplier.id);
    setNewSupplier({
      id: supplier.id,
      name: supplier.name,
      contactInfo: supplier.contactInfo || '',
      email: supplier.email || '',
      address: supplier.address || ''
    });
    setIsSupplierDialogOpen(true);
  };

  const handleDeleteSupplier = (id: number) => {
    setDeleteItemId(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteItemId) {
      deleteMutation.mutate(deleteItemId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Input
          placeholder="Search by name, phone, email, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => {
          setEditingSupplierId(null);
          setNewSupplier({ name: "", contactInfo: "", email: "", address: "" });
          setValidationErrors({});
          setIsSupplierDialogOpen(true);
        }} disabled={isLoading}>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading state
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading suppliers...
                    </div>
                  </TableCell>
                </TableRow>
              ) : hasError ? (
                // Error state
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-destructive mb-2">Failed to load suppliers</p>
                      <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <User className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No suppliers found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm
                          ? "Try adjusting your search terms"
                          : "Get started by adding your first supplier"
                        }
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => {
                          setEditingSupplierId(null);
                          setNewSupplier({ name: "", contactInfo: "", email: "", address: "" });
                          setValidationErrors({});
                          setIsSupplierDialogOpen(true);
                        }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Supplier
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data rows
                filteredSuppliers.map(sup => (
                  <TableRow key={sup.id}>
                    <TableCell>{sup.name}</TableCell>
                    <TableCell>{sup.contactInfo || '-'}</TableCell>
                    <TableCell>{sup.email || '-'}</TableCell>
                    <TableCell>{sup.address || '-'}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleEditSupplier(sup)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteSupplier(sup.id)} className="ml-2">
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

      {/* Supplier Dialog */}
      <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSupplierId ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSupplier} className="space-y-4">
            <div>
              <Label htmlFor="supplierName">Name *</Label>
              <Input
                id="supplierName"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="contactInfo">Phone *</Label>
              <Input
                id="contactInfo"
                value={newSupplier.contactInfo}
                onChange={(e) => {
                  setNewSupplier(prev => ({ ...prev, contactInfo: e.target.value }));
                  // Clear validation error when user starts typing
                  if (validationErrors.contactInfo) {
                    setValidationErrors(prev => ({ ...prev, contactInfo: undefined }));
                  }
                }}
                placeholder="07XXXXXXXX"
                className={validationErrors.contactInfo ? "border-destructive" : ""}
              />
              {validationErrors.contactInfo && (
                <p className="text-sm text-destructive mt-1">{validationErrors.contactInfo}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newSupplier.email}
                onChange={(e) => {
                  setNewSupplier(prev => ({ ...prev, email: e.target.value }));
                  // Clear validation error when user starts typing
                  if (validationErrors.email) {
                    setValidationErrors(prev => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="supplier@example.com"
                className={validationErrors.email ? "border-destructive" : ""}
              />
              {validationErrors.email && (
                <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={newSupplier.address}
                onChange={(e) => {
                  setNewSupplier(prev => ({ ...prev, address: e.target.value }));
                  // Clear validation error when user starts typing
                  if (validationErrors.address) {
                    setValidationErrors(prev => ({ ...prev, address: undefined }));
                  }
                }}
                placeholder="Supplier address..."
                className={validationErrors.address ? "border-destructive" : ""}
              />
              {validationErrors.address && (
                <p className="text-sm text-destructive mt-1">{validationErrors.address}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => {
                setIsSupplierDialogOpen(false);
                setNewSupplier({ name: "", contactInfo: "", email: "", address: "" });
                setValidationErrors({});
                setEditingSupplierId(null);
              }} variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={updateSupplierMutation.isPending || !newSupplier.name.trim() || !newSupplier.contactInfo.trim() || !newSupplier.address.trim()}>
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
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the supplier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete Supplier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}