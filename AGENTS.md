# AGENTS.md - A Guide for AI Agents

Hello, fellow AI agent! This guide is here to help you understand the architecture of the Gearshift repository and provide tips for working on it effectively.

## Project Overview

Gearshift is a web-based client for the Transmission BitTorrent daemon. It is built using:
- **Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** CSS with some CSS-in-JS patterns for animations.
- **Animations:** Framer Motion (`motion` library)

The goal is to provide a modern, responsive, and feature-rich user interface for managing torrents.

## Architecture

The application has a clear, component-based architecture. Here is the high-level data and render flow:

1.  **`src/main.tsx`**: The main entry point. It renders the `App` component.
2.  **`src/App.tsx`**: This component sets up the top-level providers. The most important one is `TransmissionProvider`.
3.  **`src/providers/TransmissionProvider.tsx`**: This is a critical component. It uses the `useConnection` hook to manage the connection to the Transmission daemon.
    - If not connected, it renders the `ConnectionSettingsModal`.
    - Once connected, it provides the `transmission` client instance via `TransmissionContext` to the rest of the app.
4.  **`src/hooks/useConnection.ts`**: This custom hook encapsulates all logic for connecting to the server, including loading/saving settings from `localStorage`.
5.  **`src/components/Main.tsx`**: This is the main application component, rendered only after a successful connection. It fetches and manages the state for the torrent list, filtering, sorting, and selection. It also controls the visibility of the `SettingsModal` and `AddTorrentModal`.
6.  **`src/components/Modal.tsx`**: A generic, reusable modal component that provides the base structure and animations for all modals in the app.
7.  **`src/transmission-rpc/transmission.ts`**: This is the low-level client that handles the actual RPC calls to the Transmission daemon. All API method definitions are here.
8.  **`src/transmission-rpc/types.ts`**: This file contains all the TypeScript type definitions for the data structures sent to and received from the Transmission API. It is an essential reference.

## Development Workflow

1.  **Installation:** Always start by running `npm install` to ensure you have all the dependencies.
2.  **Running the Dev Server:** Use `npm run dev` to start the Vite development server.
3.  **Linting:** Before submitting any changes, run `npm run lint` to check for code style issues. Please fix any errors you introduce.

## Coding Conventions & Tips

- **Component Structure:** Components are located in `src/components`. When creating a new component, also create a corresponding CSS file for its specific styles.
- **State Management:** Most of the application state is currently managed in `Main.tsx` using `useState` and `useMemo`. For new features, consider if the state belongs here or if it should be encapsulated in a new custom hook in `src/hooks`.
- **Styling:**
    - The project uses CSS variables for colors, fonts, and some spacing, defined in `src/index.css`. Please use these variables (`var(--variable-name)`) for any new styles to maintain consistency.
    - For animations, the project uses `framer-motion`. Look at `Modal.tsx`, `TorrentList.tsx`, and `CustomDropdown.tsx` for examples of how to implement animations.
- **API Interaction:**
    - All direct communication with the Transmission daemon should go through the `transmission` client instance, which is available via the `useTransmission()` hook.
    - Before implementing a feature that needs new data, check `src/transmission-rpc/types.ts` to see if the data is already defined. Then check `src/entities/TorrentDetails.ts` or `TorrentOverview.ts` to see if the fields are being requested in the API calls.
- **Modals:** All modals should be built using the generic `src/components/Modal.tsx` component to ensure a consistent look, feel, and behavior (including animations).
- **Utilities:** If you write a generic helper function (e.g., for formatting dates, numbers, or strings), add it to the `src/utils` directory instead of defining it inside a component.
