import { getTranslations } from '@/lib/i18n/server';
import { SOCIAL_LINKS } from '@/lib/seo/constants';
import type { Locale } from '@/lib/types';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

const footerLinkSx = {
  color: 'text.secondary',
  fontSize: '0.875rem',
  textDecoration: 'none',
  '&:hover': { color: 'text.primary', textDecoration: 'underline' },
} as const;

export async function Footer({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);

  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        py: 4,
        mt: 6,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            {t.footer.copy}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0, alignItems: 'center' }}>
            <Link href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" sx={footerLinkSx} aria-label="GitHub">
              [github]
            </Link>
            <Box component="span" aria-hidden sx={{ color: 'text.disabled', px: 1.5, fontSize: '0.875rem' }}>
              ·
            </Box>
            <Link href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" sx={footerLinkSx} aria-label="LinkedIn">
              [linkedin]
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
