import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Users, Package, Factory, ShoppingCart, BarChart3, Settings, ArrowRight, Lightbulb, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

const UserManual = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSection = searchParams.get('section') || 'getting-started';

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: BookOpen },
    { id: 'sales', title: 'Sales Management', icon: ShoppingCart },
    { id: 'inventory', title: 'Inventory Management', icon: Package },
    { id: 'production', title: 'Production', icon: Factory },
    { id: 'purchases', title: 'Purchases', icon: ShoppingCart },
    { id: 'accounting', title: 'Accounting', icon: BarChart3 },
    { id: 'settings', title: 'Settings', icon: Settings },
  ];

  const currentSectionIndex = sections.findIndex(s => s.id === currentSection);

  const navigateToSection = (sectionId: string) => {
    setSearchParams({ section: sectionId });
  };

  const nextSection = () => {
    const nextIndex = (currentSectionIndex + 1) % sections.length;
    navigateToSection(sections[nextIndex].id);
  };

  const prevSection = () => {
    const prevIndex = currentSectionIndex === 0 ? sections.length - 1 : currentSectionIndex - 1;
    navigateToSection(sections[prevIndex].id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-warm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">PastryPro User Manual</h1>
              <p className="text-muted-foreground mt-1">Complete guide to managing your bakery operations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl  px-4 sm:px-6 lg:px-2 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-warm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Contents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 p-3">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={currentSection === section.id ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start h-8 px-2"
                      onClick={() => navigateToSection(section.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {section.title}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Navigation Controls */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={prevSection}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  {sections[currentSectionIndex]?.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Section {currentSectionIndex + 1} of {sections.length}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextSection}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-280px)] pr-4">
              <div className="space-y-6">

                {/* Getting Started */}
                {currentSection === 'getting-started' && (
                  <section id="getting-started">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          Getting Started
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-foreground">Welcome to PastryPro</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            PastryPro is a comprehensive bakery management system designed to streamline your operations
                            from inventory management to sales tracking.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3 text-foreground">Quick Setup Steps:</h4>
                          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                            <li>Register your account or log in</li>
                            <li>Set up your business information</li>
                            <li>Add your products and recipes</li>
                            <li>Configure inventory items</li>
                            <li>Start managing your operations</li>
                          </ol>
                        </div>

                        <div className="mt-6">
                          <img
                            src="/sales-dashboard.png"
                            alt="PastryPro Dashboard"
                            className="w-full rounded-lg border shadow-sm"
                          />
                          <p className="text-sm text-muted-foreground mt-2 text-center">
                            Main dashboard showing key metrics and quick actions
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}

                {/* Sales Management */}
                {currentSection === 'sales' && (
                  <section id="sales">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5 text-primary" />
                          Sales Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-foreground">Creating a Sale</h3>
                          <div className="space-y-4">
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">1</Badge>
                              <div>
                                <p className="font-medium text-foreground">Navigate to Sales</p>
                                <p className="text-sm text-muted-foreground">Click on "Sales" in the main navigation menu</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">2</Badge>
                              <div>
                                <p className="font-medium text-foreground">Start New Sale</p>
                                <p className="text-sm text-muted-foreground">Click the "New Sale" button</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">3</Badge>
                              <div>
                                <p className="font-medium text-foreground">Add Customer (Optional)</p>
                                <p className="text-sm text-muted-foreground">Search for existing customer or create new one</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">4</Badge>
                              <div>
                                <p className="font-medium text-foreground">Add Products</p>
                                <p className="text-sm text-muted-foreground">Select products and quantities from your catalog</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">5</Badge>
                              <div>
                                <p className="font-medium text-foreground">Complete Sale</p>
                                <p className="text-sm text-muted-foreground">Review and confirm the transaction</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <img
                            src="/new-sale-cart.png"
                            alt="New Sale Form"
                            className="w-full rounded-lg border shadow-sm"
                          />
                          <p className="text-sm text-muted-foreground mt-2 text-center">
                            New sale form showing cart and checkout process
                          </p>
                        </div>

                        <Separator className="my-6" />

                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-foreground">Managing Customers</h3>
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            Keep track of your customer information for better service and marketing.
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Add Customer:</strong> Go to Customers → New Customer</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">View History:</strong> Click on customer name to see purchase history</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Edit Info:</strong> Use the edit button on customer details page</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mt-6">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-accent-foreground mb-1">Pro Tip</h4>
                              <p className="text-sm text-accent-foreground/80">
                                Regular customer data helps you identify your best customers and create targeted promotions.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}

                {/* Inventory Management */}
                {currentSection === 'inventory' && (
                  <section id="inventory">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          Inventory Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-foreground">Adding Raw Materials</h3>
                          <div className="space-y-4">
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">1</Badge>
                              <div>
                                <p className="font-medium text-foreground">Navigate to Materials</p>
                                <p className="text-sm text-muted-foreground">Click "Materials" in the navigation</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">2</Badge>
                              <div>
                                <p className="font-medium text-foreground">Add New Item</p>
                                <p className="text-sm text-muted-foreground">Click "New Material" button</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">3</Badge>
                              <div>
                                <p className="font-medium text-foreground">Fill Details</p>
                                <p className="text-sm text-muted-foreground">Enter name, unit, minimum stock level</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">4</Badge>
                              <div>
                                <p className="font-medium text-foreground">Set Initial Stock</p>
                                <p className="text-sm text-muted-foreground">Add opening inventory quantity</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <img
                            src="/materials-list.png"
                            alt="Materials List"
                            className="w-full rounded-lg border shadow-sm"
                          />
                          <p className="text-sm text-muted-foreground mt-2 text-center">
                            Materials list showing inventory items and stock levels
                          </p>
                        </div>

                        <Separator className="my-6" />

                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-foreground">Stock Adjustments</h3>
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            Adjust inventory levels for various reasons like spoilage, donations, or corrections.
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Location:</strong> Materials → Adjustments tab</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Process:</strong> Select item → Choose action (Add/Minus) → Enter quantity → Select reason</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Reasons:</strong> Configure adjustment reasons in Settings</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-blue-900 mb-1">Important</h4>
                              <p className="text-sm text-blue-800">
                                Always document the reason for inventory adjustments to maintain accurate records and comply with accounting standards.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}

                {/* Production */}
                {currentSection === 'production' && (
                  <section id="production">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Factory className="h-5 w-5 text-primary" />
                          Production Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-foreground">Creating Production Runs</h3>
                          <div className="space-y-4">
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">1</Badge>
                              <div>
                                <p className="font-medium text-foreground">Go to Production</p>
                                <p className="text-sm text-muted-foreground">Click "Production" in navigation</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">2</Badge>
                              <div>
                                <p className="font-medium text-foreground">Start New Run</p>
                                <p className="text-sm text-muted-foreground">Click "New Production Run"</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">3</Badge>
                              <div>
                                <p className="font-medium text-foreground">Select Product</p>
                                <p className="text-sm text-muted-foreground">Choose product to produce</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">4</Badge>
                              <div>
                                <p className="font-medium text-foreground">Set Quantity</p>
                                <p className="text-sm text-muted-foreground">Enter production quantity</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">5</Badge>
                              <div>
                                <p className="font-medium text-foreground">Review Materials</p>
                                <p className="text-sm text-muted-foreground">Check required ingredients and availability</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">6</Badge>
                              <div>
                                <p className="font-medium text-foreground">Execute Production</p>
                                <p className="text-sm text-muted-foreground">Confirm and start the production run</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col items-center">
                          <img
                            src="/production-form.png"
                            alt="Production Form"
                            className="w-1/2 rounded-lg border shadow-sm"
                          />
                          <p className="text-sm text-muted-foreground mt-2 text-center">
                            Production run form showing product selection and material requirements
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}

                {/* Purchases */}
                {currentSection === 'purchases' && (
                  <section id="purchases">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5 text-primary" />
                          Purchase Orders
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-foreground">Creating Purchase Orders</h3>
                          <div className="space-y-4">
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">1</Badge>
                              <div>
                                <p className="font-medium text-foreground">Navigate to Purchases</p>
                                <p className="text-sm text-muted-foreground">Click "Purchases" in navigation</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">2</Badge>
                              <div>
                                <p className="font-medium text-foreground">New Purchase Order</p>
                                <p className="text-sm text-muted-foreground">Click "New Purchase Order"</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">3</Badge>
                              <div>
                                <p className="font-medium text-foreground">Select Supplier</p>
                                <p className="text-sm text-muted-foreground">Choose from existing suppliers or add new</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">4</Badge>
                              <div>
                                <p className="font-medium text-foreground">Add Items</p>
                                <p className="text-sm text-muted-foreground">Select materials/supplies and quantities</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">5</Badge>
                              <div>
                                <p className="font-medium text-foreground">Set Delivery Date</p>
                                <p className="text-sm text-muted-foreground">Specify expected delivery date</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                              <Badge variant="secondary" className="mt-0.5 flex-shrink-0">6</Badge>
                              <div>
                                <p className="font-medium text-foreground">Submit Order</p>
                                <p className="text-sm text-muted-foreground">Send to supplier</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <img
                            src="/po-form.png"
                            alt="Purchase Order Form"
                            className="w-full rounded-lg border shadow-sm"
                          />
                          <p className="text-sm text-muted-foreground mt-2 text-center">
                            Purchase order form showing supplier selection and item details
                          </p>
                        </div>

                        <Separator className="my-6" />

                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-foreground">Receiving Goods</h3>
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            Process deliveries and update inventory automatically.
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Access:</strong> Click "Receive" on purchase order</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Process:</strong> Verify quantities → Confirm receipt → Update inventory</p>
                            </div>                 
                          </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-green-900 mb-1">Best Practice</h4>
                              <p className="text-sm text-green-800">
                                Always verify quantities and quality upon delivery to catch any discrepancies early.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}

                {/* Accounting */}
                {currentSection === 'accounting' && (
                  <section id="accounting">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          Accounting & Reports
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-foreground">Expense Tracking</h3>
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            Record and categorize all business expenses.
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Location:</strong> Accounting → Expenses tab</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Add Expense:</strong> Click "Add Expense" → Fill details → Categorize</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Categories:</strong> Manage categories in Expense Categories</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <img
                            src="/create-expense-form.png"
                            alt="Expense Form"
                            className="w-full rounded-lg border shadow-sm"
                          />
                          <p className="text-sm text-muted-foreground mt-2 text-center">
                            Expense tracking form with category selection
                          </p>
                        </div>

                        <Separator className="my-6" />

                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-foreground">Reports</h3>
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            Generate insights into your business performance.
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Sales Reports:</strong> Track revenue by period, product, customer</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Inventory Reports:</strong> Stock levels, movement history</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Profitability:</strong> Cost analysis and profit margins</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <img
                            src="/sales-report.png"
                            alt="Sales Report"
                            className="w-full rounded-lg border shadow-sm"
                          />
                          <p className="text-sm text-muted-foreground mt-2 text-center">
                            Sales report showing revenue trends and analytics
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}

                {/* Settings */}
                {currentSection === 'settings' && (
                  <section id="settings">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-primary" />
                          Settings & Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-foreground">Business Information</h3>
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            Set up your business details for receipts and reports.
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Access:</strong> Settings → Business Information</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Details:</strong> Name, address, contact info, logo</p>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-6" />

                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-foreground">User Management</h3>
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            Control access and permissions for your team.
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Users:</strong> Add team members and set roles</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Roles:</strong> Define permissions for different positions</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Security:</strong> Manage passwords and access levels</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <img
                            src="/create-user-form.png"
                            alt="User Management"
                            className="w-full rounded-lg border shadow-sm"
                          />
                          <p className="text-sm text-muted-foreground mt-2 text-center">
                            User management form for adding team members and setting permissions
                          </p>
                        </div>

                        <Separator className="my-6" />

                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-foreground">System Configuration</h3>
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            Customize the system to match your workflow.
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Adjustment Reasons:</strong> Configure stock adjustment categories</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Units:</strong> Set up measurement units for inventory</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Notifications:</strong> Configure alerts and reminders</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}

              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManual;