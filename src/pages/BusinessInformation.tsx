import Layout from "../components/Layout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";
import {useToast} from "@/hooks/use-toast";
import {settingsService, SettingsData} from "@/services/settings";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  Store,
  Edit,
  X,
} from "lucide-react";

const BusinessInformation = () => {
  const {toast} = useToast();
  const queryClient = useQueryClient();

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);

  // Local state for settings forms
  const [informationData, setInformationData] = useState({
    bakeryName: "",
    phone: "",
    address: "",
    email: "",
    website: "",
    description: "",
    tin: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return undefined; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

const validatePhone = (phone: string): string | undefined => {
  if (!phone.trim()) return undefined; // Optional field

  const cleanPhone = phone.replace(/[\s\-]/g, '');

  // Accept: 07XXXXXXXX or 06XXXXXXXX (10 digits total)
  if (/^(07|06)\d{8}$/.test(cleanPhone)) {
    return undefined;
  }

  // Accept: 7XXXXXXXX or 6XXXXXXXX (9 digits total, no leading zero)
  if (/^(7|6)\d{8}$/.test(cleanPhone)) {
    return undefined;
  }

  return "Invalid Phone Number";
};



  // Fetch settings with React Query
  const { data: settings, isLoading: settingsLoading, error: settingsError } = useQuery<SettingsData>({
    queryKey: ["settings"],
    queryFn: () => settingsService.getAll(),
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => settingsService.update(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings updated successfully.",
      });
      queryClient.invalidateQueries({queryKey: ["settings"]});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  // Populate local state when settings data is loaded
  React.useEffect(() => {
    if (settings?.information) {
      setInformationData({
        bakeryName: settings.information.bakeryName || "",
        phone: settings.information.phone
          ? settings.information.phone.startsWith("+255")
            ? settings.information.phone.substring(4)
            : settings.information.phone
          : "",
        address: settings.information.address || "",
        email: settings.information.email || "",
        website: settings.information.website || "",
        description: settings.information.description || "",
        tin: settings.information.tin || "",
      });
    }
  }, [settings]);

  // Show error toasts
  React.useEffect(() => {
    if (settingsError) {
      toast({
        title: "Error",
        description: "Failed to fetch settings.",
        variant: "destructive",
      });
    }
  }, [settingsError, toast]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    // Reset form data to original settings
    if (settings?.information) {
      setInformationData({
        bakeryName: settings.information.bakeryName || "",
        phone: settings.information.phone
          ? settings.information.phone.startsWith("+255")
            ? settings.information.phone.substring(4)
            : settings.information.phone
          : "",
        address: settings.information.address || "",
        email: settings.information.email || "",
        website: settings.information.website || "",
        description: settings.information.description || "",
        tin: settings.information.tin || "",
      });
    }
    setValidationErrors({});
    setIsEditMode(false);
  };

  // Helper function to render form field or display value
  const renderField = (
    label: string,
    value: string,
    field: React.ReactNode,
    className: string = ""
  ) => {
    if (!isEditMode) {
      return (
        <div className={className}>
          <Label>{label}</Label>
          <p className="text-sm text-muted-foreground mt-1">
            {value || "Not set"}
          </p>
        </div>
      );
    }
    return field;
  };

  const handleSave = (section: string) => {
    // Clear previous validation errors
    setValidationErrors({});

    let updateData: any = {};

    switch (section) {
      case "Bakery Information":
        // Validate email if provided
        if (informationData.email.trim()) {
          const emailError = validateEmail(informationData.email);
          if (emailError) {
            setValidationErrors(prev => ({...prev, email: emailError}));
            toast({
              title: "Error",
              description: emailError,
              variant: "destructive",
            });
            return;
          }
        }

        // Validate phone if provided
        if (informationData.phone.trim()) {
          const phoneError = validatePhone(informationData.phone);
          if (phoneError) {
            setValidationErrors(prev => ({...prev, phone: phoneError}));
            toast({
              title: "Error",
              description: phoneError,
              variant: "destructive",
            });
            return;
          }
        }

        updateData = {
          key: "information",
          ...informationData,
          phone: informationData.phone.trim()
            ? "+255" + informationData.phone.replace(/^0/, '')
            : "",
        };
        break;
      default:
        return;
    }

    updateSettingsMutation.mutate(updateData, {
      onSuccess: () => {
        setIsEditMode(false);
      }
    });
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Business Information</h1>
        </div>

        <div className="space-y-6">
          {/* Bakery Information */}
          <Card className="shadow-warm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  {/* <Store className="h-5 w-5" />
                  Bakery Information */}
                </CardTitle>
             
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField(
                  "Bakery Name",
                  informationData.bakeryName,
                  <div>
                    <Label htmlFor="bakeryName">Bakery Name</Label>
                    <Input
                      id="bakeryName"
                      value={informationData.bakeryName}
                      onChange={(e) =>
                        setInformationData((prev) => ({
                          ...prev,
                          bakeryName: e.target.value,
                        }))
                      }
                      disabled={settingsLoading}
                    />
                  </div>
                )}
                {renderField(
                  "Phone Number",
                  informationData.phone ? `+255${informationData.phone}` : "",
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center">
                      <span className="border border-input bg-muted px-3 py-2 rounded-l-md text-muted-foreground border-r-0">
                        +255
                      </span>
                      <Input
                        id="phone"
                        value={informationData.phone || ""}
                        onChange={(e) => {
                          setInformationData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }));
                          // Clear validation error when user starts typing
                          if (validationErrors.phone) {
                            setValidationErrors((prev) => ({
                              ...prev,
                              phone: undefined,
                            }));
                          }
                        }}
                        onBlur={(e) => {
                          const error = validatePhone(e.target.value);
                          setValidationErrors((prev) => ({
                            ...prev,
                            phone: error,
                          }));
                        }}
                        placeholder="enter phone number"
                        className={`rounded-l-none ${validationErrors.phone ? "border-destructive" : ""}`}
                        disabled={settingsLoading}
                      />
                      {validationErrors.phone && (
                        <p className="text-sm text-destructive mt-1">
                          {validationErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {/* {renderField(
                  "Address",
                  informationData.address || "",
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center">
                      <span className="border border-input bg-muted px-3 py-2 rounded-l-md text-muted-foreground border-r-0">
                        +255
                      </span>
                      <Input
                        id="phone"
                        value={informationData.phone}
                        onChange={(e) => {
                          setInformationData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }));
                          // Clear validation error when user starts typing
                          if (validationErrors.phone) {
                            setValidationErrors((prev) => ({
                              ...prev,
                              phone: undefined,
                            }));
                          }
                        }}
                        onBlur={(e) => {
                          const error = validatePhone(e.target.value);
                          setValidationErrors((prev) => ({
                            ...prev,
                            phone: error,
                          }));
                        }}
                        placeholder="enter phone number"
                        className={`rounded-l-none ${validationErrors.phone ? "border-destructive" : ""}`}
                        disabled={settingsLoading}
                      />
                      {validationErrors.phone && (
                        <p className="text-sm text-destructive mt-1">
                          {validationErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )} */}
              </div>

              {renderField(
                "Address",
                informationData.address,
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={informationData.address}
                    onChange={(e) =>
                      setInformationData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    rows={2}
                    disabled={settingsLoading}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField(
                  "Email",
                  informationData.email || "",
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={informationData.email}
                      onChange={(e) => {
                        setInformationData((prev) => ({
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
                      onBlur={(e) => {
                        const error = validateEmail(e.target.value);
                        setValidationErrors((prev) => ({
                          ...prev,
                          email: error,
                        }));
                      }}
                      className={
                        validationErrors.email ? "border-destructive" : ""
                      }
                      disabled={settingsLoading}
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                )}
                {renderField(
                  "Website",
                  informationData.website || "",
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={informationData.website}
                      onChange={(e) =>
                        setInformationData((prev) => ({
                          ...prev,
                          website: e.target.value,
                        }))
                      }
                      disabled={settingsLoading}
                    />
                  </div>
                )}
              </div>

              {renderField(
                "Description",
                informationData.description || "",
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={informationData.description}
                    onChange={(e) =>
                      setInformationData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    disabled={settingsLoading}
                  />
                </div>
              )}

              {renderField(
                "TIN Number",
                informationData.tin || "",
                <div>
                  <Label htmlFor="tin">TIN Number</Label>
                  <Input
                    id="tin"
                    value={informationData.tin}
                    onChange={(e) =>
                      setInformationData((prev) => ({
                        ...prev,
                        tin: e.target.value,
                      }))
                    }
                    disabled={settingsLoading}
                  />
                </div>
              )}
            </CardContent>
            <div className="flex justify-end p-4 pt-0">
                 {!isEditMode ? (
                  <Button onClick={handleEdit} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleSave("Bakery Information")}
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateSettingsMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BusinessInformation;