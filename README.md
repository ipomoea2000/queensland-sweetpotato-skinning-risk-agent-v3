# Queensland Sweetpotato Skinning Risk Agent

Mobile-responsive proof-of-concept decision-support prototype for Queensland sweetpotato production.

## Included

- Queensland production-region dropdown
- Provisional location-specific GDD and rainfall defaults
- Cultivar, irrigation cutoff, rainfall, vine removal, soil moisture, and handling inputs
- Dynamic risk score, risk drivers, and management recommendations
- Scenario explorer for delayed harvest
- Partner logos and prominent demonstration disclaimer
- GitHub- and Vercel-ready Next.js project

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy

Upload the project source to GitHub and import the repository into Vercel.

## Weather integration

This build is SILO-ready but currently uses editable demonstration values. A later version can connect to the SILO API for historical rainfall and temperature, with forecast rainfall added from an approved Australian forecast source.

## Important

This is not a validated commercial tool. Model coefficients and risk thresholds are provisional and should be recalibrated using Queensland field data.
