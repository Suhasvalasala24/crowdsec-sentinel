import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RuleUpload = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/rules/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      alert(data.message || "Rule uploaded successfully");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="flex space-x-4 items-center">
      <Input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-white"
      />
      <Button onClick={handleUpload} className="bg-blue-600 hover:bg-blue-700">
        Upload
      </Button>
    </div>
  );
};

export default RuleUpload;
