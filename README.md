# Idea Validator

A Startup Command Center to validate and explore startup ideas. Built with Next.js 14, Tailwind CSS, and Firebase.

## Features

- **Idea Management**: Create, Read, Update, and Delete (CRUD) startup ideas.
- **Authentication**: secure Google Sign-In via Firebase Auth.
- **Real-time Updates**: Live data synchronization using Firestore.
- **Filtering & Search**: Filter ideas by category, difficulty, and market potential.
- **Trending Section**: Highlights top-voted ideas.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env.local file (locally) or your deployment platform (production).

See `.env.example` for the required keys.

## Deployment on Render

This project is configured for seamless deployment on Render.

1.  **Push to GitHub**: Ensure this repository is pushed to your GitHub account.
2.  **Create Service**:
    -   Go to [Render Dashboard](https://dashboard.render.com/).
    -   Click **New +** -> **Blueprint**.
    -   Connect your repository.
    -   Render will automatically detect `render.yaml` and configure the service.
3.  **Configure Environment**:
    -   Add the Environment Variables from your `.env.local` to the Render service settings.
4.  **Deploy**: Click **Apply**.

## Scripts

-   `npm run dev`: specific development mode.
-   `npm run build`: Build for production.
-   `npm start`: Start production server.
-   `npm run lint`: Run ESLint.
