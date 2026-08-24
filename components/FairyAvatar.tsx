'use client';

import React, { useState } from 'react';

interface FairyAvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWings?: boolean;
  showHalo?: boolean;
  className?: string;
}

export function FairyAvatar({
  name = 'User',
  avatarUrl,
  size = 'md',
  showWings = true,
  showHalo = true,
  className = '',
}: FairyAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Size configurations
  const sizeMap = {
    sm: {
      container: 'w-9 h-9',
      avatar: 'w-8 h-8 text-xs',
      haloTop: '-top-2.5',
      haloWidth: 'w-7 h-2',
      wingsScale: 'scale-[0.55] -top-2',
    },
    md: {
      container: 'w-12 h-12',
      avatar: 'w-10 h-10 text-sm',
      haloTop: '-top-3',
      haloWidth: 'w-9 h-2.5',
      wingsScale: 'scale-[0.75] -top-2',
    },
    lg: {
      container: 'w-20 h-20',
      avatar: 'w-16 h-16 text-xl',
      haloTop: '-top-4',
      haloWidth: 'w-14 h-3.5',
      wingsScale: 'scale-[1.15] -top-1',
    },
    xl: {
      container: 'w-28 h-28',
      avatar: 'w-24 h-24 text-3xl',
      haloTop: '-top-5',
      haloWidth: 'w-20 h-4.5',
      wingsScale: 'scale-[1.55] top-1',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const initial = (name || 'U').charAt(0).toUpperCase();

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${currentSize.container} ${className}`}
    >
      {/* Fairy Wings (SVG behind avatar) */}
      {showWings && (
        <div
          className={`absolute pointer-events-none z-0 transition-transform duration-500 ease-out ${currentSize.wingsScale}`}
        >
          <svg
            width="120"
            height="70"
            viewBox="0 0 120 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_0_8px_rgba(244,114,182,0.45)]"
          >
            {/* Left Fairy Wing */}
            <g opacity="0.88">
              {/* Upper Left Wing */}
              <path
                d="M50 38 C42 20, 15 5, 2 18 C-5 27, 12 48, 48 40 Z"
                fill="url(#wingGradientPink)"
                stroke="rgba(244, 114, 182, 0.7)"
                strokeWidth="1.2"
              />
              {/* Inner Left Feather Pattern */}
              <path
                d="M48 37 C38 24, 20 16, 12 24 C8 30, 22 42, 46 39 Z"
                fill="url(#wingGradientPurple)"
                opacity="0.6"
              />
              <path
                d="M49 39 C36 32, 22 28, 18 34 C16 38, 28 44, 47 40 Z"
                fill="url(#wingGradientGold)"
                opacity="0.5"
              />
              {/* Lower Left Wing */}
              <path
                d="M48 41 C36 48, 18 55, 12 63 C8 68, 26 69, 48 44 Z"
                fill="url(#wingGradientPurple)"
                stroke="rgba(192, 132, 252, 0.6)"
                strokeWidth="1"
              />
            </g>

            {/* Right Fairy Wing */}
            <g opacity="0.88">
              {/* Upper Right Wing */}
              <path
                d="M70 38 C78 20, 105 5, 118 18 C125 27, 108 48, 72 40 Z"
                fill="url(#wingGradientPink)"
                stroke="rgba(244, 114, 182, 0.7)"
                strokeWidth="1.2"
              />
              {/* Inner Right Feather Pattern */}
              <path
                d="M72 37 C82 24, 100 16, 108 24 C112 30, 98 42, 74 39 Z"
                fill="url(#wingGradientPurple)"
                opacity="0.6"
              />
              <path
                d="M71 39 C84 32, 98 28, 102 34 C104 38, 92 44, 73 40 Z"
                fill="url(#wingGradientGold)"
                opacity="0.5"
              />
              {/* Lower Right Wing */}
              <path
                d="M72 41 C84 48, 102 55, 108 63 C112 68, 94 69, 72 44 Z"
                fill="url(#wingGradientPurple)"
                stroke="rgba(192, 132, 252, 0.6)"
                strokeWidth="1"
              />
            </g>

            {/* Gradients */}
            <defs>
              <linearGradient id="wingGradientPink" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F472B6" stopOpacity="0.75" />
                <stop offset="60%" stopColor="#C084FC" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.25" />
              </linearGradient>
              <linearGradient id="wingGradientPurple" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#C084FC" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#F472B6" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="wingGradientGold" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#F472B6" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* Floating Glowing Halo Overlay */}
      {showHalo && (
        <div
          className={`absolute ${currentSize.haloTop} ${currentSize.haloWidth} z-20 flex items-center justify-center pointer-events-none animate-pulse`}
          style={{ animationDuration: '2.5s' }}
        >
          {/* Halo Ring */}
          <div className="w-full h-full rounded-full border-[1.5px] border-[#FBBF24] shadow-[0_0_8px_#FBBF24,0_0_14px_rgba(244,114,182,0.6)] bg-gradient-to-r from-[#FBBF24]/30 via-[#F472B6]/20 to-[#FBBF24]/30 rotate-[-4deg]" />
          {/* Sparkle Glint */}
          <span className="absolute -top-1.5 -right-1 text-[8px] text-[#FBBF24] select-none">
            ✨
          </span>
        </div>
      )}

      {/* Avatar Circular Frame */}
      <div
        className={`relative z-10 rounded-full overflow-hidden flex items-center justify-center font-bold text-on-primary bg-gradient-to-tr from-[#620040] via-[#F472B6] to-[#C084FC] p-[1.5px] shadow-[0_0_12px_rgba(244,114,182,0.35)] ${currentSize.avatar}`}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center">
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt={name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-primary font-extrabold">{initial}</span>
          )}
        </div>
      </div>
    </div>
  );
}
