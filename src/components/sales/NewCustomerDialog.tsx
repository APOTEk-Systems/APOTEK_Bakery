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
import { useState } from "react";
import { toSentenceCase } from "@/lib/funcs";

interface NewCustomerDialogProps {
  isNewCustomerOpen: boolean;
  setIsNewCustomerOpen: (open: boolean) => void;
  newCustomerForm: { name: string; email: string; phone: string; creditLimit: string };
  setNewCustomerForm: (form: { name: string; email: string; phone: string; creditLimit: string }) => void;
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
  const [validationErrors, setValidationErrors] = useState<{
    phone?: string;
  }>({});

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) return undefined; // Optional field

    // Remove any spaces or hyphens
    const cleanPhone = phone.replace(/[\s\-]/g, '');

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
                setNewCustomerForm({...newCustomerForm, name: toSentenceCase(e.target.value)})
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newCustomerEmail">Email</Label>
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
            <Label htmlFor="newCustomerPhone">Phone Number *</Label>
            <div className="flex items-center">
              <span className="border border-input bg-muted px-3 py-2 rounded-l-md text-muted-foreground border-r-0">+255</span>
              <Input
                id="newCustomerPhone"
                type="tel"
                value={newCustomerForm.phone}
                onChange={(e) => {
                  setNewCustomerForm({
                    ...newCustomerForm,
                    phone: e.target.value,
                  });
                  // Clear validation error when user starts typing
                  if (validationErrors.phone) {
                    setValidationErrors(prev => ({ ...prev, phone: undefined }));
                  }
                }}
                onBlur={(e) => {
                  const error = validatePhone(e.target.value);
                  setValidationErrors(prev => ({ ...prev, phone: error }));
                }}
                placeholder="enter phone number"
                className={`rounded-l-none ${validationErrors.phone ? "border-destructive" : ""}`}
              />
            </div>
            {validationErrors.phone && (
              <p className="text-sm text-destructive mt-1">{validationErrors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newCustomerCreditLimit">Credit Limit *</Label>
            <Input
              id="newCustomerCreditLimit"
              type="text"
              inputMode="numeric"
              placeholder="1,000.00"
              value={newCustomerForm.creditLimit}
              onChange={(e) => {
                // Strip commas before saving
                const raw = e.target.value.replace(/,/g, "");
                setNewCustomerForm({
                  ...newCustomerForm,
                  creditLimit: raw === "" ? "" : Number(raw).toLocaleString("en-US"),
                });
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsNewCustomerOpen(false);
              setNewCustomerForm({name: "", email: "", phone: "", creditLimit: ""});
            }}
            disabled={createCustomerMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddNewCustomer}
            disabled={createCustomerMutation.isPending || !newCustomerForm.name.trim() || !newCustomerForm.phone.trim() || !newCustomerForm.creditLimit.trim()}
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