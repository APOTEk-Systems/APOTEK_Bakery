import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";

interface NewCustomerDialogProps {
  isNewCustomerOpen: boolean;
  setIsNewCustomerOpen: (open: boolean) => void;
  newCustomerForm: { name: string; email: string; phone: string };
  setNewCustomerForm: (form: { name: string; email: string; phone: string }) => void;
  handleAddNewCustomer: () => void;
  createCustomerMutation: any;
}

const NewCustomerDialog = ({
  isNewCustomerOpen,
  setIsNewCustomerOpen,
  newCustomerForm,
  setNewCustomerForm,
  handleAddNewCustomer,
  createCustomerMutation,
}: NewCustomerDialogProps) => {
  return (
    <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Enter customer details for quick addition.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newCustomerName">Name *</Label>
            <Input
              id="newCustomerName"
              placeholder="Customer name"
              value={newCustomerForm.name}
              onChange={(e) =>
                setNewCustomerForm({...newCustomerForm, name: e.target.value})
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newCustomerEmail">Email (optional)</Label>
            <Input
              id="newCustomerEmail"
              type="email"
              placeholder="customer@example.com"
              value={newCustomerForm.email}
              onChange={(e) =>
                setNewCustomerForm({
                  ...newCustomerForm,
                  email: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newCustomerPhone">Phone (optional)</Label>
            <Input
              id="newCustomerPhone"
              placeholder="Phone number"
              value={newCustomerForm.phone}
              onChange={(e) =>
                setNewCustomerForm({
                  ...newCustomerForm,
                  phone: e.target.value,
                })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsNewCustomerOpen(false);
              setNewCustomerForm({name: "", email: "", phone: ""});
            }}
            disabled={createCustomerMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddNewCustomer}
            disabled={createCustomerMutation.isPending || !newCustomerForm.name.trim()}
          >
            {createCustomerMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            Add Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewCustomerDialog;