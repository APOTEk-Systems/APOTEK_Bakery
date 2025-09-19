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
import { Plus, Edit, Trash, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suppliersService, type Supplier } from "@/services/suppliers";

export default function SuppliersTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
  const [newSupplier, setNewSupplier] = useState<{ id?: number; name: string; contactInfo: string }>({ name: "", contactInfo: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const suppliersQuery = useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: () => suppliersService.getAll(),
  });

  const suppliers = suppliersQuery.data || [];

  const filteredSuppliers = suppliers.filter(sup =>
    sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sup.contactInfo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateSupplierMutation = useMutation({
    mutationFn: (data: { name: string; contactInfo: string }) => 
      editingSupplierId 
        ? suppliersService.update(editingSupplierId, data) 
        : suppliersService.create(data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: editingSupplierId ? "Supplier Updated" : "Supplier Added" });
      setIsSupplierDialogOpen(false);
      setNewSupplier({ name: "", contactInfo: "" });
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
      toast({ title: "Supplier Deleted", description: `Supplier deleted.`, variant: "destructive" });
      setIsDeleteConfirmOpen(false);
      setDeleteItemId(null);
    },
    onError: (err) => {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    },
  });

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name) return;
    const contactInfo = newSupplier.contactInfo || '';
    const data = { name: newSupplier.name, contactInfo };
    updateSupplierMutation.mutate(data);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplierId(supplier.id);
    setNewSupplier({
      id: supplier.id,
      name: supplier.name,
      contactInfo: supplier.contactInfo || ''
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
          placeholder="Search by name or contact info..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => {
          setEditingSupplierId(null);
          setNewSupplier({ name: "", contactInfo: "" });
          setIsSupplierDialogOpen(true);
        }}>
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
                <TableHead>Contact Info</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map(sup => (
                <TableRow key={sup.id}>
                  <TableCell>{sup.name}</TableCell>
                  <TableCell>{sup.contactInfo || '-'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleEditSupplier(sup)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSupplier(sup.id)} className="ml-2 text-destructive">
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSuppliers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No suppliers found.
                  </TableCell>
                </TableRow>
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
              <Label htmlFor="contactInfo">Contact Info</Label>
              <Textarea
                id="contactInfo"
                value={newSupplier.contactInfo}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, contactInfo: e.target.value }))}
                placeholder="Phone, email, address..."
              />
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => {
                setIsSupplierDialogOpen(false);
                setNewSupplier({ name: "", contactInfo: "" });
                setEditingSupplierId(null);
              }} variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={updateSupplierMutation.isPending || !newSupplier.name.trim()}>
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