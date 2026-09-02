import { Head, usePage } from '@inertiajs/react';

interface SeoHeadProps {
    title?: string;
    description?: string;
    canonicalPath?: string;
    ogImage?: string;
    ogType?: string;
    noindex?: boolean;
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE_NAME = 'Aplayan - AI-Powered Job Search & Resume Tracker';
const DEFAULT_DESCRIPTION =
    'Aplayan analyzes your resume against real job descriptions, gives you an AI match score, reveals salary benchmarks with Philippine statutory tax computation — so you walk into every interview with confidence.';
const DEFAULT_OG_IMAGE = '/aplayan-logo-compressed.png';
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;
const OG_IMAGE_TYPE = 'image/png';
const OG_LOCALE = 'en_US';
const THEME_COLOR = '#042f2e';

export default function SeoHead({
    title,
    description = DEFAULT_DESCRIPTION,
    canonicalPath = '/',
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    noindex = false,
    jsonLd,
}: SeoHeadProps) {
    const { app_url: sharedAppUrl } = usePage<{ app_url?: string }>().props;
    const fullTitle = title
        ? `${title} | ${SITE_NAME}`
        : SITE_NAME;

    const baseUrl = (sharedAppUrl ?? window.location.origin).replace(/\/$/, '');
    const canonicalUrl = `${baseUrl}${canonicalPath}`;
    const ogImageUrl = ogImage.startsWith('http')
        ? ogImage
        : `${baseUrl}${ogImage}`;

    return (
        <Head>
            <title>{fullTitle}</title>
            <link rel="canonical" href={canonicalUrl} />

            <meta name="description" content={description} />

            {noindex && <meta name="robots" content="noindex, nofollow" />}

            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={ogImageUrl} />
            <meta property="og:image:secure_url" content={ogImageUrl} />
            <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
            <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
            <meta property="og:image:type" content={OG_IMAGE_TYPE} />
            <meta property="og:locale" content={OG_LOCALE} />
            <meta property="og:type" content={ogType} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImageUrl} />
            <meta name="twitter:site" content="@aplayan" />

            <meta name="theme-color" content={THEME_COLOR} />

            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Head>
    );
}
