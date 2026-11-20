# Park City and Salt Lake City service-area update

## Confirmed scope

Park City is the primary market; Salt Lake City and surrounding areas are also served. Do not state or imply where Chef Luis lives. Remove former Nevada/Tahoe marketing coverage. Keep private dinners, vacation-rental meals, cooking classes, and buffet events. Do not invent booking constraints, neighborhood coverage, reviews, or a business address.

Keep the homepage as the primary local landing page and retain /service-areas. No new competing city pages or redirects are needed. Google Business Profile setup is separate from this PR; check for an existing listing first and use a legitimate service-area profile with a hidden residential address if applicable.

## Pre-change Search Console baseline

Owner-supplied screenshots reviewed November 20, 2026, with the 3-month selector and Web (text) search type. Exact date bounds were not exported.

- Site: 9 clicks, 136 impressions, 6.6% CTR, average position 7.1.
- /service-areas: 2 clicks, 26 impressions, 7.7% CTR, average position 11.6.
- Disclosed service-area query: private chefs reno, 2 impressions, 0 clicks, average position 69.5.
- Other query identities are unavailable; do not infer branded traffic or AI-answer inclusion from this evidence.
- These observations are a baseline, not causal proof that prior SEO changes generated leads.

## Release verification and measurement

After deployment, inspect homepage, /service-areas, /about and /how-it-works HTML: one title and description, production canonical without query parameters, no accidental noindex, accurate location copy. Confirm service-area JSON-LD names Park City and Salt Lake City with no residential address. Verify sitemap inclusion, robots access, mobile layout and menu/request links.

Booking query parameters remain functional; canonical URLs omit them. Existing product noindex behavior and sitemap exclusions remain unchanged. This PR does not change payment or booking logic.

Record release date and verify Google-selected canonicals in URL Inspection. Compare successive 28-day windows after recrawl, separating Park City/Salt Lake City non-brand queries from branded searches. Track inquiries independently; GSC clicks are not leads. Do not claim conversion tracking or Google Business Profile setup is delivered by this PR.
