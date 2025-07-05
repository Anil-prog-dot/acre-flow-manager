import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const Miscellaneous = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Miscellaneous</h1>
        <p className="text-muted-foreground">Additional tools and features</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Miscellaneous Features
          </CardTitle>
          <CardDescription>
            Additional tools and utilities for your farm management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will include various additional features such as:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Notes and reminders</li>
            <li>• Weather information</li>
            <li>• Calendar and scheduling</li>
            <li>• Document storage</li>
            <li>• Settings and preferences</li>
            <li>• Backup and export options</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Miscellaneous;