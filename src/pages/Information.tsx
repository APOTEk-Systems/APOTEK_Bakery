import Layout from "../components/Layout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";
import {useToast} from "@/hooks/use-toast";
import {settingsService, SettingsData, BusinessHour} from "@/services/settings";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  Store,
  Clock,
} from "lucide-react";

const Information = () => {
  const {toast} = useToast();
  const queryClient = useQueryClient();

  // Local state for settings forms
  const [informationData, setInformationData] = useState({
    bakeryName: "",
    phone: "",
    address: "",
    email: "",
    website: "",
    description: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
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

  const [businessHoursData, setBusinessHoursData] = useState<BusinessHour[]>([]);

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
    if (settings) {
      setInformationData({
        ...settings.information,
        phone: settings.information.phone
          ? settings.information.phone.startsWith("+255")
            ? settings.information.phone.substring(4)
            : settings.information.phone
          : "",
      });
      setBusinessHoursData(settings.businessHours.data);
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

        updateData = {
          key: "information",
          ...informationData,
          phone: informationData.phone.trim()
            ? "+255" + informationData.phone.replace(/^0/, '')
            : "",
        };
        break;
      case "Business Hours":
        updateData = {
          key: "businessHours",
          data: businessHoursData,
        };
        break;
      default:
        return;
    }

    updateSettingsMutation.mutate(updateData);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Information</h1>
        </div>

        <div className="space-y-6">
          {/* Bakery Information */}
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Bakery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center">
                    <span className="border border-input bg-muted px-3 py-2 rounded-l-md text-muted-foreground border-r-0">
                      +255
                    </span>
                    <Input
                      id="phone"
                      value={informationData.phone}
                      onChange={(e) =>
                        setInformationData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="enter phone number"
                      className="rounded-l-none"
                      disabled={settingsLoading}
                    />
                  </div>
                </div>
              </div>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

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

              <Button
                onClick={() => handleSave("Bakery Information")}
                className="w-full md:w-auto"
                disabled={updateSettingsMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateSettingsMutation.isPending
                  ? "Saving..."
                  : "Save Bakery Info"}
              </Button>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {businessHoursData.map((hour, index) => (
                <div key={hour.day} className="flex items-center gap-4">
                  <div className="w-20">
                    <Label>{hour.day}</Label>
                  </div>
                  <Switch
                    checked={hour.isOpen}
                    onCheckedChange={(checked) => {
                      const updatedHours = [...businessHoursData];
                      updatedHours[index] = {...hour, isOpen: checked};
                      setBusinessHoursData(updatedHours);
                    }}
                    disabled={settingsLoading}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={hour.open || ""}
                      onChange={(e) => {
                        const updatedHours = [...businessHoursData];
                        updatedHours[index] = {
                          ...hour,
                          open: e.target.value,
                        };
                        setBusinessHoursData(updatedHours);
                      }}
                      className="w-24"
                      disabled={!hour.isOpen || settingsLoading}
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={hour.close || ""}
                      onChange={(e) => {
                        const updatedHours = [...businessHoursData];
                        updatedHours[index] = {
                          ...hour,
                          close: e.target.value,
                        };
                        setBusinessHoursData(updatedHours);
                      }}
                      className="w-24"
                      disabled={!hour.isOpen || settingsLoading}
                    />
                  </div>
                </div>
              ))}

              <Button
                onClick={() => handleSave("Business Hours")}
                className="w-full md:w-auto"
                disabled={updateSettingsMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateSettingsMutation.isPending
                  ? "Saving..."
                  : "Save Hours"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Information;