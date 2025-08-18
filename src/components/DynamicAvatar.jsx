// components/DynamicAvatar.jsx
'use client';
import Image from 'next/image';
import React from 'react';
import { cn } from "@/lib/utils";

/**
 * A component to display a user's avatar, falling back to a placeholder image.
 * @param {{
 *  seed?: string;
 *  imageUrl?: string | null;
 *  alt?: string;
 *  className?: string;
 *  isLCP?: boolean;
 * }} props
 */
const DynamicAvatar = ({ 
  seed = 'default-seed', 
  imageUrl = null, 
  alt = "User avatar", 
  className = '', 
  isLCP = false 
}) => {
  
  const finalImageUrl = imageUrl || `https://placehold.co/128x128.png`;
  const hint = imageUrl ? {} : { 'data-ai-hint': 'forest sun' };

  return (
    <Image
      src={finalImageUrl}
      alt={alt}
      fill
      sizes="(max-width: 768px) 50vw, 33vw"
      className={cn('object-top object-top', className)}
      priority={isLCP}
      {...hint}
    />
  );
}

export default DynamicAvatar;
