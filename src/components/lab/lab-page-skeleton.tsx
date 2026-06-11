import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export function LabPageSkeleton() {
  return (
    <Box className="lab-md3-theme" sx={{ bgcolor: 'var(--md-sys-color-surface)' }}>
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 3 } }} aria-busy="true" aria-label="Loading lab">
        <Skeleton variant="rounded" height={160} sx={{ borderRadius: 'var(--lab-radius-xl)', mb: 3 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' }, gap: 3, mb: 3 }}>
          <Skeleton variant="rounded" height={420} sx={{ borderRadius: 'var(--lab-radius-lg)' }} />
          <Skeleton variant="rounded" height={420} sx={{ borderRadius: 'var(--lab-radius-lg)' }} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          <Skeleton variant="rounded" height={140} sx={{ borderRadius: 'var(--lab-radius-md)' }} />
          <Skeleton variant="rounded" height={140} sx={{ borderRadius: 'var(--lab-radius-md)' }} />
          <Skeleton variant="rounded" height={140} sx={{ borderRadius: 'var(--lab-radius-md)' }} />
          <Skeleton variant="rounded" height={140} sx={{ borderRadius: 'var(--lab-radius-md)' }} />
        </Box>
        <Skeleton variant="rounded" height={280} sx={{ borderRadius: 'var(--lab-radius-lg)' }} />
      </Container>
    </Box>
  );
}
