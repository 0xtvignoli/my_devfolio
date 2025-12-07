'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, ExternalLink, Copy, Play, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CodeSandboxEmbedProps {
  sandboxId: string;
  title: string;
  description?: string;
  variant?: 'compact' | 'full' | 'preview';
  className?: string;
  height?: string;
}

export function CodeSandboxEmbed({ 
  sandboxId, 
  title, 
  description,
  variant = 'compact',
  className,
  height = '600px'
}: CodeSandboxEmbedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // CodeSandbox supports both /s/ID and /p/sandbox/ID formats
  // Extract clean ID from either format
  const extractSandboxId = (id: string): string => {
    // If it's already just an ID (no slashes), return it
    if (!id.includes('/')) return id;
    // Extract from /p/sandbox/ID or /s/ID format
    const match = id.match(/(?:p\/sandbox\/|s\/)([^/?]+)/);
    return match ? match[1] : id.split('/').pop() || id;
  };
  
  const cleanSandboxId = extractSandboxId(sandboxId);
  // Support both embed formats: /embed/ID and /p/sandbox/ID?embed=1
  const embedUrl = `https://codesandbox.io/embed/${cleanSandboxId}?view=split&hidenavigation=1&theme=dark`;
  const sandboxUrl = `https://codesandbox.io/s/${cleanSandboxId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sandboxUrl);
    toast({
      title: 'Link copied!',
      description: 'CodeSandbox link copied to clipboard',
    });
  };

  const handleOpenExternal = () => {
    window.open(sandboxUrl, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'preview') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative rounded-lg border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm p-4 shadow-lg shadow-cyan-500/10",
          className
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-cyan-400" aria-hidden="true" />
            <h4 className="font-semibold text-cyan-300">{title}</h4>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsExpanded(true)}
            className="border-cyan-500/40 hover:bg-cyan-500/10"
            aria-label={`Open ${title} in CodeSandbox`}
          >
            <Play className="h-3 w-3 mr-1" aria-hidden="true" />
            Open
          </Button>
        </div>
        {description && (
          <p className="text-xs text-slate-400 mb-3">{description}</p>
        )}
        <div className="aspect-video rounded border border-cyan-500/20 bg-slate-950 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                <span className="text-xs text-slate-400">Loading CodeSandbox...</span>
              </div>
            </div>
          )}
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; wake-lock"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            onLoad={() => setIsLoading(false)}
            title={title}
            aria-label={`CodeSandbox embed: ${title}`}
          />
        </div>
      </motion.div>
    );
  }

  if (variant === 'full' || isExpanded) {
    return (
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setIsExpanded(false)}
            />
            
            {/* Full screen modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-8 z-50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-lg border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-sm border-b border-cyan-500/30">
                <div className="flex items-center gap-3">
                  <Code2 className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-cyan-300">{title}</h3>
                    {description && (
                      <p className="text-xs text-slate-400">{description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyLink}
                    className="text-slate-400 hover:text-cyan-400"
                    aria-label="Copy CodeSandbox link"
                  >
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleOpenExternal}
                    className="text-slate-400 hover:text-cyan-400"
                    aria-label="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsExpanded(false)}
                    className="text-slate-400 hover:text-cyan-400"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* Iframe */}
              <div className="flex-1 relative bg-slate-950">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-10">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                      <span className="text-sm text-slate-400">Loading CodeSandbox...</span>
                    </div>
                  </div>
                )}
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; wake-lock"
                  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                  onLoad={() => setIsLoading(false)}
                  title={title}
                  aria-label={`CodeSandbox embed: ${title}`}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Compact variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-lg border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm shadow-lg shadow-cyan-500/10 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-sm border-b border-cyan-500/30">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-cyan-400" aria-hidden="true" />
          <h4 className="font-semibold text-cyan-300 text-sm">{title}</h4>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(true)}
            className="h-7 px-2 text-slate-400 hover:text-cyan-400"
            aria-label="Expand CodeSandbox"
          >
            <Maximize2 className="h-3 w-3" aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleOpenExternal}
            className="h-7 px-2 text-slate-400 hover:text-cyan-400"
            aria-label="Open in new tab"
          >
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Iframe */}
      <div className="relative bg-slate-950" style={{ height }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              <span className="text-xs text-slate-400">Loading...</span>
            </div>
          </div>
        )}
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; wake-lock"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
          onLoad={() => setIsLoading(false)}
          title={title}
          aria-label={`CodeSandbox embed: ${title}`}
        />
      </div>
    </motion.div>
  );
}

