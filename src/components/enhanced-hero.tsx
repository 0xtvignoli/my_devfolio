'use client';

import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Terminal, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HeroCTAButton } from '@/components/shared/hero-cta-button';

interface EnhancedHeroProps {
  title: string;
  subtitle: string;
  ctaPortfolio: string;
  ctaContact: string;
}

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateRandomString = (length: number) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export function EnhancedHero({ title, subtitle, ctaPortfolio, ctaContact }: EnhancedHeroProps) {
  const [isClient, setIsClient] = useState(false);
  const [randomString, setRandomString] = useState("");
  
  // Motion values per l'effetto hover evervault
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    setIsClient(true);
    setRandomString(generateRandomString(1500));
  }, []);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLElement>) {
    let { left, top } = currentTarget.getBoundingClientRect();
    const relativeX = clientX - left;
    const relativeY = clientY - top;
    
    mouseX.set(relativeX);
    mouseY.set(relativeY);
    
    // Rigenera stringa ad ogni movimento del mouse
    setRandomString(generateRandomString(1500));
  }

  // Mask per l'effetto evervault hover
  const maskImage = useMotionTemplate`radial-gradient(350px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const evervaultStyle = { maskImage, WebkitMaskImage: maskImage };

  return (
    <section
      id="hero"
      onMouseMove={onMouseMove}
      className="group/hero relative py-32 md:py-40 overflow-hidden rounded-3xl border border-border/50 dark:border-white/5 bg-[var(--bg-primary)] dark:bg-[#010b10] text-[var(--text-primary-soft)] dark:text-[#0dfd88] shadow-[var(--glow-soft)]"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--neon-accent)]/15 via-transparent to-[#00b4d8]/10 animate-pulse-slow" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Evervault hover effect - gradient overlay */}
      <motion.div
        className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 to-purple-600 opacity-0 group-hover/hero:opacity-20 backdrop-blur-xl transition-opacity duration-500 pointer-events-none"
        style={evervaultStyle}
      />

      {/* Evervault hover effect - random string pattern */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 mix-blend-overlay group-hover/hero:opacity-30 pointer-events-none"
        style={evervaultStyle}
      >
        <p className="absolute inset-x-0 text-xs h-full break-words whitespace-pre-wrap text-foreground font-mono font-bold transition-opacity duration-500">
          {randomString}
        </p>
      </motion.div>

      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/10 border border-primary/20 dark:border-primary/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Senior DevOps Engineer</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-headline text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/80 dark:from-foreground dark:via-foreground dark:to-foreground/70"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground dark:text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
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
