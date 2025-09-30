import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description: string;
  image?: string;
}

const DEFAULT_IMAGE = "https://trvlsync.example/assets/social-cover.png";
const SITE_NAME = "Trvlsync";

export function Seo({ title, description, image }: SeoProps) {
  const safeTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const metaDescription = description ?? "Discover curated travel experiences with Trvlsync.";
  const metaImage = image ?? DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{safeTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={safeTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={safeTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
}
