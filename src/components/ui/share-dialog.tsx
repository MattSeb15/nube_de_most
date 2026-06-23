import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { Share2, Link as LinkIcon, Check, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  text?: string;
  url?: string;
}

export function ShareDialog({ isOpen, onOpenChange, title = "Compartir", text = "", url }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: text,
          url: shareUrl,
        });
        onOpenChange(false);
      } catch (err) {
        console.error('Error sharing natively:', err);
      }
    } else {
      alert("La función de compartir nativa no está disponible en este navegador.");
    }
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-[#25D366]">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      ),
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`
    },
    {
      name: 'X (Twitter)',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="size-6">
          <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
          <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`
    },
    {
      name: 'Facebook',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-[#1877F2]">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-[#0A66C2]">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      ),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 overflow-hidden shadow-2xl border-neutral-200 dark:border-neutral-800 rounded-3xl">
        <DialogHeader className="px-2 pt-2 min-w-0">
          <DialogTitle className="text-xl font-bold truncate pr-8" title={title}>{title}</DialogTitle>
          {text && <DialogDescription className="text-neutral-500 break-words line-clamp-2">{text}</DialogDescription>}
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4 min-w-0 w-full">
          <div className="flex flex-wrap items-start justify-center gap-4 sm:gap-6 w-full">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group"
                onClick={() => onOpenChange(false)}
              >
                <div className="flex items-center justify-center size-14 rounded-full bg-neutral-100 dark:bg-neutral-800 transition-transform group-hover:scale-110 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700">
                  {link.icon}
                </div>
                <span className="text-xs font-medium text-center text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">{link.name}</span>
              </a>
            ))}

            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="flex items-center justify-center size-14 rounded-full bg-neutral-100 dark:bg-neutral-800 transition-transform group-hover:scale-110 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700">
                  <MoreHorizontal className="size-6 text-neutral-700 dark:text-neutral-300" />
                </div>
                <span className="text-xs font-medium text-center text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">Más</span>
              </button>
            )}
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 min-w-0 w-full">
            <p className="text-sm font-semibold mb-3 text-neutral-700 dark:text-neutral-300">O copiar enlace</p>
            <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 w-full min-w-0">
              <div className="flex-1 min-w-0 truncate px-3 text-sm text-neutral-500 font-medium">
                {shareUrl}
              </div>
              <Button 
                onClick={handleCopy} 
                className={`rounded-lg transition-all shadow-none ${copied ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                size="sm"
              >
                {copied ? <Check className="size-4 mr-1" /> : <LinkIcon className="size-4 mr-1" />}
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
