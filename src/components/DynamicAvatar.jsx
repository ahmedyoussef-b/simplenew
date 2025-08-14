// components/DynamicAvatar.jsx
'use client';
import Image from 'next/image';
import React from 'react';
import { cn } from "@/lib/utils";

/**
 * A component to display a user's avatar, falling back to a generated one.
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
  const [error, setError] = React.useState(false);

  // If a valid imageUrl is provided and hasn't failed, use it.
  // Otherwise, construct the fallback URL using our API route.
  const finalImageUrl = imageUrl && !error 
    ? imageUrl 
    : `/api/avatar?seed=${seed}`;

  return (
    <Image
      src={finalImageUrl}
      alt={alt}
      fill
      sizes="(max-width: 768px) 50vw, 33vw"
      className={cn('object-cover', className)}
      priority={isLCP}
      onError={() => {
        // If the provided imageUrl fails, we set an error state
        // to trigger a re-render with the fallback API URL.
        if (imageUrl) { // Only set error if it was a custom URL that failed
          setError(true);
        }
      }}
    />
  );
}

export default DynamicAvatar;
