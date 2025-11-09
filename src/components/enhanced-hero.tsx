'use client';

import { motion } from 'framer-motion';
import { Terminal, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HeroCTAButton } from '@/components/shared/hero-cta-button';

interface EnhancedHeroProps {
  title: string;
  subtitle: string;
  ctaPortfolio: string;
  ctaContact: string;
}

export function EnhancedHero({ title, subtitle, ctaPortfolio, ctaContact }: EnhancedHeroProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section
      id="hero"
      className="relative py-32 md:py-40 overflow-hidden rounded-3xl border border-white/5 bg-[var(--bg-primary)] text-[var(--text-primary-soft)] shadow-[var(--glow-soft)]"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--neon-accent)]/15 via-transparent to-[#00b4d8]/10 animate-pulse-slow" />
      
      {/* Interactive light effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
        }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Senior DevOps Engineer</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-headline text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <HeroCTAButton href="/portfolio" variant="primary">
            {ctaPortfolio}
          </HeroCTAButton>

          <HeroCTAButton href="/lab" variant="secondary" icon={Terminal}>
            Explore Lab
          </HeroCTAButton>

          <HeroCTAButton href="#contact" variant="outline">
            {ctaContact}
          </HeroCTAButton>
        </motion.div>

        {/* Floating particles */}
        {isClient && (
          <div className="absolute inset-0 -z-10 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full"
                initial={{
                  x: Math.random() * 1200,
                  y: Math.random() * 600,
                }}
                animate={{
                  y: [null, Math.random() * 600],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
