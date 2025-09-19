
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download,
  Eye
} from "lucide-react";

const ReportsTab = () => {
  return (
    <Card className="shadow-warm">
      <CardHeader>
        <CardTitle>Financial Reports</CardTitle>
        <p className="text-muted-foreground">Generate comprehensive financial reports</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profit-loss">Profit & Loss Statement</SelectItem>
                <SelectItem value="expense-summary">Expense Summary</SelectItem>
                <SelectItem value="category-breakdown">Category Breakdown</SelectItem>
                <SelectItem value="cash-flow">Cash Flow Statement</SelectItem>
                <SelectItem value="tax-report">Tax Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="period">Time Period</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsTab;
