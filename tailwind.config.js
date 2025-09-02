/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      typography: {
        purple: {
          css: {
            '--tw-prose-body': 'rgb(75 85 99)',
            '--tw-prose-headings': 'rgb(17 24 39)',
            '--tw-prose-lead': 'rgb(75 85 99)',
            '--tw-prose-links': 'rgb(147 51 234)',
            '--tw-prose-bold': 'rgb(17 24 39)',
            '--tw-prose-counters': 'rgb(107 114 128)',
            '--tw-prose-bullets': 'rgb(209 213 219)',
            '--tw-prose-hr': 'rgb(229 231 235)',
            '--tw-prose-quotes': 'rgb(17 24 39)',
            '--tw-prose-quote-borders': 'rgb(229 231 235)',
            '--tw-prose-captions': 'rgb(107 114 128)',
            '--tw-prose-code': 'rgb(147 51 234)',
            '--tw-prose-pre-code': 'rgb(229 231 235)',
            '--tw-prose-pre-bg': 'rgb(31 41 55)',
            '--tw-prose-th-borders': 'rgb(209 213 219)',
            '--tw-prose-td-borders': 'rgb(229 231 235)',
            '--tw-prose-invert-body': 'rgb(209 213 219)',
            '--tw-prose-invert-headings': 'rgb(255 255 255)',
            '--tw-prose-invert-lead': 'rgb(156 163 175)',
            '--tw-prose-invert-links': 'rgb(196 181 253)',
            '--tw-prose-invert-bold': 'rgb(255 255 255)',
            '--tw-prose-invert-counters': 'rgb(156 163 175)',
            '--tw-prose-invert-bullets': 'rgb(75 85 99)',
            '--tw-prose-invert-hr': 'rgb(55 65 81)',
            '--tw-prose-invert-quotes': 'rgb(243 244 246)',
            '--tw-prose-invert-quote-borders': 'rgb(55 65 81)',
            '--tw-prose-invert-captions': 'rgb(156 163 175)',
            '--tw-prose-invert-code': 'rgb(196 181 253)',
            '--tw-prose-invert-pre-code': 'rgb(209 213 219)',
            '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
            '--tw-prose-invert-th-borders': 'rgb(75 85 99)',
            '--tw-prose-invert-td-borders': 'rgb(55 65 81)',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

