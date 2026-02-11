# HabitLens

**Understand Your Habits. Shape Your Future.**

HabitLens is a calm, intelligent wellness companion that helps you see how small daily actions quietly influence your health, focus, and emotional well-being over time. By leveraging AI, it provides personalized insights and gentle projections to guide you toward a healthier daily rhythm.

## Features

-   **Consequence Prediction**: Quietly understand the short- and long-term impact of everyday habits.
-   **Future Timeline**: See gentle projections of where your current routine may lead.
-   **AI-Powered Insights**: Receive supportive insights, actionable suggestions, and a "Life Balance Score" powered by Google Gemini.
-   **Guided Improvement**: Small, realistic steps toward better health.
-   **User Authentication**: Secure login and signup via Firebase.

## Tech Stack

-   **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (Animations), [Lucide React](https://lucide.dev/) (Icons)
-   **Backend / Database**: [Firebase](https://firebase.google.com/) (Auth, Firestore)
-   **Artificial Intelligence**: [Google Gemini API](https://ai.google.dev/) (`@google/generative-ai`)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **Utilities**: `date-fns`, `clsx`, `tailwind-merge`

## Getting Started

### Prerequisites

-   Node.js (v18+ recommended)
-   npm or yarn
-   A Firebase project
-   A Google Gemini API key

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/habitlens.git
    cd habitlens
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**

    Create a `.env.local` file in the root directory and add the following variables:

    ```env
    # Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

    # Google Gemini API
    # Note: The application specifically looks for 'GEMINI_API_KEY2'
    GEMINI_API_KEY2=your_gemini_api_key
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

-   `app/`: Next.js App Router pages and API routes.
    -   `api/habit-advice/`: Backend logic for communicating with Gemini AI.
-   `components/`: Reusable UI components.
-   `firebase.js`: Firebase initialization and configuration.
-   `store/`: Zustand state management stores.

## AI Integration

The `app/api/habit-advice/route.js` endpoint handles interactions with the Google Gemini API. It takes user habit data and context, sending it to the model to generate:
-   A supportive insight.
-   A gentle, actionable suggestion.
-   A Life Balance Score (0-100).

The system includes a fallback strategy that attempts multiple Gemini models (`gemini-2.5-flash`, `gemini-2.0-flash`, etc.) to ensure reliability.

## License

This project is licensed under the MIT License.
