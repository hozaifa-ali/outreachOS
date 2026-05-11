"use client";
import { Upload, FileSpreadsheet, CheckCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";

export default function ImportContactsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/contacts/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Import Contacts</h1>
        <p className="text-muted-foreground mt-1">Upload a CSV or XLSX file to import contacts</p>
      </div>

      {!result ? (
        <>
          <div
            {...getRootProps()}
            className={`glass rounded-xl p-12 text-center border-2 border-dashed cursor-pointer transition-all ${
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="space-y-3">
                <FileSpreadsheet className="w-12 h-12 text-success mx-auto" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="font-medium">Drag & drop your file here</p>
                <p className="text-sm text-muted-foreground">Supports CSV and XLSX files up to 50MB</p>
              </div>
            )}
          </div>

          <div className="glass rounded-xl p-5 text-sm">
            <h3 className="font-medium mb-2">Expected columns:</h3>
            <p className="text-muted-foreground">email (required), first_name, last_name, company, title, linkedin_url, phone, website, industry</p>
          </div>

          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all disabled:opacity-50 cursor-pointer"
          >
            {importing ? "Importing..." : "Import Contacts"}
          </button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-xl p-8 text-center space-y-4">
          {result.error ? (
            <p className="text-danger">{result.error}</p>
          ) : (
            <>
              <CheckCircle className="w-16 h-16 text-success mx-auto" />
              <h2 className="text-xl font-bold">Import Complete</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-2xl font-bold text-success">{result.imported}</p><p className="text-xs text-muted-foreground">Imported</p></div>
                <div><p className="text-2xl font-bold text-warning">{result.skipped}</p><p className="text-xs text-muted-foreground">Skipped</p></div>
                <div><p className="text-2xl font-bold">{result.totalRows}</p><p className="text-xs text-muted-foreground">Total Rows</p></div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
