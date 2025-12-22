import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { rolesService, Role, CreateRoleData } from '@/services/roles';
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Shield, Save, ArrowLeft, Loader2 } from 'lucide-react';

// Comprehensive permissions organized by modules
const permissionModules = {
	Dashboard: [
		'view:salesDashboard',
		'view:purchasesDashboard',
		'view:inventoryDashboard',
		'view:productionDashboard',
		'view:accountingDashboard',
		
	],

	Sales: [
		'create:sales',
		'view:sales',
		//  "update:sales",
		//  "delete:sales",
		'update:payment',	
		'view:returns',
		'approve:returns',
		'return:sales',	
		'view:customers',
		'create:customers',
		'update:customers',
		'delete:customers',
		// "update:credit",
	],
	Purchases: [
		'view:purchases',
		'create:purchases',
		'approve:purchases',
		'receive:goods',
		'view:received',
		'view:suppliers',
		'create:suppliers',
		'update:suppliers',
		'delete:suppliers',
	],
	Inventory: [
		// "update:quantity",
		'view:materials',
		'create:materials',
		'update:materials',
		'delete:materials',
		'view:supplies',
		'create:supplies',
		'update:supplies',
		'delete:supplies',
		'view:materials adjustments',
		'create:materials adjustments',
		'view:supplies adjustments',
		'create:supplies adjustments',
		'view:products',
		'create:products',
		'update:products',
		'delete:products',
		'view:product adjustments',
		'create:product adjustments',
	],
	Production: [
		'view:production',
		'create:production',
		// 'update:production',
		// 'delete:production',
	],
	Accounting: [
		'view:expenses',
		'create:expenses',
		'update:expenses',
		// "approve:expenses",
		'delete:expenses',
		'view:profit-loss',
		'view:cash-flow',
		//  "view:reports",
	],
	Reports: [
		// Sales Reports
		'view:sales details',
		'view:sales summary',
		'view:cash sales details',
		'view:cash sales summary',
		'view:credit sales details',
		'view:credit sales summary',
		'view:credit payments',
		'view:price list',
		'view:sales returns',
		
		// Purchases Reports
		'view:material received',
		'view:suppliers list',
		'view:purchase orders detailed',
		'view:purchase orders summary',
		
		// Inventory Reports
		'view:materials current stock',
		'view:supplies current stock',
		'view:products current stock',
		'view:materials low stock',
		'view:supplies low stock',
		'view:materials adjustments',
		'view:supplies adjustments',
		'view:materials out of stock',
		'view:supplies out of stock',
		'view:product details',
		'view:product adjustments',
		'view:inventory suppliers list',
		
		// Production Reports
		'view:production detailed',
		'view:production summary',
		'view:ingredient usage',
		'view:ingredient summary',
		
		// Accounting Reports
		'view:gross profit',
		'view:net profit',
		'view:expenses',
		'view:outstanding payments',

		//"view:audit",
	],
	Settings: [
		'view:business-information',
		'update:business-information',
		'view:configurations',
		'update:configurations',
		'view:adjustment-reasons',
		'create:adjustment-reasons',
		'update:adjustment-reasons',
		'delete:adjustment-reasons',
		'view:expense-categories',
		'update:expense-categories',
		'view:users',
		'create:users',
		'update:users',
		'delete:users',
		'view:roles',
		'create:roles',
		'update:roles',
		'delete:roles',
		'view:notifications',
		'update:notifications',
	],
};

const allPermissions = [
	...Object.values(permissionModules).flat(),
	'view:settings',
	'update:settings',
	'view:reports',
];

