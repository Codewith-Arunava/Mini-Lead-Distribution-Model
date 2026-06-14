import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { leadService } from "../../services/leadService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

const SAMPLE_CSV = `name,email,phone,company,source
John Smith,john.smith@techcorp.com,+15551234567,TechCorp Ltd,Website
Emma Johnson,emma.j@innovate.io,+15559876543,InnovateSoft,LinkedIn
Oliver Brown,oliver.b@datadriven.com,+15555555555,DataDriven Inc,Facebook
Sophia Taylor,sophia.t@cloud.net,+15551112233,CloudFirst,Referral
William Anderson,will.a@peaksales.com,+15554445566,PeakSales Co,Email`;

export default function ImportCSV() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer?.files?.[0];
    handleFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await leadService.importCSV(formData);
      setResult(data);
      toast.success(`Import complete: ${data.summary.imported} leads imported!`);
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Import failed");
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Import CSV</h1>
          <p className="text-muted-foreground text-sm">Bulk import leads from a CSV file</p>
        </div>
        <Button variant="outline" onClick={downloadSample}>
          <Download className="w-4 h-4" /> Sample CSV
        </Button>
      </div>

      {/* Format guide */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> CSV Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-3 font-mono text-xs overflow-x-auto">
            <div className="text-primary font-semibold">name,email,phone,company,source</div>
            <div className="text-muted-foreground">John Smith,john@techcorp.com,9876543210,ABC Ltd,Website</div>
            <div className="text-muted-foreground">Emma Johnson,emma@xyz.com,9999999999,XYZ Ltd,Facebook</div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <strong>Required:</strong> name, email &nbsp;|&nbsp;
            <strong>Optional:</strong> phone, company, source &nbsp;|&nbsp;
            <strong>Max size:</strong> 5MB
          </p>
        </CardContent>
      </Card>

      {/* Drop Zone */}
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById("csv-input").click()}
      >
        <CardContent className="py-16 text-center">
          <input
            id="csv-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <FileText className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-green-600 dark:text-green-400">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB — Ready to upload</p>
              </div>
              <Button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                variant="outline" size="sm"
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Drop your CSV here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">Supports .csv files up to 5MB</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {file && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full gradient-primary text-white h-12 text-base"
        >
          {uploading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Importing leads...</>
          ) : (
            <><Upload className="w-5 h-5" /> Import {file.name}</>
          )}
        </Button>
      )}

      {/* Results */}
      {result && (
        <Card className={cn("border-2", result.summary.failed === 0 ? "border-green-500/30" : "border-orange-500/30")}>
          <CardHeader>
            <CardTitle className="text-base">Import Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{result.summary.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Rows</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{result.summary.imported}</p>
                <p className="text-xs text-muted-foreground mt-1">Imported</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{result.summary.failed}</p>
                <p className="text-xs text-muted-foreground mt-1">Failed</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-destructive mb-2 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Failed rows
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.map((e, i) => (
                    <div key={i} className="flex gap-2 text-xs p-2 rounded bg-destructive/5 border border-destructive/20">
                      <span className="font-medium text-destructive">Row {e.row}:</span>
                      <span className="text-muted-foreground">{e.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.summary.imported > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                {result.summary.imported} lead(s) successfully imported!
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
