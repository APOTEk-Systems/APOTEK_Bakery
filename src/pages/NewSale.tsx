import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getProducts, type Product } from '@/services/products';
import { customersService, type Customer } from '@/services/customers';
import { salesService, type SaleItem } from '@/services/sales';
import { settingsService, type SettingsData } from '@/services/settings';
import ProductsList from '../components/sales/ProductsList';
import Cart from '../components/sales/Cart';
import Checkout from '../components/sales/Checkout';
import ConfirmSaleDialog from '../components/sales/ConfirmSaleDialog';
import NewCustomerDialog from '../components/sales/NewCustomerDialog';
import { useAuth } from '@/contexts/AuthContext';

// Helper function to check permissions
const hasPermission = (user: any, permission: string): boolean => {
	if (!user) return false;
	if (
		user.permissions?.includes('all') ||
		user.permissions?.includes('*') ||
		user.permissions?.includes('*') ||
		user.permissions?.includes('*') ||
		user.permissions?.includes('*') ||
		user.permissions?.includes('*')
	)
		return true;
	return user.permissions?.includes(permission) || false;
};

interface CartItem extends Product {
	cartQuantity: number;
}

const NewSale = () => {
	const { user } = useAuth();

	// Check permissions
	const hasCreateSales = hasPermission(user, 'create:sales');

	if (!hasCreateSales) {
		return (
			<Layout>
				<div className='p-6'>
					<div className='flex flex-col items-center justify-center min-h-[400px]'>
						<h1 className='text-2xl font-bold text-muted-foreground mb-2'>
							Access Denied
						</h1>
						<p className='text-muted-foreground'>
							You don't have permission to create sales.
						</p>
					</div>
				</div>
			</Layout>
		);
	}

	// basic data
	const [searchTerm, setSearchTerm] = useState('');
	const [cart, setCart] = useState<CartItem[]>([]);

	// payment/customer controls
	const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | ''>(
		'cash'
	);
	const [selectedCustomer, setSelectedCustomer] = useState<string>(''); // optional customer id
	const [customerName, setCustomerName] = useState<string>(''); // free-text name for walk-ins
	const [creditDueDate, setCreditDueDate] = useState<string>(''); // yyyy-mm-dd or empty

	// UI state
	const [currentStep, setCurrentStep] = useState(1);
	const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
	const [newCustomerForm, setNewCustomerForm] = useState({
		name: '',
		email: '',
		phone: '',
		creditLimit: '',
	});
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [soldCart, setSoldCart] = useState<CartItem[]>([]);
	const [saleCompleted, setSaleCompleted] = useState(false);
	const [newSale, setNewSale] = useState<any>(null);
	const [previewFormat, setPreviewFormat] = useState<'a4' | 'a5' | 'thermal' | null>(
		null
	);
	const [soldCustomer, setSoldCustomer] = useState<Customer | null>(null);
	const [soldCustomerName, setSoldCustomerName] = useState('');

	const resetSaleState = () => {
		setShowConfirmDialog(false);
		setSoldCart([]);
		setSaleCompleted(false);
		setNewSale(null);
		setPreviewFormat(null);
		setSoldCustomer(null);
		setSoldCustomerName('');
		setCurrentStep(1);
		setSearchTerm('');
		setCart([]);
		setPaymentMethod('cash');
		setSelectedCustomer('');
		setCustomerName('');
		setCreditDueDate('');
		setIsNewCustomerOpen(false);
		setNewCustomerForm({ name: '', email: '', phone: '', creditLimit: '' });
	};

	const { toast } = useToast();

	const queryClient = useQueryClient();

	const productsQuery = useQuery({
		queryKey: ['products'],
		queryFn: getProducts,
	});

	const customersQuery = useQuery({
		queryKey: ['customers'],
		queryFn: () => customersService.getAll(),
	});

	const settingsQuery = useQuery({
		queryKey: ['settings'],
		queryFn: () => settingsService.getAll(),
	});

	const loading =
		productsQuery.isLoading ||
		customersQuery.isLoading ||
		settingsQuery.isLoading;
	const error =
		productsQuery.error || customersQuery.error || settingsQuery.error;

	const products = productsQuery.data || [];
	const customers = customersQuery.data || [];
	const settings = settingsQuery.data;

	const createCustomerMutation = useMutation({
		mutationFn: (data: any) => customersService.create(data),
		onSuccess: (newCustomer) => {
			queryClient.setQueryData(['customers'], (old: Customer[] | undefined) => [
				...(old || []),
				newCustomer,
			]);
			setSelectedCustomer(newCustomer.id.toString());
			toast({
				title: 'Customer Added',
				description: 'New customer created successfully',
			});
			setIsNewCustomerOpen(false);
			setNewCustomerForm({ name: '', email: '', phone: '', creditLimit: '' });
		},
		onError: (err) => {
			toast({
				title: 'Error',
				description: 'Failed to create customer',
				variant: 'destructive',
			});
		},
	});

	const createSaleMutation = useMutation({
		mutationFn: (saleData: any) => salesService.createSale(saleData),
		onSuccess: (newSale) => {
			queryClient.invalidateQueries({ queryKey: ['recentSales'] });
			queryClient.invalidateQueries({ queryKey: ['unpaidSales'] });
			queryClient.invalidateQueries({ queryKey: ['products'] });
			toast({
				title: 'Success',
				description: `Sale created successfully`,
			});
			setSoldCart(
				cart.map((item) => ({ ...item, quantity: item.cartQuantity }))
			);
			setSoldCustomer(
				selectedCustomer
					? customers.find((c) => c.id.toString() === selectedCustomer) || null
					: null
			);
			setSoldCustomerName(customerName);
			setCart([]);
			setSelectedCustomer('');
			setCustomerName('');
			setPaymentMethod('');
			setCreditDueDate('');
			setSaleCompleted(true);
			setNewSale(newSale);
		},
		onError: (err) => {
			toast({
				title: 'Error',
				description: 'Failed to create sale',
				variant: 'destructive',
			});
		},
	});

	// product helpers
	const filteredProducts = products.filter((p) =>
		p.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const addToCart = (product: Product) => {
		setCart((prev) => {
			const exists = prev.find((i) => i.id === product.id);
			if (exists) {
				if (exists.cartQuantity + 1 > product.quantity) {
					toast({
						title: 'Insufficient Stock',
						description: `Only ${product.quantity} available for ${product.name}`,
						variant: 'destructive',
					});
					return prev;
				}
				return prev.map((i) =>
					i.id === product.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i
				);
			}
			return [...prev, { ...product, cartQuantity: 1 }];
		});
	};

	const updateQuantity = (id: number, quantity: number) => {
		if (quantity <= 0) {
			setCart((prev) => prev.filter((i) => i.id !== id));
		} else {
			const product = products.find((p) => p.id === id);
			if (product && quantity > product.quantity) {
				toast({
					title: 'Insufficient Stock',
					description: `Only ${product.quantity} available for ${product.name}`,
					variant: 'destructive',
				});
				return;
			}
			setCart((prev) =>
				prev.map((i) => (i.id === id ? { ...i, cartQuantity: quantity } : i))
			);
		}
	};

	const removeFromCart = (id: number) =>
		setCart((prev) => prev.filter((i) => i.id !== id));

	// totals
	const subtotal = cart.reduce((s, it) => s + it.price * it.cartQuantity, 0);
	const taxRate = settings?.configuration?.vat
		? parseFloat(settings.configuration.vat.toString())
		: 0;

	console.log('taxRate:', taxRate);
	const tax = subtotal * (taxRate / 100);
	const total = subtotal + tax;

	// validate & open confirm
	const handleConfirmSale = () => {
		setSaleCompleted(false);
		setNewSale(null);
		setPreviewFormat(null);
		if (cart.length === 0) {
			toast({
				title: 'Invalid Sale',
				description: 'Add items to cart',
				variant: 'destructive',
			});
			return;
		}
		if (!['cash', 'credit'].includes(paymentMethod)) {
			toast({
				title: 'Payment Method',
				description: 'Select a payment method: Cash or Credit',
				variant: 'destructive',
			});
			return;
		}
		if (paymentMethod === 'credit') {
			// Find selected customer
			const customer = customers.find(
				(c) => c.id.toString() === selectedCustomer
			);

			// Check for valid customer
			if (!customer) {
				toast({
					title: 'Credit Sale',
					description: 'Credit sales must be linked to a valid customer',
					variant: 'destructive',
				});
				return;
			}

			// Check for due date
			if (!creditDueDate) {
				toast({
					title: 'Credit Sale',
					description: 'Credit sale should have a due date',
					variant: 'destructive',
				});
				return;
			}

			// Check credit limit
			const totalCreditAfterSale = total + (customer.currentCredit || 0);
			if (totalCreditAfterSale > (customer.creditLimit || 0)) {
				toast({
					title: 'Credit Sale',
					description: `This sale exceeds ${customer.name}'s credit limit`,
					variant: 'destructive',
				});
				return;
			}
		}

		setShowConfirmDialog(true);
	};

	// complete sale
	const handleCompleteSale = () => {
		const items: SaleItem[] = cart.map(
			(it) =>
				({
					productId: it.id,
					quantity: it.cartQuantity,
					// some services expect `price` or `unitPrice` — earlier examples used `price`
					price: it.price,
				} as unknown as SaleItem)
		);

		const saleData: any = {
			items,
			total,
			subtotal: subtotal.toString(),
			vat: tax.toString(),
			isCredit: paymentMethod === 'credit',
			creditDueDate:
				paymentMethod === 'credit' && creditDueDate
					? new Date(creditDueDate).toISOString()
					: null,
		};

		if (selectedCustomer) saleData.customerId = parseInt(selectedCustomer);
		if (!selectedCustomer && customerName.trim()) saleData.notes = customerName;

		createSaleMutation.mutate(saleData);
	};

	// create customer
	const handleAddNewCustomer = () => {
		if (!newCustomerForm.name.trim()) return;
		if (!newCustomerForm.phone.trim()) return;
		if (!newCustomerForm.creditLimit.trim()) return;

		createCustomerMutation.mutate({
			name: newCustomerForm.name,
			email: newCustomerForm.email || undefined,
			phone: '+255' + newCustomerForm.phone.replace(/^0/, ''),
			status: 'active',
			creditLimit: parseFloat(newCustomerForm.creditLimit.replace(/,/g, '')),
			currentCredit: 0,
			loyaltyPoints: 0,
			isCredit: true,
		});
	};

	// loading / error UIs
	if (loading) {
		return (
			<Layout>
				<div className='flex h-screen items-center justify-center'>
					<div className='text-center'>
						<Loader2 className='h-8 w-8 animate-spin mx-auto mb-2 text-primary' />
						<p>Loading...</p>
					</div>
				</div>
			</Layout>
		);
	}

	if (error) {
		return (
			<Layout>
				<div className='p-6'>
					<Card className='max-w-md mx-auto'>
						<CardContent className='pt-6'>
							<p className='text-destructive'>
								{error instanceof Error
									? error.message
									: 'Failed to fetch data'}
							</p>
							<Button
								onClick={() => window.location.reload()}
								className='mt-4'>
								Retry
							</Button>
						</CardContent>
					</Card>
				</div>
			</Layout>
		);
	}

	return (
		<>
			<Layout>
				<div className='p-6'>
					<div className='mb-6'>
						<div className='flex items-center gap-4 mb-4'>
							<div>
								<h1 className='text-3xl font-bold tracking-tight'>New Sale</h1>
							</div>
						</div>
					</div>

					{currentStep === 1 ? (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<ProductsList
								searchTerm={searchTerm}
								setSearchTerm={setSearchTerm}
								filteredProducts={filteredProducts}
								addToCart={addToCart}
							/>
							<Cart
								cart={cart}
								products={products}
								updateQuantity={updateQuantity}
								removeFromCart={removeFromCart}
								setCurrentStep={setCurrentStep}
							/>
						</div>
					) : (
						<Checkout
							setCurrentStep={setCurrentStep}
							selectedCustomer={selectedCustomer}
							setSelectedCustomer={setSelectedCustomer}
							customers={customers}
							paymentMethod={paymentMethod}
							setPaymentMethod={setPaymentMethod}
							creditDueDate={creditDueDate}
							setCreditDueDate={setCreditDueDate}
							isNewCustomerOpen={isNewCustomerOpen}
							setIsNewCustomerOpen={setIsNewCustomerOpen}
							newCustomerForm={newCustomerForm}
							setNewCustomerForm={setNewCustomerForm}
							handleConfirmSale={handleConfirmSale}
							subtotal={subtotal}
							tax={tax}
							total={total}
							cart={cart.map((item) => ({
								...item,
								quantity: item.cartQuantity,
							}))}
							createSaleMutation={createSaleMutation}
						/>
					)}
				</div>
			</Layout>

			<ConfirmSaleDialog
				showConfirmDialog={showConfirmDialog}
				setShowConfirmDialog={setShowConfirmDialog}
				saleCompleted={saleCompleted}
				previewFormat={previewFormat}
				setPreviewFormat={setPreviewFormat}
				total={total}
				paymentMethod={paymentMethod}
				creditDueDate={creditDueDate}
				selectedCustomer={selectedCustomer}
				customers={customers}
				customerName={customerName}
				soldCart={soldCart}
				soldCustomer={soldCustomer}
				soldCustomerName={soldCustomerName}
				newSale={newSale}
				handleCompleteSale={handleCompleteSale}
				createSaleMutation={createSaleMutation}
				onResetSale={resetSaleState}
				businessInfo={settings?.information}
			/>

			<NewCustomerDialog
				isNewCustomerOpen={isNewCustomerOpen}
				setIsNewCustomerOpen={setIsNewCustomerOpen}
				newCustomerForm={newCustomerForm}
				setNewCustomerForm={setNewCustomerForm}
				handleAddNewCustomer={handleAddNewCustomer}
				createCustomerMutation={createCustomerMutation}
			/>
		</>
	);
};

export default NewSale;
