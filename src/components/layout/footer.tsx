import { getTranslations } from '@/lib/i18n/server';
import { GithubIcon, LinkedinIcon } from '@/components/icons/brand-icons';
import { SOCIAL_LINKS } from '@/lib/seo/constants';
import type { Locale } from '@/lib/types';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

export async function Footer({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);

  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t.footer.copy}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', '&:hover': { color: 'text.primary' } }}
              aria-label="GitHub"
            >
              <GithubIcon width={20} height={20} />
            </Link>
            <Link
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', '&:hover': { color: 'text.primary' } }}
              aria-label="LinkedIn"
            >
              <LinkedinIcon width={20} height={20} />
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
