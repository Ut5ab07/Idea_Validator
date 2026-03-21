# Idea Validator

A comprehensive platform for validating startup ideas. This application allows users to submit their startup concepts, receive community feedback, and gauge market interest through a structured review process.

## 🚀 Features

- **Idea Submission & Validation**: Users can submit detailed startup ideas including problem statements, target markets, and expected difficulty.
- **Community Review System**: Other users can review and provide feedback on submitted ideas.
- **User Dashboard**: A personalized dashboard for managing submissions and tracking validation progress.
- **Authentication**: Secure Google and Email/Password authentication via Firebase.
- **Role-Based Access Control**:
  - **Regular Users**: Can submit ideas and review others.
  - **Admins**: Special access to oversee platform content and manage users.
- **Responsive Design**: Modern, mobile-first UI built with Tailwind CSS.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: JavaScript (JSX)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: Lucide React
- **State Management**: React Hooks & Context

### Backend & Services
- **Backend-as-a-Service**: [Firebase](https://firebase.google.com/)
- **Authentication**: Firebase Authentication (Google Provider & Email/Password)
- **Database**: Cloud Firestore (NoSQL database for storing ideas, users, and reviews)

## 📂 Project Structure

```bash
idea-validator/
├── app/                  # Next.js App Router pages
│   ├── admin/           # Admin dashboard logic and views
│   ├── dashboard/       # User dashboard for managing ideas
│   ├── profile/[id]/    # Dynamic user profile pages
│   ├── login/           # Authentication pages
│   └── page.jsx         # Landing page entry point
├── components/           # Reusable UI components
│   ├── AuthModal.jsx    # User authentication modal
│   ├── IdeaCard.jsx     # Card component for displaying idea summaries
│   ├── NewIdeaForm.jsx  # Form component for submitting new ideas
│   ├── ReviewSection.jsx # Component for handling idea reviews
│   └── ...
├── lib/                  # Utility functions and configurations
│   ├── firebase.js      # Firebase SDK initialization
│   ├── auth.js          # Authentication helper functions
│   └── roles.js         # Role definitions and admin checks
├── public/               # Static assets (images, icons)
└── ...
```

## ⚡ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Firebase project with Authentication and Firestore enabled

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/idea-validator.git
   cd idea-validator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Firebase configuration keys:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔒 Authentication & Security

This project uses Firebase Authentication for user management.
- **Sign Up/Login**: Users can sign up using their Google account or email/password.
- **Route Protection**: The middleware (if implemented) or client-side checks ensure that dashboard and admin routes are protected.
- **Admin Access**: Admin privileges are determined by the `isAdmin` function in `lib/roles.js`, which checks against a specific admin email.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Utsab Raj Acharya**

---
