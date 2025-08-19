# Project Setup Explanation

This document explains two key aspects of the current project setup: the authentication model for communicating with the Transmission server and the structure of the client-side application.

---

## 1. Current Authentication Approach (Backend Proxy)

Instead of having the user's browser connect directly to the Transmission server, this project uses a **backend proxy** model. This is a more secure and robust approach. Here’s how it works:

1.  **Secure Credential Storage**: All connection details for your Transmission server (URL, username, password) are stored securely in the `server/.env` file on the backend. They are never exposed to the frontend (the user's browser).

2.  **Request Flow**:
    - The React frontend makes an API call to our own backend server (e.g., to `/api/rpc`).
    - The backend server receives this request. It then attaches the secure credentials from the `.env` file and forwards the request to the actual Transmission RPC API.
    - The Transmission server responds to our backend.
    - Our backend forwards that response back to the frontend.

3.  **Automatic Session Handling**: The Transmission API requires a special `X-Transmission-Session-Id` header for security. Our backend handles this automatically.
    - It maintains the current session ID in memory.
    - If a request fails because the session ID is invalid (a `409 Conflict` error), the backend code is designed to automatically grab the new session ID from the error response and retry the original request.
    - This entire process is transparent to the frontend, making the client-side code much simpler.

This proxy model solves two major problems: it avoids browser CORS (Cross-Origin Resource Sharing) issues and it keeps your Transmission server credentials safe.

---

## 2. Client-Side Setup (`create-react-app` & `react-scripts`)

The client application was bootstrapped using a standard tool called **`create-react-app`**. This tool sets up a complete and optimized development environment for building a React application.

The core of this setup is a package called **`react-scripts`**. Instead of us having to manage complex build tools like Webpack and Babel directly, `react-scripts` hides all that complexity and gives us a simple set of commands to work with:

-   **`npm start`** (runs `react-scripts start`): This command starts a local development server with **hot-reloading**, meaning the app automatically updates in the browser whenever we save a file.

-   **`npm run build`** (runs `react-scripts build`): This command bundles the entire application into a small set of static files in a `/build` folder. These are the files you would deploy to a web server for production.

-   **`npm test`** (runs `react-scripts test`): This command launches a test runner (Jest) to execute any automated tests.

In short, `react-scripts` provides a managed, professional-grade build pipeline out of the box, allowing us to focus on writing the application code itself.
