import { en } from '@/data/locales/en';
import { OG_SIZE, renderCard } from '@/lib/og-card';

export const alt = 'Thomas Vignoli — Tech Lead, DevOps & Cloud';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return renderCard({ kicker: en.home.kicker, title: en.home.headline, footer: 'Thomas Vignoli' });
}
