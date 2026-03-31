This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Analytics (GA4)

1. Copy [`.env.example`](.env.example) to `.env.local` and set **`NEXT_PUBLIC_GA_MEASUREMENT_ID`** to your GA4 web stream ID (`G-XXXXXXXXXX`). If unset, Google Analytics is not loaded.
2. The app sends **`begin_checkout`** when Razorpay opens and **`purchase`** after payment verification succeeds (transaction id, value in INR, line items).
3. In **GA4**: Admin → **Data display** → **Events** — mark **`purchase`** as a **Key event** (conversion) if you use it as your primary goal.
4. **Google Ads**: Admin → **Product links** → **Google Ads links** — link your Ads account. In Google Ads, **Goals** → **Conversions** → import the GA4 **`purchase`** key event (or other key events you define).
5. Verify with GA4 **Realtime** / **DebugView** after deploy.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
