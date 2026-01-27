# PocketGuard - Expense Tracker

PocketGuard is a modern, AI-powered expense tracking web application built with Next.js, Firebase, and Google's Genkit. It allows users to manage their finances with ease, offering features like automatic expense categorization and insightful financial summaries.

## Features

-   **Secure User Authentication**: Sign up, log in, and log out functionality using Firebase Authentication (Email & Password).
-   **Full CRUD for Expenses**: Add, view, edit, and delete expenses.
-   **AI-Powered Categorization**: Automatically categorizes expenses if a category isn't specified.
-   **AI Financial Summaries**: Get human-readable summaries of your spending habits on demand.
-   **Interactive Dashboard**: An overview of your total and monthly spending, recent transactions, and a category-wise breakdown.
-   **Data Visualization**: Interactive pie chart to visualize spending distribution across categories.
-   **Responsive Design**: A clean, modern, and responsive UI that works on all devices.
-   **Secure by Design**: Firestore security rules ensure users can only access their own data.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
-   **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
-   **AI**: [Google AI (Gemini)](https://ai.google.dev/) via [Genkit](https://firebase.google.com/docs/genkit)
-   **Charts**: [Recharts](https://recharts.org/)
-   **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20 or later)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   A [Firebase project](https://console.firebase.google.com/)
-   A [Google AI API Key](https://ai.google.dev/gemini-api/docs/api-key)

### 1. Firebase Project Setup

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Create a Web App**: In your project dashboard, add a new Web App (`</>`).
3.  **Get Config Keys**: After creating the web app, Firebase will provide you with a `firebaseConfig` object. Copy these keys. You will need them for the environment variables.
4.  **Enable Authentication**: In the Firebase console, go to the "Authentication" section, click "Get started", and enable the "Email/Password" sign-in provider.
5.  **Setup Firestore**: Go to the "Firestore Database" section and create a new database. Start in **production mode**.
6.  **Add Firestore Rules**: Go to the "Rules" tab in the Firestore section and paste the contents of the `firestore.rules` file from this project. Click "Publish".

### 2. Google AI Setup

1.  **Get API Key**: Visit the [Google AI Studio](https://makersuite.google.com/app/apikey) to create and copy your API key for the Gemini API.

### 3. Local Installation & Setup

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**:
    Create a `.env` file in the root of the project. You can rename the existing one if needed. Fill in the values you obtained from Firebase and Google AI.
    ```
    # Firebase Configuration - copy from your Firebase project settings
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"

    # Google AI (Gemini) API Key for Genkit
    GOOGLE_API_KEY="YOUR_GOOGLE_AI_API_KEY"
    ```

### 4. Running the Application

1.  **Run the Genkit AI flows (in a separate terminal)**:
    This command starts the Genkit development server, which makes the AI flows available to your Next.js application.
    ```bash
    npm run genkit:dev
    ```

2.  **Run the Next.js Development Server**:
    In another terminal, start the main application.
    ```bash
    npm run dev
    ```

The application should now be running at [http://localhost:9002](http://localhost:9002).
