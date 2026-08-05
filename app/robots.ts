import type { MetadataRoute } from "next"

const SITE_URL = "https://modealert.vercel.app"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/dashboard/",
        "/onboarding",
        "/signin",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