const RoleForm = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const isEdit = Boolean(id);

	const [roleFormData, setRoleFormData] = useState<CreateRoleData>({
		name: '',
		description: '',
		permissions: [],
	});

	// Fetch role if editing
	const { data: role, isLoading: roleLoading } = useQuery<Role>({
		queryKey: ['role', id],
		queryFn: () => rolesService.getById(Number(id)),
		enabled: isEdit,
	});

	// Create role mutation
	const createRoleMutation = useMutation({
		mutationFn: (roleData: CreateRoleData) => rolesService.create(roleData),
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Role created successfully.',
			});
			queryClient.invalidateQueries({ queryKey: ['roles'] });
			navigate('/roles');
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to create role.',
				variant: 'destructive',
			});
		},
	});

	// Update role mutation
	const updateRoleMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: Partial<CreateRoleData> }) =>
			rolesService.update(id, data),
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Role updated successfully.',
			});
			queryClient.invalidateQueries({ queryKey: ['roles'] });
			navigate('/roles');
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to update role.',
				variant: 'destructive',
			});
		},
	});

	// Populate form data when role is loaded
	useEffect(() => {
		if (isEdit && role) {
			const isAdmin = role.name.toLowerCase() === 'admin';
			const hasAllPermissions =
				role.permissions.includes('all') || role.permissions.includes('*');
			setRoleFormData({
				name: role.name,
				description: role.description || '',
				permissions:
					isAdmin || hasAllPermissions ? allPermissions : role.permissions,
			});
		}
	}, [role, isEdit]);

	const handleSave = () => {
		if (!roleFormData.name.trim()) {
			toast({
				title: 'Error',
				description: 'Role name is required.',
				variant: 'destructive',
			});
			return;
		}

		let permissionsToSave = [...roleFormData.permissions];

		// If all permissions are selected, just pass ["all"]
		if (permissionsToSave.length === allPermissions.length) {
			permissionsToSave = ['all'];
		} else {
			// Add default permissions based on specific permissions checked
			// Settings defaults
			const settingsSpecificPermissions = [
				'view:business-information',
				'update:business-information',
				'view:configurations',
				'update:configurations',
				'view:adjustment-reasons',
				'create:adjustment-reasons',
				'update:adjustment-reasons',
				'delete:adjustment-reasons',
				'view:expense-categories',
				'update:expense-categories',
				'view:users',
				'create:users',
				'update:users',
				'delete:users',
				'view:roles',
				'create:roles',
				'update:roles',
				'delete:roles',
				'view:notifications',
				'update:notifications',
			];
			const hasSettingsSpecific = settingsSpecificPermissions.some((perm) =>
				permissionsToSave.includes(perm)
			);
			if (hasSettingsSpecific) {
				permissionsToSave = [
					...new Set([
						...permissionsToSave,
						'view:settings',
						'update:settings',
					]),
				];
			}

			// Reports defaults - check for any granular report permissions
			const reportPermissions = [
				// Sales Reports
				'view:sales details',
				'view:sales summary',
				'view:cash sales details',
				'view:cash sales summary',
				'view:credit sales details',
				'view:credit sales summary',
				'view:credit payments',
				'view:price list',
				'view:sales returns',
				
				// Purchases Reports
				'view:material received',
				'view:suppliers list',
				'view:purchase orders detailed',
				'view:purchase orders summary',
				
				// Production Reports
				'view:production detailed',
				'view:production summary',
				'view:ingredient usage',
				'view:ingredient summary',
				
				// Accounting Reports
				'view:gross profit',
				'view:net profit',
				'view:expenses',
				'view:outstanding payments',
				
				// Inventory Reports
				'view:materials current stock',
				'view:supplies current stock',
				'view:products current stock',
				'view:materials low stock',
				'view:supplies low stock',
				'view:materials adjustments',
				'view:supplies adjustments',
				'view:materials out of stock',
				'view:supplies out of stock',
				'view:product details',
				'view:product adjustments',
				'view:inventory suppliers list',
			];
			
			const hasReportsSpecific = reportPermissions.some((perm) =>
				permissionsToSave.includes(perm)
			);
			if (hasReportsSpecific) {
				permissionsToSave = [
					...new Set([...permissionsToSave, 'view:reports']),
				];
			}
		}

		const dataToSave = { ...roleFormData, permissions: permissionsToSave };

		if (isEdit && id) {
			updateRoleMutation.mutate({ id: Number(id), data: dataToSave });
		} else {
			createRoleMutation.mutate(dataToSave);
		}
	};

	const handlePermissionChange = useCallback(
		(permission: string, checked: boolean) => {
			setRoleFormData((prev) => {
				let newPermissions = [...prev.permissions];

				if (checked) {
					// Add the permission and its related backend permissions
					newPermissions = [...new Set([...newPermissions, permission])];

					// Add backend permissions based on frontend permissions
					if (permission.includes('materials')) {
						const backendPerm = permission.replace('materials', 'inventory');
						newPermissions = [...new Set([...newPermissions, backendPerm])];
					} else if (permission.includes('supplies')) {
						const backendPerm = permission.replace('supplies', 'inventory');
						newPermissions = [...new Set([...newPermissions, backendPerm])];
					} else if (permission.includes('materials adjustments')) {
						newPermissions = [
							...new Set([
								...newPermissions,
								'view:adjustments',
								'create:adjustments',
							]),
						];
					} else if (permission.includes('supplies adjustments')) {
						newPermissions = [
							...new Set([
								...newPermissions,
								'view:adjustments',
								'create:adjustments',
							]),
						];
					}
				} else {
					// Remove the permission
					newPermissions = newPermissions.filter((p) => p !== permission);
				}

				return {
					...prev,
					permissions: newPermissions,
				};
			});
		},
		[]
	);

	const handleModuleToggle = useCallback(
		(modulePermissions: string[], checked: boolean) => {
			setRoleFormData((prev) => {
				let newPermissions = checked
					? [...new Set([...prev.permissions, ...modulePermissions])]
					: prev.permissions.filter((p) => !modulePermissions.includes(p));

				// If checking inventory module, add backend permissions for all selected frontend permissions
				if (
					checked &&
					modulePermissions.some(
						(p) => p.includes('materials') || p.includes('supplies')
					)
				) {
					const backendPermissions: string[] = [];
					modulePermissions.forEach((perm) => {
						if (perm.includes('materials')) {
							backendPermissions.push(perm.replace('materials', 'inventory'));
						} else if (perm.includes('supplies')) {
							backendPermissions.push(perm.replace('supplies', 'inventory'));
						} else if (
							perm.includes('materials adjustments') ||
							perm.includes('supplies adjustments')
						) {
							backendPermissions.push('view:adjustments', 'create:adjustments');
						}
					});
					newPermissions = [
						...new Set([...newPermissions, ...backendPermissions]),
					];
				}

				return {
					...prev,
					permissions: newPermissions,
				};
			});
		},
		[]
	);

	if (isEdit && roleLoading) {
		return (
			<Layout>
				<div className='flex min-h-screen bg-background'>
					<main className='flex-1 p-6 flex items-center justify-center'>
						<Loader2 className='h-8 w-8 animate-spin' />
					</main>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className='p-6'>
				<div className='mb-6'>
					<div className='flex items-center gap-4 mb-4'>
						<Button
							variant='ghost'
							size='sm'
							asChild>
							<Link to='/roles'>
								<ArrowLeft className='h-4 w-4 mr-2' />
								Back to Roles
							</Link>
						</Button>
					</div>
					<h1 className='text-3xl font-bold text-foreground'>
						{isEdit ? 'Edit Role' : 'Create New Role'}
					</h1>
				</div>

				<Card className='shadow-warm max-w-4xl'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Shield className='h-5 w-5' />
							Role Information
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-6'>
						<div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
							<div>
								<Label htmlFor='name'>Role Name *</Label>
								<Input
									id='name'
									value={roleFormData.name}
									onChange={(e) =>
										setRoleFormData((prev) => ({
											...prev,
											name: e.target.value,
										}))
									}
									disabled={isEdit && role?.name.toLowerCase() === 'admin'}
									placeholder='Enter role name'
								/>
							</div>
							<div>
								<Label htmlFor='description'>Description</Label>
								<Textarea
									id='description'
									value={roleFormData.description}
									onChange={(e) =>
										setRoleFormData((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									disabled={isEdit && role?.name.toLowerCase() === 'admin'}
									placeholder='Enter role description'
									rows={2}
								/>
							</div>
						</div>

						<div>
							<div className='flex flex-col mb-4'>
								<div className='flex items-center space-x-2 mb-4'>
									<Checkbox
										id='check-all'
										checked={
											roleFormData.permissions.length === allPermissions.length
										}
										onCheckedChange={(checked) => {
											if (checked) {
												setRoleFormData((prev) => ({
													...prev,
													permissions: allPermissions,
												}));
											} else {
												setRoleFormData((prev) => ({
													...prev,
													permissions: [],
												}));
											}
										}}
									/>
									<Label
										htmlFor='check-all'
										className='text-sm font-medium'>
										Check All
									</Label>
								</div>
								<div>
									<Label className='text-base font-semibold'>Permissions</Label>
								</div>
							</div>

							<div className='space-y-6'>
								{Object.entries(permissionModules).map(
									([moduleName, permissions]) => {
										const moduleChecked = permissions.every((p) =>
											roleFormData.permissions.includes(p)
										);
										const modulePartial =
											permissions.some((p) =>
												roleFormData.permissions.includes(p)
											) && !moduleChecked;

										return (
											<div
												key={moduleName}
												className='border rounded-lg p-4'>
												<div className='flex items-center space-x-2 mb-3'>
													<Checkbox
														id={`module-${moduleName}`}
														checked={moduleChecked}
														onCheckedChange={(checked) =>
															handleModuleToggle(
																permissions,
																checked as boolean
															)
														}
													/>
													<Label
														htmlFor={`module-${moduleName}`}
														className='text-lg font-semibold'>
														{moduleName}
													</Label>
												</div>

												<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-6'>
													{permissions.map((permission) => (
														<div
															key={permission}
															className='flex items-center space-x-2'>
															<Checkbox
																id={`perm-${permission}`}
																checked={roleFormData.permissions.includes(
																	permission
																)}
																onCheckedChange={(checked) =>
																	handlePermissionChange(
																		permission,
																		checked as boolean
																	)
																}
															/>
															<Label
																htmlFor={`perm-${permission}`}
																className='text-sm font-normal cursor-pointer'>
																{(() => {
																	let label = permission
																		.replace(/:/g, ' ')
																		.replace(/\b\w/g, (l) => l.toUpperCase());

																	// Module-specific transformations
																	if (
																		permissionModules['Dashboard'].includes(
																			permission
																		)
																	) {
																		label = label.replace(/Dashboard/g, '');
																	} else if (
																		permissionModules['Sales'].includes(
																			permission
																		)
																	) {
																		if (permission === 'create:sales') {
																			label = 'Create New Sale';
																		} else if (permission === 'view:sales') {
																			label = 'View Sales History';
																		}
																	} else if (
																		permissionModules['Purchases'].includes(
																			permission
																		)
																	) {
																		if (permission === 'view:purchases') {
																			label = 'View Purchase Orders';
																		} else if (
																			permission === 'create:purchases'
																		) {
																			label = 'Create Purchase Order';
																		} else if (
																			permission === 'approve:purchases'
																		) {
																			label = 'Approve Purchase Order';
																		} else if (permission === 'receive:goods') {
																			label = 'Receive Materials';
																		} else if (permission === 'view:received') {
																			label = 'View Materials Received';
																		}
																	} else if (
																		permissionModules['Reports'].includes(
																			permission
																		)
																	) {
																		if (permission === 'view:received') {
																			label = 'View Materials Received';
																		} else if (
																			permission === 'view:profit-loss'
																		) {
																			label = 'View Profit Loss';
																		} else if (
																			permission === 'view:cash-flow'
																		) {
																			label = 'View Cash Flow';
																		} else if (permission.startsWith('view:sales')) {
																			if (permission.includes('sales details')) {
																				label = 'Sales Details Report';
																			} else if (permission.includes('sales summary')) {
																				label = 'Sales Summary Report';
																			} else if (permission.includes('cash sales details')) {
																				label = 'Cash Sales Details Report';
																			} else if (permission.includes('cash sales summary')) {
																				label = 'Cash Sales Summary Report';
																			} else if (permission.includes('credit sales details')) {
																				label = 'Credit Sales Details Report';
																			} else if (permission.includes('credit sales summary')) {
																				label = 'Credit Sales Summary Report';
																			} else if (permission.includes('credit payments')) {
																				label = 'Credit Payments Report';
																			} else if (permission.includes('price list')) {
																				label = 'Price List Report';
																			} else if (permission.includes('sales returns')) {
																				label = 'Sales Returns Report';
																			}
																		} else if (permission.startsWith('view:material received')) {
																			label = 'Material Received Report';
																		} else if (permission.startsWith('view:suppliers list')) {
																			label = 'Suppliers List Report';
																		} else if (permission.startsWith('view:purchase orders')) {
																			if (permission.includes('detailed')) {
																				label = 'Purchase Orders Detailed Report';
																			} else if (permission.includes('summary')) {
																				label = 'Purchase Orders Summary Report';
																			}
																		} else if (permission.startsWith('view:production')) {
																			if (permission.includes('detailed')) {
																				label = 'Production Detailed Report';
																			} else if (permission.includes('summary')) {
																				label = 'Production Summary Report';
																			}
																		} else if (permission.startsWith('view:ingredient')) {
																			if (permission.includes('usage')) {
																				label = 'Ingredient Usage Report';
																			} else if (permission.includes('summary')) {
																				label = 'Ingredient Summary Report';
																			}
																		} else if (permission.startsWith('view:gross profit')) {
																			label = 'Gross Profit Report';
																		} else if (permission.startsWith('view:net profit')) {
																			label = 'Net Profit Report';
																		} else if (permission.startsWith('view:expenses')) {
																			label = 'Expenses Report';
																		} else if (permission.startsWith('view:outstanding payments')) {
																			label = 'Outstanding Payments Report';
																		} else if (permission.startsWith('view:materials')) {
																			if (permission.includes('current stock')) {
																				label = 'Materials Current Stock Report';
																			} else if (permission.includes('low stock')) {
																				label = 'Materials Low Stock Report';
																			} else if (permission.includes('adjustments')) {
																				label = 'Materials Adjustments Report';
																			} else if (permission.includes('out of stock')) {
																				label = 'Materials Out of Stock Report';
																			}
																		} else if (permission.startsWith('view:supplies')) {
																			if (permission.includes('current stock')) {
																				label = 'Supplies Current Stock Report';
																			} else if (permission.includes('low stock')) {
																				label = 'Supplies Low Stock Report';
																			} else if (permission.includes('adjustments')) {
																				label = 'Supplies Adjustments Report';
																			} else if (permission.includes('out of stock')) {
																				label = 'Supplies Out of Stock Report';
																			}
																		} else if (permission.startsWith('view:products')) {
																			if (permission.includes('current stock')) {
																				label = 'Products Current Stock Report';
																			} else if (permission.includes('details')) {
																				label = 'Product Details Report';
																			} else if (permission.includes('adjustments')) {
																				label = 'Product Adjustments Report';
																			}
																		} else if (permission.startsWith('view:inventory suppliers')) {
																			label = 'Inventory Suppliers List Report';
																		}
																	} else if (
																		permissionModules['Accounting'].includes(
																			permission
																		)
																	) {
																		if (permission === 'view:profit-loss') {
																			label = 'View Profit Loss';
																		} else if (
																			permission === 'view:cash-flow'
																		) {
																			label = 'View Cash Flow';
																		}
																	} else if (
																		permissionModules['Inventory'].includes(
																			permission
																		)
																	) {
																		if (permission.includes('materials')) {
																			label = label.replace(
																				/Materials/g,
																				'Materials'
																			);
																		} else if (
																			permission.includes('supplies')
																		) {
																			label = label.replace(
																				/Supplies/g,
																				'Supplies'
																			);
																		} else {
																			label = label.replace(
																				/Inventory/g,
																				'Materials & Supplies'
																			);
																		}
																		if (permission.includes('adjustments')) {
																			if (permission.includes('materials')) {
																				label = label.replace(
																					/Materials Adjustments/g,
																					'Materials Adjustments'
																				);
																			} else if (
																				permission.includes('supplies')
																			) {
																				label = label.replace(
																					/Supplies Adjustments/g,
																					'Supplies Adjustments'
																				);
																			} else {
																				label = label.replace(
																					/Adjustments/g,
																					'Materials & Supplies Adjustments'
																				);
																			}
																		}
																	} else if (
																		permissionModules['Settings'].includes(
																			permission
																		)
																	) {
																		if (
																			permission.includes(
																				'business-information'
																			)
																		) {
																			if (permission.startsWith('view:')) {
																				label = 'View Business Information';
																			} else if (
																				permission.startsWith('update:')
																			) {
																				label = 'Update Business Information';
																			}
																		} else if (
																			permission.includes('adjustment-reasons')
																		) {
																			if (permission.startsWith('view:')) {
																				label = 'View Adjustment Reasons';
																			} else if (permission.startsWith('create:')) {
																				label = 'Create Adjustment Reasons';
																			} else if (permission.startsWith('update:')) {
																				label = 'Update Adjustment Reasons';
																			} else if (permission.startsWith('delete:')) {
																				label = 'Delete Adjustment Reasons';
																			}
																		} else if (
																			permission.includes('expense-categories')
																		) {
																			label = label.replace(/-/g, ' ');
																		} else if (
																			permission.includes('notifications')
																		) {
																			label = label.replace(
																				/Notifications/g,
																				'Alerts'
																			);
																		}
																	}

																	return label;
																})()}
															</Label>
														</div>
													))}
												</div>
											</div>
										);
									}
								)}
							</div>
						</div>

						<div className='flex gap-3 pt-4'>
							<Button
								variant='outline'
								asChild
								className='flex-1'>
								<Link to='/roles'>Cancel</Link>
							</Button>
							<Button
								onClick={handleSave}
								disabled={
									createRoleMutation.isPending || updateRoleMutation.isPending
								}
								className='flex-1'>
								{createRoleMutation.isPending ||
								updateRoleMutation.isPending ? (
									<Loader2 className='h-4 w-4 mr-2 animate-spin' />
								) : (
									<Save className='h-4 w-4 mr-2' />
								)}
								{isEdit ? 'Update Role' : 'Create Role'}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
};

export default RoleForm;
