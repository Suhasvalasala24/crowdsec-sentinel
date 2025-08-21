import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, Share2, ArrowRight, FileText } from "lucide-react";
import { useRules, Rule } from "@/hooks/useRules";

const CommunityRules = () => {
  const { rules, loading, uploadRule, downloadRule } = useRules();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showAllRules, setShowAllRules] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    rule_content: "",
    rule_type: "",
    severity: "",
    tags: ""
  });

  const handleUpload = async () => {
    try {
      await uploadRule({
        title: uploadForm.title,
        description: uploadForm.description,
        rule_content: uploadForm.rule_content,
        rule_type: uploadForm.rule_type,
        severity: uploadForm.severity,
        tags: uploadForm.tags ? uploadForm.tags.split(",").map(t => t.trim()) : []
      });
      setUploadForm({ title: "", description: "", rule_content: "", rule_type: "", severity: "", tags: "" });
      setIsUploadOpen(false);
    } catch (error) {
      // handled in hook
    }
  };

  const handleDownload = async (ruleId: string) => {
    await downloadRule(ruleId);
  };

  const displayedRules: Rule[] = showAllRules ? rules : rules.slice(0, 3);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Share2 className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-semibold text-foreground">Community Rule-Sharing</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Upload, download, and share detection rules with the community
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Upload Rules */}
          <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-secondary/30 border border-border/50">
            <Upload className="h-8 w-8 text-primary" />
            <h3 className="font-medium text-foreground">Upload Rules</h3>
            <p className="text-xs text-muted-foreground text-center">Share your custom detection rules</p>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">Upload</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Detection Rule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Rule Title</Label>
                    <Input
                      id="title"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="SSH Brute Force Detection"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detects repeated failed SSH login attempts"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rule_type">Rule Type</Label>
                    <Select value={uploadForm.rule_type} onValueChange={(v) => setUploadForm(prev => ({ ...prev, rule_type: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rule type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crowdsec">CrowdSec</SelectItem>
                        <SelectItem value="suricata">Suricata</SelectItem>
                        <SelectItem value="snort">Snort</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select value={uploadForm.severity} onValueChange={(v) => setUploadForm(prev => ({ ...prev, severity: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rule_content">Rule Content</Label>
                    <Textarea
                      id="rule_content"
                      value={uploadForm.rule_content}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, rule_content: e.target.value }))}
                      placeholder="Paste your rule content here..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="ssh, bruteforce, authentication"
                    />
                  </div>
                  <Button onClick={handleUpload} className="w-full">Upload Rule</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Download Rules */}
          <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-secondary/30 border border-border/50">
            <Download className="h-8 w-8 text-primary" />
            <h3 className="font-medium text-foreground">Download Rules</h3>
            <p className="text-xs text-muted-foreground text-center">Get community-curated rules</p>
            <Button size="sm" variant="outline" onClick={() => setShowAllRules(!showAllRules)}>
              {showAllRules ? 'Show Less' : 'Browse'}
            </Button>
          </div>

          {/* Share Detection */}
          <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-secondary/30 border border-border/50">
            <Share2 className="h-8 w-8 text-primary" />
            <h3 className="font-medium text-foreground">Share Detection</h3>
            <p className="text-xs text-muted-foreground text-center">Contribute to threat intelligence</p>
            <Button size="sm" variant="outline" onClick={() => setIsUploadOpen(true)}>Share</Button>
          </div>
        </div>

        {/* Rule List */}
        {(showAllRules || displayedRules.length > 0) && (
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="font-medium text-foreground">Available Rules</h4>
            {loading ? (
              <div className="text-center text-muted-foreground">Loading rules...</div>
            ) : displayedRules.length === 0 ? (
              <div className="text-center text-muted-foreground">No rules available</div>
            ) : (
              displayedRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/30">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <h5 className="text-sm font-medium text-foreground">{rule.title}</h5>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">{rule.rule_type}</Badge>
                        <Badge variant="outline" className="text-xs">{rule.severity}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          {rule.downloads_count}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDownload(rule.id)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        {!showAllRules && rules.length > 3 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Browse community content</span>
            <Button variant="ghost" size="sm" onClick={() => setShowAllRules(true)}>
              View All ({rules.length}) <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityRules;
