'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { cn } from '@/lib/utils';

// Dynamic gradient that follows cursor
export function DynamicGradient({ className }: { className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 200 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 200 });
  const gradientBackground = useMotionTemplate`radial-gradient(600px circle at ${smoothMouseX}px ${smoothMouseY}px, rgba(59, 130, 246, 0.15), transparent 40%)`;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      mouseX.set(clientX);
      mouseY.set(clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className={cn('pointer-events-none fixed inset-0 opacity-30', className)}
      style={{ background: gradientBackground }}
    />
  );
}

// Grid overlay with depth
export function GridOverlay({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none fixed inset-0', className)}>
      {/* Main grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Accent grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59,130,246,0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />
    </div>
  );
}

// Glassmorphism card
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export function GlassCard({ children, className, intensity = 'medium' }: GlassCardProps) {
  const blurLevels = {
    low: 'backdrop-blur-sm',
    medium: 'backdrop-blur-md',
    high: 'backdrop-blur-lg',
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10',
        'bg-gradient-to-br from-white/5 to-white/[0.02]',
        blurLevels[intensity],
        'shadow-2xl shadow-black/20',
        className
      )}
    >
      {children}
    </div>
  );
}

// Animated border gradient
export function AnimatedBorderGradient({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('relative group', className)}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-lg opacity-75 group-hover:opacity-100 blur transition-all duration-1000 animate-pulse" />
      <div className="relative">{children}</div>
    </div>
  );
}

// Floating orbs background
export function FloatingOrbs({ count = 5 }: { count?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 300 + 100,
            height: Math.random() * 300 + 100,
            background: `radial-gradient(circle, ${
              ['rgba(59,130,246,0.1)', 'rgba(16,185,129,0.1)', 'rgba(139,92,246,0.1)'][i % 3]
            }, transparent)`,
            filter: 'blur(40px)',
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

// Micro-interaction: Button with ripple effect
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function RippleButton({ children, variant = 'primary', className, ...props }: RippleButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples(prev => [...prev, { x, y, id }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
    }

    props.onClick?.(e);
  };

  return (
    <button
      ref={buttonRef}
      className={cn(
        'relative overflow-hidden rounded-lg px-4 py-2 font-medium',
        'transition-all duration-200 active:scale-95',
        variants[variant],
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
          animate={{
            width: 500,
            height: 500,
            opacity: [0.5, 0],
          }}
          transition={{ duration: 0.6 }}
          initial={{ x: '-50%', y: '-50%' }}
        />
      ))}
      {children}
    </button>
  );
}

// Shimmer effect for loading states
export function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <motion.div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        }}
        animate={{
          translateX: ['−100%', '200%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

// Glow effect on hover
export function GlowOnHover({ children, className, color = 'emerald' }: { 
  children: React.ReactNode; 
  className?: string;
  color?: 'emerald' | 'blue' | 'purple' | 'red';
}) {
  const colors = {
    emerald: 'group-hover:shadow-emerald-500/50',
    blue: 'group-hover:shadow-blue-500/50',
    purple: 'group-hover:shadow-purple-500/50',
    red: 'group-hover:shadow-red-500/50',
  };

  return (
    <div className={cn('group transition-all duration-300', className)}>
      <div className={cn('shadow-lg', colors[color])}>
        {children}
      </div>
    </div>
  );
}

// Parallax effect
export function ParallaxContainer({ children, speed = 0.5 }: { children: React.ReactNode; speed?: number }) {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ transform: `translateY(${offsetY * speed}px)` }}>
      {children}
    </div>
  );
}
