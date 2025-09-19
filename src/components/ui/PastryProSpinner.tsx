import { Loader2 } from "lucide-react";

export function PastryProSpinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 h-screen">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
      <p className="text-muted-foreground text-lg">Pastry Pros Loading...</p>
    </div>
  );
}