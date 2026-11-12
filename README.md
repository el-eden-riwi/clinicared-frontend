# ClínicaRed — frontend

Single-page React client for ClínicaRed, a medical appointment scheduler built around two ideas: bookings that can't be duplicated, and a no-show risk "traffic light" for doctors. It is the visible half of a distributed system; the transactional API, message broker and analytics layer live elsewhere and are described in the [technical docs](https://el-eden-riwi.github.io/clinicared-docs/).

The interface is in Spanish.

## What the app does

Four views, switched by a `currentView` state value in `src/App.jsx` (there is no router):

| View | Who | What happens |
| --- | --- | --- |
| `home` | Everyone | Landing page with entry points for booking and the doctor portal. |
| `auth` | Everyone | Role picker (patient or doctor). Sets `userRole` locally; there is no real authentication. |
| `booking` | Patient | Generates an `X-Idempotency-Key` when the form opens (kept in state and sent as a header; it is not shown in the UI), then posts the appointment as an SMS message to `POST /simulate/messaging/send`. The time can be typed into the `Hora` field or picked from the suggested slot buttons, which just fill that field. |
| `doctor-portal` | Doctor | Lists the day's patients with a no-show risk score. Recalculates every row against `POST /risk/calculate` on entry and on demand, and can queue a reminder per patient. |

The client expects a FastAPI backend at `http://127.0.0.1:8000` (hard-coded in `App.jsx`). It degrades without it: the booking flow reports "Modo Local" and the portal keeps its seeded sample data.

## Visual architecture

The redesign is purely presentational: markup, styling and motion changed; state, handlers, endpoints and data flow did not.

**Concept — an almanac for time.** Warm paper surfaces, conifer-black ink, hairline rules and numbered sections, with one dark "night" layer (infrastructure bar, hero scene, modal, footer) for depth.

**Colour.** Semantic tokens are declared as RGB channels in `src/index.css` and mapped in `tailwind.config.js`, so opacity modifiers like `bg-surface/80` work everywhere.

| Token group | Role | Hue family |
| --- | --- | --- |
| `surface`, `surface-elevated`, `surface-sunken` | Page ground, raised panels, wells | Bone, ≈ 88° |
| `surface-night`, `surface-night-raised` | Dark atmospheric layers | Conifer, ≈ 170° |
| `ink`, `ink-muted`, `ink-faint`, `ink-inverse` | Text | Conifer black |
| `action` | Primary buttons, brand mark | Deep pine |
| `accent` | Focus, selection, emphasis | Oxidised copper, ≈ 45° |
| `tactile` (`-strong`, `-night`) | Borders: hairlines and control outlines | Bone / conifer |
| `status-danger`, `-warn`, `-ok` (+ `-soft`, `-night`) | Risk and feedback states | Madder, ochre, moss |

Contrast was measured, not assumed: body ink on surface is 14.9:1, muted ink 7.0:1, accent text 6.6:1, every status foreground on its soft background is at least 7.4:1, and control borders are at least 3.9:1 against their surfaces. Status is never colour-only; each state carries an icon and a text label.

**Type.** Newsreader (display, optical-size axis) for headlines and names, Hanken Grotesk for interface text, IBM Plex Mono for labels, times, keys and data. Loaded from Google Fonts in `index.html` with system fallbacks.

**Layout.** A visible 4 → 6 → 12 column rule grid sits behind the content (`.grid-rules`), full-bleed horizontal rules divide sections, and a single `.frame` container caps width at 82rem. The doctor table collapses into labelled cards below 768 px.

**Motion.** Everything animates `transform`, `opacity` or `translate` only, with no blur filters on moving elements. The hero scene (`HeroScene` in `App.jsx`) is layered SVG ridgelines with scroll-linked parallax, drifting mist, a slowly turning dial and a dashed route. Scroll-linked parallax and reveals use CSS scroll-driven animations as progressive enhancement; browsers without support show the static result. `prefers-reduced-motion` disables all of it.

**Accessibility.** Labels are bound to inputs, the modal has `role="dialog"` and an accessible name, toasts are `role="status"`, there is a skip link, and focus rings use the accent colour (lightened on dark layers).

## Tech stack

- React 19, Vite 8 (`@vitejs/plugin-react`)
- Tailwind CSS 3.4 with PostCSS and Autoprefixer
- `lucide-react` for icons
- ESLint 10 with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`

## Directory structure

```
.
├── .github/workflows/deploy.yml   # Build and publish to GitHub Pages
├── public/
│   └── favicon.svg                # Brand mark
├── src/
│   ├── App.css                    # Scene, parallax and scroll-reveal motion
│   ├── App.jsx                    # All views, state and API calls
│   ├── index.css                  # Tailwind layers, colour tokens, component classes
│   └── main.jsx                   # React entry point
├── index.html                     # Shell, metadata, font links
├── tailwind.config.js             # Token map, type scale, keyframes
├── vite.config.js                 # base: '/clinicared-frontend/'
├── postcss.config.js
├── eslint.config.js
└── package.json
```

## Local setup

Requires Node `^20.19.0` or `>=22.12.0` (Vite 8's range).

```bash
npm ci
npm run dev       # Vite dev server
npm run lint      # ESLint
npm run build     # Production build into dist/
npm run preview   # Serve dist/ locally
```

Because `vite.config.js` sets `base: '/clinicared-frontend/'`, the app is served under that path, for example `http://localhost:5173/clinicared-frontend/`.

To exercise the live paths, run the FastAPI service on `127.0.0.1:8000` exposing:

- `POST /risk/calculate` — body `{ total_appointments, historical_no_shows, days_since_last_visit, age }`, response `{ data: { classification, risk_score_percentage } }`
- `POST /simulate/messaging/send` — body `{ recipient, message, channel }`; the booking call also sends an `X-Idempotency-Key` header

## CI/CD

`.github/workflows/deploy.yml` runs on every push to `main`:

1. Check out the repository (`actions/checkout@v4`).
2. Set up Node 20 with the npm cache (`actions/setup-node@v4`).
3. `npm ci`, then `npm run build`.
4. Configure Pages, upload `./dist` as the Pages artifact, and deploy (`actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`).

The job has `pages: write` and `id-token: write` permissions and runs in the `github-pages` environment. A `pages` concurrency group cancels superseded deploys. Lint is not part of the pipeline; run `npm run lint` before pushing.

## Notes

- `App.jsx` carries two `eslint-disable-next-line` comments on the effect that refreshes risk scores when the doctor portal opens. The effect intentionally depends only on `currentView` and triggers a state update; the comments document that rather than change the behaviour.
- The no-show score meter in the doctor table reads the `score` string (for example `"80%"`) directly as a CSS width.