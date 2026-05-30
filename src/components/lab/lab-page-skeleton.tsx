import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export function LabPageSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 3 } }} aria-busy="true" aria-label="Loading lab">
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2 }} />
      </Box>
      <Skeleton variant="rounded" height={360} sx={{ borderRadius: 2, mb: 3 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
      </Box>
    </Container>
  );
}
