import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<any>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const testWithFetch = async () => {
    if (!file) {
      toast({ title: "Please select a file first", variant: "destructive" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("userId", "test-user-123");

      console.log("Testing with fetch():");
      console.log("File:", file);
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      const response = await fetch("/api/test-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Response:", data);
      setResponse(data);

      if (response.ok) {
        toast({ title: "Success with fetch!", description: data.message });
      } else {
        toast({ title: "Failed with fetch", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
  };

  const testWithApiRequest = async () => {
    if (!file) {
      toast({ title: "Please select a file first", variant: "destructive" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("userId", "test-user-123");

      console.log("Testing with apiRequest():");
      console.log("File:", file);
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      const response = await apiRequest("/api/test-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Response:", data);
      setResponse(data);

      if (response.ok) {
        toast({ title: "Success with apiRequest!", description: data.message });
      } else {
        toast({ title: "Failed with apiRequest", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("ApiRequest error:", error);
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
  };

  const testAdminEndpoint = async () => {
    if (!file) {
      toast({ title: "Please select a file first", variant: "destructive" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("userId", "e0c8f9dd-0262-4632-8021-fb5a7abedfc3"); // A real user ID

      console.log("Testing admin endpoint with apiRequest():");
      console.log("File:", file);
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      const response = await apiRequest("/api/admin/upload/profile-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Response:", data);
      setResponse(data);

      if (response.ok) {
        toast({ title: "Success with admin endpoint!", description: data.message });
      } else {
        toast({ title: "Failed with admin endpoint", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Admin endpoint error:", error);
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Test File Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input type="file" onChange={handleFileChange} accept="image/*" />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <Button onClick={testWithFetch} disabled={!file}>
              Test with fetch()
            </Button>
            <Button onClick={testWithApiRequest} disabled={!file} variant="secondary">
              Test with apiRequest()
            </Button>
            <Button onClick={testAdminEndpoint} disabled={!file} variant="outline">
              Test Admin Endpoint
            </Button>
          </div>

          {response && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre className="text-xs">{JSON.stringify(response, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}