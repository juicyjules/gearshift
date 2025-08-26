# Gearshift - A Modern Web UI for Transmission

Gearshift is a clean, modern, and responsive web interface for the Transmission BitTorrent client. It is built with React, TypeScript, and Vite, and it uses the Transmission RPC API to manage torrents.

## Features

- **Modern & Responsive UI:** A clean interface that works on both desktop and mobile.
- **Connection Manager:** Prompts for connection settings on first use and saves them for future sessions.
- **Torrent Management:** Add, start, stop, and delete torrents.
- **Detailed View:** See detailed information about each torrent, including files and tracker status.
- **Filtering and Sorting:** Easily search, filter, and sort your torrent list.
- **Animations:** Smooth animations for a better user experience, powered by Framer Motion.

## Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

- Node.js (v18 or later recommended)
- npm
- A running instance of the Transmission daemon with the RPC interface enabled.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/gearshift.git
    cd gearshift
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

### Configuration & Running the App

1.  **Start the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

2.  **Connect to Transmission:**
    - On your first visit, a "Connection Settings" modal will appear.
    - Enter the host, port, username, and password for your Transmission RPC server.
    - These settings (except for the password) will be saved in your browser's `localStorage` for future visits. You will only need to re-enter your password if it is required.

## Available Scripts

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run preview`: Serves the production build locally for preview.
