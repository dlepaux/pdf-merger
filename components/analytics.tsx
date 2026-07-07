import Script from 'next/script'

// Google Analytics 4 — page views only, and cookieless (`client_storage:
// 'none'`) so no consent banner is required. Loads only when NEXT_PUBLIC_GA_ID
// is set at build time, so local dev and forks/self-hosters report nothing
// unless they configure their own property. The user's PDFs are never touched
// by analytics — only page-visit events are sent.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export function Analytics() {
  if (!GA_ID) return null
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { client_storage: 'none', anonymize_ip: true });
        `}
      </Script>
    </>
  )
}
