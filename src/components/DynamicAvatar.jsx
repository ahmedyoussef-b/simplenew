// components/DynamicAvatar.jsx
'use client';
import Image from 'next/image';
import React from 'react';
import { cn } from "@/lib/utils";

/**
 * A component to display a user's avatar, falling back to a generated one from DiceBear.
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
  
  // If a valid imageUrl is provided, use it.
  // Otherwise, construct the fallback URL to DiceBear's avataaars API.
  const finalImageUrl = imageUrl 
    ? imageUrl 
    : `https://api.dicebear.com/8.x/avataaars/svg?seed=${seed}`;

  return (
    <Image
      src={finalImageUrl}
      alt={alt}
      fill
      sizes="(max-width: 768px) 50vw, 33vw"
      className={cn('object-cover', className)}
      priority={isLCP}
    />
  );
}

export default DynamicAvatar;
