/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  // Server-side only environment variables
  readonly TURNSTILE_SECRET: string;
  readonly CONTACT_EMAIL: string;
  readonly CONTACT_PHONE?: string;
  readonly NODE_ENV: 'development' | 'production';
  
  // Public environment variables (accessible in browser)
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
  readonly PUBLIC_SITE_NAME: string;
  readonly PUBLIC_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
