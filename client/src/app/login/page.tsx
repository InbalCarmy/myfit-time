'use client';

import { useState } from 'react';
import { auth, googleProvider } from '@/firebase/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { saveUserToFirestore } from '@/firebase/saveUserToFirestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import './login.css'; // הוספתי קובץ CSS חיצוני

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      await saveUserToFirestore(user);
      console.log('Logged in as:', user.email);

      router.push('/dashbord');
    } catch (error: any) {
      console.error('Email login error:', error);

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrorMessage('אימייל או סיסמה שגויים');
      } else {
        setErrorMessage('שגיאה בהתחברות. נסי שוב מאוחר יותר');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await saveUserToFirestore(user);
      console.log('Logged in as:', user.displayName);
      router.push('/dashbord');
    } catch (error) {
      console.error('Google login error:', error);
      alert('שגיאה בהתחברות עם Google');
    }
  };

  return (
    <main className="login-main">
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          required
        />
         <p className="bottom-text">
          Don’t have an account? <a href="/register">Register</a>
        </p>

        <button type="submit" className="email-login-btn">
          Login
        </button>

        <button type="button" onClick={handleGoogleLogin} className="google-btn">
          <img src="/google-icon.png" alt="Google" />
            Continu With Gogle        </button>

        {errorMessage && (
          <p className="error-message">{errorMessage}</p>
        )}

        {/* <p className="bottom-text">
          Don’t have an account? <a href="/register">Register</a>
        </p> */}
      </form>
    </main>
  );
}
