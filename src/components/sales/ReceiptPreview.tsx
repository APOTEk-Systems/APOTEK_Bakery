import { format } from 'date-fns';
import { formatCurrency } from "@/lib/funcs";
import { useAuth } from "@/contexts/AuthContext";

interface ReceiptPreviewProps {
  receiptFormat: 'a5' | 'thermal' | null;
  sale: any;
  cart: any[];
  customer: any;
  customerName?: string;
  paymentMethod: string;
  creditDueDate: string;
  total: number;
  subtotal: number;
  tax: number;
  businessInfo?: {
    bakeryName: string;
    address: string;
    phone: string;
    email: string;
  };
}

const ReceiptPreview = ({
  receiptFormat,
  sale,
  cart,
  customer,
  customerName,
  paymentMethod,
  creditDueDate,
  total,
  subtotal,
  tax,
  businessInfo
}: ReceiptPreviewProps) => {
  const { user } = useAuth();
  const isA5 = receiptFormat === 'a5';
  const className = isA5 ? 'w-full max-w-2xl mx-auto' : 'w-full max-w-sm mx-auto';

 // console.log(user)
  const renderItems = () => {
    if (isA5) {
      // A5: Full table with borders and alternating row colors
      return (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="text-left py-2 px-2 border-r">Item</th>
              <th className="text-center py-2 px-2 border-r">Qty</th>
              <th className="text-right py-2 px-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-2 px-2 border-r">{item.name}</td>
                <td className="text-center py-2 px-2 border-r">{item.quantity}</td>
                <td className="text-right py-2 px-2">{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      // Thermal: Table without borders (except header separator)
      return (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1">Item</th>
              <th className="text-center py-1">Qty</th>
              <th className="text-right py-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.id}>
                <td className="py-1">{item.name}</td>
                <td className="text-center py-1">{item.quantity}</td>
                <td className="text-right py-1">{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div className={`${className} p-4 border bg-white text-sm font-mono`}>
      {/* Business Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">{businessInfo?.bakeryName || 'Pastry Pros'}</h1>
        {businessInfo?.address && <p className="text-xs">{businessInfo.address}</p>}
        {businessInfo?.phone && <p className="text-xs">Tel: {businessInfo.phone}</p>}
        {businessInfo?.email && <p className="text-xs">{businessInfo.email}</p>}
      </div>

      <div className="text-center mb-4">
        <p>Receipt #: {sale?.id}</p>
        <p>Customer: {customer?.name || customerName || 'Cash'}</p>
        <p>Date: {format(new Date(sale.createdAt), "dd-MM-yyyy")}</p>
      </div>

      <div className="mb-4">
        {renderItems()}
      </div>

      <div className="border-b mb-2"></div>

      <div className="space-y-1 mb-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>VAT:</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="mb-4">
        <p>Payment: {paymentMethod === 'credit' ? 'Credit' : 'Cash'}</p>
        {paymentMethod === 'credit' && creditDueDate && (
          <p>Due: {format(new Date(creditDueDate), 'dd-MM-yyyy')}</p>
        )}
      </div>

      <div className="text-center text-xs border-t pt-2">
        <p>Thank you for shopping with us!</p>
        <p>Enjoy!</p>
        {user?.name && <p className="mt-2">Issued By: {user.name}</p>}
      </div>
    </div>
  );
};

export default ReceiptPreview;