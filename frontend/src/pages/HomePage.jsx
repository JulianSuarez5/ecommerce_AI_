import { useState, useEffect, useMemo } from 'react';
import { productService } from '../services/productService';
import SplineRobotIntro from '../components/ui/SplineRobotIntro';
import { FlashDealsGrid, TrustBadges, StatsBand, BentoCategories, FeaturedSection, OffersSection, WhySection, OfferBanners, Newsletter, FooterSection } from '../components/home';

export default function HomePage() {
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      try {
        const data = await productService.getAll({ size: 20, sort: 'nuevo' }, { signal: controller.signal });
        if (!cancelled) {
          const items = data?.content || (Array.isArray(data) ? data : null);
          if (items && items.length > 0) setFeatured(items);
        }
      } catch (err) {
        if (!cancelled && err?.name !== 'CanceledError') console.debug(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; controller.abort(); };
  }, []);

  const displayFeatured = useMemo(() => (featured || []).slice(0, 8), [featured]);
  const displayOffers = useMemo(() => (featured || []).filter(p => p.precioOferta).slice(0, 4), [featured]);

  return (
    <>
      <SplineRobotIntro />
      <div style={{ background: 'var(--bg-primary, transparent)' }}>
        <FlashDealsGrid />
        <TrustBadges />
        <StatsBand />
        <BentoCategories />
        <FeaturedSection products={displayFeatured} loading={loading} />
        <OffersSection products={displayOffers} />
        <WhySection />
        <OfferBanners />
        <Newsletter />
        <FooterSection />
      </div>
    </>
  );
}
