'use client';

import { useState, useEffect } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Terminal, Activity, GaugeCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  activeTab: 'terminal' | 'cluster' | 'metrics' | 'chaos';
  onTabChange: (tab: 'terminal' | 'cluster' | 'metrics' | 'chaos') => void;
  className?: string;
}

export function BottomNavigation({ activeTab, onTabChange, className }: BottomNavigationProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Vibration feedback per touch
  const hapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // 10ms vibration
    }
  };

  const handleTabClick = (tab: typeof activeTab) => {
    hapticFeedback();
    onTabChange(tab);
  };

  if (!isMobile) return null;

  const tabs = [
    { id: 'terminal' as const, label: 'Terminal', icon: Terminal },
    { id: 'cluster' as const, label: 'Cluster', icon: Activity },
    { id: 'metrics' as const, label: 'Metrics', icon: GaugeCircle },
    { id: 'chaos' as const, label: 'Chaos', icon: Zap },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-black/90 backdrop-blur-lg border-t border-gray-800',
        'safe-area-inset-bottom',
        className
      )}
    >
      <div className="flex items-center justify-around px-2 py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center',
                'min-w-[64px] min-h-[48px]', // Touch target size
                'rounded-lg transition-all duration-200',
                'active:scale-95',
                isActive ? 'text-emerald-400' : 'text-gray-500'
              )}
            >
              <Icon 
                className={cn(
                  'h-6 w-6 mb-1 transition-transform',
                  isActive && 'scale-110'
                )} 
              />
              <span className={cn(
                'text-xs font-medium',
                isActive && 'font-semibold'
              )}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-400 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}

// Bottom sheet component per quick actions su mobile
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (isOpen) {
      controls.start({ y: 0 });
    } else {
      controls.start({ y: '100%' });
    }
  }, [isOpen, controls]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Se trascinato verso il basso oltre threshold, chiudi
    if (info.offset.y > 100) {
      onClose();
    } else {
      controls.start({ y: 0 });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black z-40"
      />

      {/* Bottom Sheet */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ y: '100%' }}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-gray-900 rounded-t-3xl',
          'max-h-[80vh] overflow-hidden',
          'shadow-2xl'
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
          <div className="max-h-[60vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </motion.div>
    </>
  );
}
