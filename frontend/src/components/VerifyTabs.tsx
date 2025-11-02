//src/components/VerifyTabs.tsx
import { useState } from 'react';
import { FileText, Link as LinkIcon, Image, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface VerifyTabsProps {
  onSubmit: (data: {
    type: 'text' | 'link' | 'image';
    content: string | File;
  }) => void;
  isLoading?: boolean;
}

export const VerifyTabs = ({ onSubmit, isLoading }: VerifyTabsProps) => {
  const [textContent, setTextContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (type: 'text' | 'link' | 'image') => {
    switch (type) {
      case 'text':
        if (textContent.trim()) onSubmit({ type, content: textContent });
        break;
      case 'link':
        if (linkUrl.trim()) onSubmit({ type, content: linkUrl });
        break;
      case 'image':
        if (selectedFile) onSubmit({ type, content: selectedFile });
        break;
    }
  };

  return (
    <Card className="glass-surface-hover w-full max-w-4xl mx-auto">
      <CardContent className="p-8">
        <Tabs defaultValue="text" className="w-full">
          {/* Full width tabs with equal spacing */}
          <TabsList className="grid w-full grid-cols-3 glass-surface p-2 rounded-2xl gap-3">
            <TabsTrigger value="text" className="flex items-center justify-center space-x-2 rounded-xl py-3">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center justify-center space-x-2 rounded-xl py-3">
              <LinkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Link</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center justify-center space-x-2 rounded-xl py-3">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Image</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-8 space-y-6">
            <div>
              <label className="text-lg font-semibold text-text-primary block mb-3">
                Enter text to verify
              </label>
              <Textarea
                placeholder="Paste the news article, social media post, or any text content you want to fact-check..."
                className="min-h-[150px] glass-surface resize-none"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => handleSubmit('text')}
              disabled={!textContent.trim() || isLoading}
              className="btn-hero w-full"
            >
              {isLoading ? 'Analyzing...' : 'Verify Now'}
            </Button>
          </TabsContent>

          <TabsContent value="link" className="mt-8 space-y-6">
            <div>
              <label className="text-lg font-semibold text-text-primary block mb-3">
                Enter URL to verify
              </label>
              <Input
                type="url"
                placeholder="https://example.com/news-article"
                className="glass-surface h-12"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => handleSubmit('link')}
              disabled={!linkUrl.trim() || isLoading}
              className="btn-hero w-full"
            >
              {isLoading ? 'Analyzing...' : 'Verify Now'}
            </Button>
          </TabsContent>

          <TabsContent value="image" className="mt-8 space-y-6">
            <div>
              <label className="text-lg font-semibold text-text-primary block mb-3">
                Upload image to verify
              </label>
              <div
                className={`glass-surface border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  dragActive ? 'border-signal-info bg-signal-info/5' : 'border-text-muted/30'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Upload className="h-12 w-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-primary font-medium mb-2">
                  {selectedFile ? selectedFile.name : 'Drop image here or click to upload'}
                </p>
                <p className="text-text-muted text-sm">
                  Supports JPG, PNG, WebP up to 10MB
                </p>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <Button 
              onClick={() => handleSubmit('image')}
              disabled={!selectedFile || isLoading}
              className="btn-hero w-full"
            >
              {isLoading ? 'Analyzing...' : 'Verify Now'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};