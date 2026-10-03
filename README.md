# Cognitive Accessible Banking

A mobile banking prototype that adapts its interface for customers who find dense financial information overwhelming. Built for the DIFC x CBI Future of Banking hackathon.

## What it does
- Normal Mode: a full, information-rich banking dashboard.
- Cognitive Mode: a calmer, task-first experience that asks "What would you like to do?" and reveals details only when needed.
- Settings control the experience: step-by-step guidance, simpler information, plain language, text size, spacing, and reduced distractions.
- An AI assistant explains financial terms and products. It explains, it never recommends.

## Design decisions
- Progressive disclosure instead of removing information.
- The customer stays in control of how much they see.
- Plain-language alternatives for financial jargon.

## Tech stack
TypeScript, React / Expo, pnpm workspace (fill in what's accurate)

## Running locally
pnpm install, then run the app from `artifacts/` (add the exact command once you've confirmed it).
AI features need `AI_INTEGRATIONS_OPENAI_API_KEY` and a base URL set in a `.env` file.

## Built with
Designed and directed by Jayden Akpalu, built with Replit's AI tooling.

## Screenshots
![Normal dashboard](screenshots/normal-home-dashboard.png)