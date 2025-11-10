import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { settingsService, SettingsData } from '@/services/settings';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Edit, X } from 'lucide-react';

const BusinessInformation = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);

    // Local state for settings forms
    const [informationData, setInformationData] = useState({
        bakeryName: '',
        registrationNumber: '',
        tin: '',
        vrnNumber: '',
        niche: '', 
        slogan: '',
        logo: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        description: '',
        workingHours: '09:00 - 17:00',
    });

    // Logo preview state
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        phone?: string;
    }>({});

    // Validation functions (omitted for brevity, assume they are correct)
    const validateEmail = (email: string): string | undefined => {
        if (!email.trim()) return undefined; 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return undefined;
    };

    const validatePhone = (phone: string): string | undefined => {
        if (!phone.trim()) return undefined; 

        const cleanPhone = phone.replace(/[\s\-]/g, '');
        if (/^(07|06)\d{8}$/.test(cleanPhone) || /^(7|6)\d{8}$/.test(cleanPhone)) {
            return undefined;
        }

        return 'Invalid Phone Number';
    };

    // Fetch settings with React Query
    const {
        data: settings,
        isLoading: settingsLoading,
        error: settingsError,
    } = useQuery<SettingsData>({
        queryKey: ['settings'],
        queryFn: () => settingsService.getAll(),
    });

    // Update settings mutation (omitted for brevity, assume it is correct)
    const updateSettingsMutation = useMutation({
        mutationFn: (data: any) => settingsService.update(data),
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Settings updated successfully.',
            });
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Failed to update settings.',
                variant: 'destructive',
            });
        },
    });

    // Populate local state when settings data is loaded
    React.useEffect(() => {
        if (settings?.information) {
            setInformationData({
                bakeryName: settings.information.bakeryName || '',
                registrationNumber: settings.information.registrationNumber || '',
                tin: settings.information.tin || '',
                vrnNumber: settings.information.vrnNumber || '',
                niche: settings.information.niche || '', 
                slogan: settings.information.slogan || '',
                logo: settings.information.logo || '',
                address: settings.information.address || '',
                phone: settings.information.phone
                    ? settings.information.phone.startsWith('+255')
                        ? settings.information.phone.substring(4)
                        : settings.information.phone
                    : '',
                email: settings.information.email || '',
                website: settings.information.website || '',
                description: settings.information.description || '',
                workingHours: settings.information.workingHours || '09:00 - 17:00',
            });
            setLogoPreview(settings.information.logo || null);
        }
    }, [settings]);

    // Show error toasts (omitted for brevity, assume it is correct)
    React.useEffect(() => {
        if (settingsError) {
            toast({
                title: 'Error',
                description: 'Failed to fetch settings.',
                variant: 'destructive',
            });
        }
    }, [settingsError, toast]);

    const handleEdit = () => {
        setIsEditMode(true);
    };

    const handleCancel = () => {
        // Reset form data to original settings (omitted for brevity, assume it is correct)
        if (settings?.information) {
            setInformationData({
                bakeryName: settings.information.bakeryName || '',
                registrationNumber: settings.information.registrationNumber || '',
                tin: settings.information.tin || '',
                vrnNumber: settings.information.vrnNumber || '',
                niche: settings.information.niche || '', // Reset niche
                slogan: settings.information.slogan || '',
                logo: settings.information.logo || '',
                address: settings.information.address || '',
                phone: settings.information.phone
                    ? settings.information.phone.startsWith('+255')
                        ? settings.information.phone.substring(4)
                        : settings.information.phone
                    : '',
                email: settings.information.email || '',
                website: settings.information.website || '',
                description: settings.information.description || '',
                workingHours: settings.information.workingHours || '09:00 - 17:00', // Reset working hours
            });
            setLogoPreview(settings.information.logo || null);
        }
        setValidationErrors({});
        setIsEditMode(false);
    };

    // Helper function to render form field or display value
    const renderField = (
        label: string,
        value: string,
        field: React.ReactNode,
        className: string = ''
    ) => {
        if (!isEditMode) {
            if (label === 'Logo' && logoPreview) {
                return (
                    <div className={className}>
                        <Label className='font-semibold'>{label}</Label>
                        <div className='mt-1'>
                            <img
                                src={logoPreview}
                                alt='Logo preview'
                                className='w-20 h-20 object-contain border rounded'
                            />
                        </div>
                    </div>
                );
            }
            return (
                <div className={className}>
                    <Label className='font-semibold'>{label}</Label>
                    <p className='text-sm text-foreground mt-1'>
                        {value || 'Not set'}
                    </p>
                </div>
            );
        }
        return field;
    };

    // Handle logo file change (omitted for brevity, assume it is correct)
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast({
                    title: 'Error',
                    description: 'Please select a valid image file.',
                    variant: 'destructive',
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setLogoPreview(result);
                setInformationData((prev) => ({
                    ...prev,
                    logo: result, // Store base64 string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = (section: string) => {
        // Clear previous validation errors
        setValidationErrors({});

        // --- Validation Logic ---
        let hasError = false;

        // Validate email
        if (informationData.email.trim()) {
            const emailError = validateEmail(informationData.email);
            if (emailError) {
                setValidationErrors((prev) => ({ ...prev, email: emailError }));
                toast({ title: 'Error', description: emailError, variant: 'destructive' });
                hasError = true;
            }
        }

        // Validate phone
        if (informationData.phone.trim()) {
            const phoneError = validatePhone(informationData.phone);
            if (phoneError) {
                setValidationErrors((prev) => ({ ...prev, phone: phoneError }));
                toast({ title: 'Error', description: phoneError, variant: 'destructive' });
                hasError = true;
            }
        }

        if (hasError) return;
        // --- End Validation Logic ---


        let updateData: any = {};

        if (section === 'Bakery Information') {
            updateData = {
                key: 'information',
                ...informationData,
                phone: informationData.phone.trim()
                    ? '+255' + informationData.phone.replace(/^0/, '')
                    : '',
                // Ensure the logo property is correctly sent as base64 or a link
                logo: informationData.logo,
            };
        } else {
            return;
        }

        updateSettingsMutation.mutate(updateData, {
            onSuccess: () => {
                setIsEditMode(false);
            },
        });
    };

    return (
        <Layout>
            <div className='p-6'>
                <div className='mb-6'>
                    <h1 className='text-3xl font-bold text-foreground'>
                        Business Information
                    </h1>
                </div>

                <div className='space-y-6'>
                    {/* Bakery Information Card */}
                    <Card className='shadow-warm'>
                        <CardHeader>
                            <div className='flex justify-between items-center'>
                                <CardTitle className='flex items-center gap-2 text-2xl'>
                                    Business Details
                                </CardTitle>
                                {!isEditMode ? (
                                    <Button
                                        onClick={handleEdit}
                                        variant='outline'
                                        disabled={settingsLoading}>
                                        <Edit className='h-4 w-4 mr-2' />
                                        Edit
                                    </Button>
                                ) : (
                                    <div className='flex gap-2'>
                                        <Button
                                            onClick={handleCancel}
                                            variant='outline'
                                            disabled={updateSettingsMutation.isPending}>
                                            <X className='h-4 w-4 mr-2' />
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => handleSave('Bakery Information')}
                                            disabled={updateSettingsMutation.isPending || settingsLoading}>
                                            <Save className='h-4 w-4 mr-2' />
                                            {updateSettingsMutation.isPending ? 'Saving...' : 'Save'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            {/* Row 1 */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {renderField(
                                    'Business Name',
                                    informationData.bakeryName,
                                    <div>
                                        <Label htmlFor='bakeryName'>Business Name</Label>
                                        <Input
                                            id='bakeryName'
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
                                    'Registration Number',
                                    informationData.registrationNumber,
                                    <div>
                                        <Label htmlFor='registrationNumber'>
                                            Registration Number
                                        </Label>
                                        <Input
                                            id='registrationNumber'
                                            value={informationData.registrationNumber}
                                            onChange={(e) =>
                                                setInformationData((prev) => ({
                                                    ...prev,
                                                    registrationNumber: e.target.value,
                                                }))
                                            }
                                            disabled={settingsLoading}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Row 2 */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {renderField(
                                    'TIN Number',
                                    informationData.tin,
                                    <div>
                                        <Label htmlFor='tin'>TIN Number</Label>
                                        <Input
                                            id='tin'
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
                                {renderField(
                                    'VRN Number',
                                    informationData.vrnNumber,
                                    <div>
                                        <Label htmlFor='vrnNumber'>VRN Number</Label>
                                        <Input
                                            id='vrnNumber'
                                            value={informationData.vrnNumber}
                                            onChange={(e) =>
                                                setInformationData((prev) => ({
                                                    ...prev,
                                                    vrnNumber: e.target.value,
                                                }))
                                            }
                                            disabled={settingsLoading}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Row 3 - Niche & Slogan */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {renderField(
                                    'Business Niche', 
                                    informationData.niche,
                                    <div>
                                        <Label htmlFor='niche'>Business Niche</Label>
                                        <Textarea
                                            id='niche'
                                            value={informationData.niche}
                                            onChange={(e) =>
                                                setInformationData((prev) => ({
                                                    ...prev,
                                                    niche: e.target.value,
                                                }))
                                            }
                                            rows={2}
                                            disabled={settingsLoading}
                                        />
                                    </div>
                                )}
                                {renderField(

                                			 'Address',
                                    informationData.address,
                                    <div>
                                        <Label htmlFor='address'>Address</Label>
                                        <Textarea
                                            id='address'
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
                            </div>

                            {/* Row 4 - Address & Working Hours */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {renderField(
                                    'Slogan',
                                    informationData.slogan,
                                    <div>
                                        <Label htmlFor='slogan'>Slogan</Label>
                                        <Input
                                            id='slogan'
                                            value={informationData.slogan}
                                            onChange={(e) =>
                                                setInformationData((prev) => ({
                                                    ...prev,
                                                    slogan: e.target.value,
                                                }))
                                            }
                                            disabled={settingsLoading}
                                        
                                        />
                                    </div>
                                )}
                                {renderField(
                                    'Working Hours (Daily)', // NEW FIELD
                                    informationData.workingHours,
                                    <div>
                                        <Label htmlFor='workingHours'>Working Hours (e.g., 09:00 - 17:00)</Label>
                                        <Input
                                            id='workingHours'
                                            type='text' // Use type='text' if you want flexible entry (e.g., '24/7' or '09:00 - 17:00')
                                            placeholder='e.g., 09:00 - 17:00'
                                            value={informationData.workingHours}
                                            onChange={(e) =>
                                                setInformationData((prev) => ({
                                                    ...prev,
                                                    workingHours: e.target.value,
                                                }))
                                            }
                                            disabled={settingsLoading}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Row 5 - Phone & Email */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {renderField(
                                    'Phone Number',
                                    informationData.phone ? `+255${informationData.phone}` : '',
                                    <div>
                                        <Label htmlFor='phone'>Phone Number</Label>
                                        <div className='flex items-center'>
                                            <span className='border border-input bg-muted px-3 py-2 rounded-l-md text-muted-foreground border-r-0'>
                                                +255
                                            </span>
                                            <Input
                                                id='phone'
                                                value={informationData.phone || ''}
                                                onChange={(e) => {
                                                    setInformationData((prev) => ({
                                                        ...prev,
                                                        phone: e.target.value,
                                                    }));
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
                                                placeholder='enter phone number'
                                                className={`rounded-l-none ${
                                                    validationErrors.phone ? 'border-destructive' : ''
                                                }`}
                                                disabled={settingsLoading}
                                            />
                                        </div>
                                        {validationErrors.phone && (
                                            <p className='text-sm text-destructive mt-1'>
                                                {validationErrors.phone}
                                            </p>
                                        )}
                                    </div>
                                )}
                                {renderField(
                                    'Email Address',
                                    informationData.email || '',
                                    <div>
                                        <Label htmlFor='email'>Email Address</Label>
                                        <Input
                                            id='email'
                                            type='email'
                                            value={informationData.email}
                                            onChange={(e) => {
                                                setInformationData((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }));
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
                                                validationErrors.email ? 'border-destructive' : ''
                                            }
                                            disabled={settingsLoading}
                                        />
                                        {validationErrors.email && (
                                            <p className='text-sm text-destructive mt-1'>
                                                {validationErrors.email}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Row 6 - Website & Logo */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {renderField(
                                    'Website',
                                    informationData.website || '',
                                    <div>
                                        <Label htmlFor='website'>Website</Label>
                                        <Input
                                            id='website'
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
                                {renderField(
                                    'Logo',
                                    informationData.logo,
                                    <div>
                                        <Label htmlFor='logo'>Logo</Label>
                                        <Input
                                            id='logo'
                                            type='file'
                                            accept='image/*'
                                            onChange={handleLogoChange}
                                            disabled={settingsLoading}
                                            className='cursor-pointer'
                                        />
                                        {logoPreview && (
                                            <div className='mt-2'>
                                                <img
                                                    src={logoPreview}
                                                    alt='Logo preview'
                                                    className='w-20 h-20 object-contain border rounded'
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default BusinessInformation;