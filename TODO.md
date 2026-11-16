# Before launch: what you need to fill in

`grep -rn "TODO" content/` lists every placeholder still in the content. This file groups them and adds the ones a
search cannot find.

## 1. Site settings (`content/site.json`)

- [ ] `url`: your real domain. The sitemap, canonical tags and share images are built from it.
- [ ] `email`: the address shown in the footer and used as the contact fallback.
- [ ] `calendlyUrl`: your Calendly (or Cal.com) booking link. Until it is set, the contact page shows a placeholder box.
- [ ] `formEndpoint`: a form backend URL (Formspree, Web3Forms or your own n8n webhook). Until it is set, the contact
      form tells visitors it is not connected and offers email instead. It never pretends to send.
- [ ] `social`: your LinkedIn and GitHub links, or delete the entries you do not want.

## 2. Mock proof to replace with real results

Everything below is invented and carries `"sample": true`, which shows a "Sample" marker on the page. Replace the
content, then remove the flag. Do not remove the flag from an item that is still made up.

- [ ] `content/testimonials.json`: 6 sample quotes with fictional names. Replace with real, approved client quotes.
- [ ] `content/case-studies.json`: 4 sample case studies (one per industry). Replace the client descriptions, problem,
      solution, results, costs and quote with real projects.
- [ ] Case study metrics: every number in `results`, the before/after rows and the payback ledger is illustrative.
- [ ] Case study screenshots: each `screens` entry is an HTML mock-up with an owner note
      `TODO: replace with real screenshots`. Add real, redacted screenshots to `public/assets/img/work/`.
- [ ] `content/portfolio.json`: 12 sample projects. Replace with real ones or cut the list down.
- [ ] `content/industries.json`: each industry's "What it should be worth" ledger is a worked example from stated
      assumptions. Replace with your own numbers once you have them.
- [ ] `content/home.json`: the four example runs in the hero use illustrative names and times.
- [ ] The footer line from `sampleNotice` in `content/site.json`: remove it once no sample content is left.

## 3. Prices (`content/pricing.json`)

- [ ] Confirm `setupFee` and `monthly` on each tier. They are placeholders inside a typical market range.
- [ ] Confirm the payment split in the process steps, the notice period, and the hours of small changes per plan.
- [ ] Check the pricing FAQ and "what is not included" against how you really bill.

## 4. About page (`content/about.json`)

- [ ] Founder photo: replace `public/assets/img/founder-placeholder.svg` and the `TODO: real photo` note.
- [ ] Founder story: two visible TODO notes ask for your real background and why you started. No biography facts were
      invented, so the page reads thin until you add them.
- [ ] Time-zone overlap table: every row is flagged `TODO: confirm`. Check the hours against your working day and
      daylight saving.
- [ ] The response time you commit to for urgent faults.

## 5. Contact page (`content/contact.json`)

- [ ] How many working days after the call the written plan arrives (also stated in the home page FAQ as two).

## 6. Compliance and legal (not rendered, but decide before you sell)

Each industry in `content/industries.json` has a hidden `trust.ownerNote` starting `TODO: confirm your compliance
position`:

- [ ] Real estate: SMS and call consent, fair housing, licensing.
- [ ] Clinics: HIPAA and UK GDPR agreements, which vendors handle patient data.
- [ ] Agencies and sales teams: call-recording consent, retention, client NDAs.
- [ ] Bookkeeping: data processing agreements, professional-body rules on outsourcing and AI.
- [ ] Add a privacy policy and terms page (none exists yet) and link them in the footer. The contact form collects
      personal data.
- [ ] Tool names (n8n, Make, Zapier, OpenAI, Claude, WhatsApp) appear as text only, with a non-affiliation line. Read
      each brand's guidelines before adding any logo.

## 7. Nice to have

- [ ] Analytics (none is installed).
- [ ] Replace `public/assets/img/og-default.png` if you want a different share image.
- [ ] Self-host the two fonts if you would rather not load them from Google Fonts.
- [ ] Write a second and third blog post so the blog does not look new.
