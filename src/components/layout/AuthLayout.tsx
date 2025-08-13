// src/components/layout/AuthLayout.tsx
import type React from 'react';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6 overflow-hidden">
        <div className="futuristic-pattern">
            <svg className="texture-filter">
                <filter id="advanced-texture">
                <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.7"
                    numOctaves="3"
                    result="noise"
                ></feTurbulence>
                <feSpecularLighting
                    in="noise"
                    surfaceScale="2"
                    specularConstant="0.8"
                    specularExponent="20"
                    lighting-color="#fff"
                    result="specular"
                >
                    <fePointLight x="50" y="50" z="100"></fePointLight>
                </feSpecularLighting>
                <feComposite
                    in="specular"
                    in2="SourceGraphic"
                    operator="in"
                    result="litNoise"
                ></feComposite>
                <feBlend in="SourceGraphic" in2="litNoise" mode="overlay"></feBlend>
                </filter>
            </svg>
        </div>
      <div className="form w-full max-w-md z-10">
        <div id="heading" className="text-center mb-0">
          <h1 className="text-3xl sm:text-4xl font-headline font-bold text-white">{title}</h1>
          {description && <p className="text-muted-foreground mt-2 text-sm sm:text-base">{description}</p>}
        </div>
        <div>
          {children}
        </div>
        <p className="text-center text-muted-foreground text-xs mt-8">
          &copy; {new Date().getFullYear()} RoleAuthFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}
