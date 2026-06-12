import Image from 'next/image';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Locale } from '@/lib/types';

interface ProfileAvatarProps {
  locale: Locale;
  name: string;
  role: string;
  className?: string;
}

export function ProfileAvatar({ locale, name, role, className }: ProfileAvatarProps) {
  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        gap: 3,
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 120,
          height: 120,
          flexShrink: 0,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '3px solid',
          borderColor: 'primary.main',
          boxShadow: '0 0 24px rgba(0, 217, 255, 0.25)',
        }}
      >
        <Image
          src="/thomas-vignoli.png"
          alt={name}
          fill
          sizes="120px"
          style={{ objectFit: 'cover' }}
          priority
        />
      </Box>
      <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'var(--font-headline)' }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {role}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {locale === 'it'
            ? 'Disponibile per progetti cloud, piattaforme Kubernetes e automazione CI/CD.'
            : 'Available for cloud projects, Kubernetes platforms, and CI/CD automation.'}
        </Typography>
      </Box>
    </Box>
  );
}
