import { resolveLocale, getTranslations } from '@/lib/i18n/server';
import { Github, Linkedin, Twitter } from 'lucide-react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

export async function Footer() {
  const locale = await resolveLocale();
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
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', '&:hover': { color: 'text.primary' } }}
              aria-label="Twitter"
            >
              <Twitter style={{ height: 20, width: 20 }} />
            </Link>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', '&:hover': { color: 'text.primary' } }}
              aria-label="GitHub"
            >
              <Github style={{ height: 20, width: 20 }} />
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', '&:hover': { color: 'text.primary' } }}
              aria-label="LinkedIn"
            >
              <Linkedin style={{ height: 20, width: 20 }} />
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
