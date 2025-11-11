
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import React from "react";

interface ReportLayoutProps {
  title: string;
  children: React.ReactNode;
  onExport: () => void;
  isExporting: boolean;
  isExportDisabled?: boolean;
}

const ReportLayout: React.FC<ReportLayoutProps> = ({
  children,
  onExport,
  isExporting,
  isExportDisabled,
}) => {
  return (
    <Card className="shadow-warm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
        </CardTitle>
        {children}
      </CardHeader>
      <CardContent>
        <div className="flex justify-end">
          <Button
            onClick={onExport}
            disabled={isExporting || isExportDisabled}
            className="shadow-warm"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate PDF
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportLayout;
