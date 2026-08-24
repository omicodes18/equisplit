'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Trip } from '@/lib/types';
import { triggerConfetti } from '@/lib/utils';
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  Sparkles,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

export function InviteModal({ isOpen, onClose, trip }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/trip/${trip.id}`);
    }
  }, [trip.id]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      triggerConfetti();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${trip.name} on Nocturne Ledger`,
          text: `Join "${trip.name}" ${trip.emoji} to split trip expenses frictionlessly!`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share canceled or failed:', err);
      }
    } else {
      handleCopy();
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Join "${trip.name}" ${trip.emoji} on Nocturne Ledger to split bills instantly (no signup needed): ${shareUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-variant/95 backdrop-blur-2xl rounded-t-[32px] sm:rounded-[32px] shadow-[0_-8px_32px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-surface-container/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Share2 size={16} />
            </div>
            <div>
              <h2 className="font-bold text-base text-on-surface flex items-center gap-1.5">
                <span>Invite Friends</span>
                <span className="text-sm">{trip.emoji}</span>
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-on-surface-variant rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-transform"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 flex flex-col items-center text-center">
          {/* Trip Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/20 border border-secondary-fixed/20">
            <span className="text-sm">{trip.emoji}</span>
            <span className="text-xs font-semibold text-secondary-fixed-dim">
              {trip.name} • {trip.members.length} Members
            </span>
          </div>

          {/* Frictionless Info */}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container-lowest/60 border border-white/5 px-3.5 py-2 rounded-xl max-w-xs">
            <Sparkles size={16} className="text-tertiary shrink-0" />
            <span className="text-left">
              <strong>Zero-Signup:</strong> Friends can open the link in any browser on their phone to join instantly.
            </span>
          </div>

          {/* Rendered QR Code Frame */}
          <div className="flex flex-col items-center">
            <div className="p-4 bg-white rounded-3xl shadow-[0_0_25px_rgba(251,191,36,0.25)] border-2 border-[#FBBF24]/50 relative group">
              <QRCodeSVG
                value={shareUrl || 'https://equisplit.app'}
                size={180}
                bgColor="#ffffff"
                fgColor="#091E15"
                level="Q"
                includeMargin={false}
              />
              <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 pointer-events-none" />
            </div>
            <span className="text-[11px] font-medium text-on-surface-variant mt-2.5 flex items-center gap-1">
              <QrCode size={13} className="text-primary" />
              <span>Scan with phone camera to join</span>
            </span>
          </div>

          {/* Link Copy Box */}
          <div className="w-full space-y-2">
            <div className="relative flex items-center p-1.5 rounded-2xl bg-surface-container-lowest border border-white/10 focus-within:border-primary/50 transition-colors">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent px-3 text-xs text-on-surface truncate focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  copied
                    ? 'bg-primary text-on-primary shadow-[0_0_12px_rgba(244,114,182,0.4)]'
                    : 'bg-primary/20 hover:bg-primary/30 text-primary active:scale-95'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    <span>Copied! ✨</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Sharing Channels */}
          <div className="w-full grid grid-cols-2 gap-2.5 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-xl bg-secondary/15 hover:bg-secondary/25 border border-secondary/30 text-secondary text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <ExternalLink size={15} />
              <span>Share App...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
