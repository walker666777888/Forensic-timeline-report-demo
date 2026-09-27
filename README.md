# Unified Forensic Timeline (demo)

A standalone demo of the redesigned case timeline, using dummy data.

## Run it

```bash
cd temporary
npm install     # only the first time
npm run dev
```

Then open http://localhost:5174

## Files

- `src/ForensicTimeline.tsx` - the timeline component (React + Tailwind + lucide-react, same stack as the app)
- `src/data.ts` - the 24 dummy records and the case lifecycle stages
- `src/App.tsx` - a small case page wrapper around the component
- `src/index.css` - colour tokens copied from the live app, plus the jump highlight

## Porting into the app

Copy `ForensicTimeline.tsx` into the case detail page and swap `records` from `data.ts`
for the case's real events. The only custom Tailwind tokens used are `navy` (#1e1b4b)
and `navy-soft` (#312e81) from the `@theme` block in `index.css`.
