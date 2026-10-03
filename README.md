# Cognitive Accessible Banking

A mobile banking prototype that adapts to customers who find dense financial information overwhelming. Built by our team for the DIFC x CBI Future of Banking Hackathon.

## The idea

Most banking apps show everything at once. For many customers, including people who are neurodivergent, anxious about money, or new to finance, that makes it hard to know where to start.

This prototype has two modes:

- **Normal Mode:** a full, information-rich banking dashboard.
- **Cognitive Mode:** a calmer, task-first experience that asks "What would you like to do?" and reveals details only when they become relevant.

## Features

- Progressive disclosure: information is revealed step by step, never removed.
- Customizable Cognitive Mode settings: step-by-step guidance, simpler information, plain language, text size, spacing, and reduced distractions.
- Plain-language alternatives for financial jargon (for example, "Yearly fee" instead of "Annual management fee").
- Guided flows for saving, investing, and viewing your money.
- A contextual AI assistant that explains financial terms and products. It explains, but never recommends.

## Design principles

- The customer stays in control of how much information they see.
- The system never makes financial decisions for the user.
- Simplicity is a deliberate design choice, not a stripped-down version of the app.

## Tech stack

TypeScript, React, Expo, Vite, pnpm workspaces

## Running locally

1. Install Node.js and pnpm.
2. Run `pnpm install` from the project root.
3. Start an app from the `artifacts/` folder using the scripts in its `package.json`.

The AI assistant needs an OpenAI-compatible API key, provided through environment variables in a local `.env` file. Without one, the rest of the app still runs.

