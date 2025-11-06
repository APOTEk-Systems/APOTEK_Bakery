import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { settingsService, AdjustmentReason } from "@/services/settings";
import { format } from "date-fns";

const AdjustmentReasonsTab = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReason, setEditingReason] = useState<AdjustmentReason | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reasonToDelete, setReasonToDelete] = useState<AdjustmentReason | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reasonsQuery = useQuery({
    queryKey: ["adjustmentReasons"],
    queryFn: settingsService.getAdjustmentReasons,
  });

  const createMutation = useMutation({
    mutationFn: settingsService.createAdjustmentReason,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Adjustment reason created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["adjustmentReasons"] });
      resetForm();
      setDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create adjustment reason",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; description?: string } }) =>
      settingsService.updateAdjustmentReason(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Adjustment reason updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["adjustmentReasons"] });
      resetForm();
      setDialogOpen(false);
      setEditingReason(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update adjustment reason",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: settingsService.deleteAdjustmentReason,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Adjustment reason deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["adjustmentReasons"] });
      setDeleteDialogOpen(false);
      setReasonToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete adjustment reason",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      description: description.trim(),
    };

    if (editingReason) {
      updateMutation.mutate({ id: editingReason.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (reason: AdjustmentReason) => {
    setEditingReason(reason);
    setName(reason.name);
    setDescription(reason.description);
    setDialogOpen(true);
  };

  const handleDelete = (reason: AdjustmentReason) => {
    setReasonToDelete(reason);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (reasonToDelete) {
      deleteMutation.mutate(reasonToDelete.id);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingReason(null);
    resetForm();
  };

  if (reasonsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
       
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reason
        </Button>
      </div>

      <Card className="shadow-warm">
        <CardHeader>
          {/* <CardTitle>Adjustment Reasons</CardTitle> */}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reason</TableHead>
                {/* <TableHead>Description</TableHead>
                <TableHead>Created</TableHead> */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reasonsQuery.data?.map((reason) => (
                <TableRow key={reason.id}>
                  <TableCell className="font-medium">{reason.name}</TableCell>
                
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(reason)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(reason)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {reasonsQuery.data?.length === 0 && (
            <div className="text-center py-12">
              <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No adjustment reasons found
              </h3>
              {/* <p className="text-muted-foreground mb-4">
                Get started by adding your first adjustment reason
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                Add Reason
              </Button> */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingReason ? "Edit Adjustment Reason" : "Add Adjustment Reason"}
            </DialogTitle>
            {/* <DialogDescription>
              {editingReason
                ? "Update the adjustment reason details"
                : "Create a new adjustment reason for inventory adjustments"}
            </DialogDescription> */}
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Damaged Goods"
                required
              />
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the reason for adjustment"
                rows={3}
              />
            </div> */}
            <DialogFooter>
              {/* <Button
                type="button"
                variant="outline"
                onClick={handleDialogClose}
              >
                Cancel
              </Button> */}
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending || !name.trim()}
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {editingReason ? "Update" : "Add"} Reason
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Adjustment Reason</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{reasonToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdjustmentReasonsTab;