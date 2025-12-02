import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	User,
	Settings,
	HelpCircle,
	Mail,
	Phone,
	Calendar,
	Shield,
} from 'lucide-react';

// Helper function to check permissions
const hasPermission = (user: any, permission: string): boolean => {
	if (!user) return false;
	if (user.permissions?.includes('all') || user.permissions?.includes('*'))
		return user.permissions?.includes(permission) || false;
};

const WelcomePage: React.FC = () => {
	const { user } = useAuth();

	// Define available actions based on permissions
	const availableActions = [
		{
			permission: 'view:profile',
			label: 'View Profile',
			icon: User,
			route: '/profile',
			description: 'Manage your account settings',
		},
		{
			permission: 'view:settings',
			label: 'Settings',
			icon: Settings,
			route: '/configurations',
			description: 'System configuration',
		},
	];

	const permittedActions = availableActions.filter((action) =>
		hasPermission(user, action.permission)
	);

	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto px-6 py-8'>
				<div className='max-w-4xl mx-auto space-y-8'>
					{/* Welcome Header */}
					<div className='text-center space-y-4'>
						<div className='flex justify-center'>
							<div className='p-4 bg-primary/10 rounded-full'>
								<User className='h-12 w-12 text-primary' />
							</div>
						</div>
						<div>
							<h1 className='text-4xl font-bold text-foreground mb-2'>
								Welcome back, {user?.name || 'User'}!
							</h1>
							<p className='text-xl text-muted-foreground'>
								You have limited access to the system dashboard
							</p>
						</div>
					</div>

					{/* User Info Card */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Shield className='h-5 w-5' />
								Account Information
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<div className='flex items-center gap-2'>
										<User className='h-4 w-4 text-muted-foreground' />
										<span className='font-medium'>Name:</span>
										<span>{user?.name || 'N/A'}</span>
									</div>
									<div className='flex items-center gap-2'>
										<Mail className='h-4 w-4 text-muted-foreground' />
										<span className='font-medium'>Email:</span>
										<span>{user?.email || 'N/A'}</span>
									</div>
								</div>
								<div className='space-y-2'>
									<div className='flex items-center gap-2'>
										<Shield className='h-4 w-4 text-muted-foreground' />
										<span className='font-medium'>Role:</span>
										<Badge variant='secondary'>{user?.role || 'User'}</Badge>
									</div>
									<div className='flex items-center gap-2'>
										<Calendar className='h-4 w-4 text-muted-foreground' />
										<span className='font-medium'>Last Login:</span>
										<span>{new Date().toLocaleDateString()}</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Available Actions */}
					{permittedActions.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Available Actions</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									{permittedActions.map((action) => {
										const IconComponent = action.icon;
										return (
											<Button
												key={action.permission}
												variant='outline'
												className='h-auto p-4 justify-start'
												onClick={() => (window.location.href = action.route)}>
												<div className='flex items-start gap-3'>
													<IconComponent className='h-5 w-5 mt-0.5' />
													<div className='text-left'>
														<div className='font-medium'>{action.label}</div>
														<div className='text-sm text-muted-foreground'>
															{action.description}
														</div>
													</div>
												</div>
											</Button>
										);
									})}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Help & Support */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<HelpCircle className='h-5 w-5' />
								Need Help?
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<p className='text-muted-foreground'>
								If you believe you should have access to additional features or
								need to update your permissions, please contact your system
								administrator.
							</p>
							<div className='flex flex-col sm:flex-row gap-4'>
								<div className='flex items-center gap-2'>
									<Mail className='h-4 w-4 text-muted-foreground' />
									<span className='text-sm'>
										Email: support@goldencrustbakery.com
									</span>
								</div>
								<div className='flex items-center gap-2'>
									<Phone className='h-4 w-4 text-muted-foreground' />
									<span className='text-sm'>Phone: (555) 123-BAKE</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* System Status */}
					<Card>
						<CardHeader>
							<CardTitle>System Status</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='flex items-center gap-2'>
								<div className='w-3 h-3 bg-green-500 rounded-full'></div>
								<span className='text-sm text-muted-foreground'>
									All systems operational • Last updated:{' '}
									{new Date().toLocaleTimeString()}
								</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default WelcomePage;
