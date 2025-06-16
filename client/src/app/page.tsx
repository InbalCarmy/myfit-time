'use client';

import { useRouter } from 'next/navigation';
import './HomePage.css';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="home-container">
      <div className="overlay" />

      <div className="logo">
        <h1>
          <span className="logo-my">My</span>
          <span className="logo-fit">FitTime.</span>
        </h1>
      </div>

      <div className="content">
        <p className="subtitle">
          Manage your time. Take care of your body.
        </p>

        <button
          onClick={() => router.push('/login')}
          className="get-started"
        >
          Get Started
        </button>

        <p className="login-link">
          Don’t have an account?{' '}
          <a href="/register" className="register-link">
            Register
          </a>
        </p>
      </div>
    </main>
  );
}
