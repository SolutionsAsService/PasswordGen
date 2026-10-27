# SecurePass

A password and passphrase generator that runs entirely in the visitor's browser.
No account, no network request, no telemetry — every character is drawn from the
visitor's own CSPRNG and never leaves the page.

Built with Next.js (App Router) and exported to static files, so the deployed
site is plain HTML, CSS and JavaScript with no server involved in generation.

## What it does

- **Passwords** — 8 to 64 characters, with lowercase, uppercase, digits and
  symbols, a no-look-alikes option and a no-adjacent-repeats option.
- **Passphrases** — 3 to 12 words from a curated list, with a choice of
  separator and optional capitalisation and trailing digit.
- **An entropy readout in bits**, computed from the options actually selected,
  plus an order-of-magnitude crack-time estimate that states its assumption.
- **Light and dark themes**, remembered locally.

## Why the maths is done this way

Two things this project is careful about, both of them easy to get wrong.

**Unbiased selection.** The obvious way to pick a character is
`randomValue % characters.length`. That is measurably biased whenever the length
does not divide 2³², which it never does — some characters become slightly more
likely than others. Measured over 260,000 draws into 26 buckets, the modulo
approach scores chi² = 40.98 against a 95% cutoff of 37.65 (25 degrees of
freedom). Every draw here uses rejection sampling over `crypto.getRandomValues`
instead, which scores 25.49 on the same test.

**Honest entropy.** The usual figure is `length × log2(pool size)`. That is the
count of strings an *unconstrained* generator produces, so it overstates strength
as soon as you require a character from each selected class — a constrained
generator has fewer strings to choose from. This project reports log2 of the
number of strings that actually satisfy the chosen options, counted by
inclusion–exclusion over the class constraints and by an exact count for the
adjacent-repeat rule. The formula is checked against brute-force enumeration.

Guaranteeing a character class is also done by rejecting and redrawing whole
candidates rather than seeding one character of each class and shuffling.
Seeding over-weights strings that are heavy in the forced classes; rejection
keeps every accepted string equally likely.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # writes static files to out/
npm run typecheck  # tsc --noEmit
```

`next.config.mjs` sets `output: 'export'`, so `npm run build` produces a static
site in `out/` that can be served by any web host.

## Layout

```
app/
  layout.tsx          shell, metadata, theme applied before first paint
  page.tsx            the page
  globals.css         design tokens and base
components/
  Generator.tsx       the interactive card (client component)
  Generator.module.css
lib/
  password.ts         the whole engine: randomness, entropy, generation
legacy-static/        the previous single-file version, kept for reference
```

`lib/password.ts` is pure and dependency-free. It reads no state but its
arguments, which is what makes the "nothing leaves the page" claim checkable by
reading one file.

## A note on the crack-time figure

It assumes 10¹⁰ guesses per second offline and reports an order of magnitude. It
is a way to compare two options on this page, not a prediction: how long a
password actually survives depends on how the site you use it on hashes it, which
this page cannot know.

## License

MIT — see [LICENSE](LICENSE).
