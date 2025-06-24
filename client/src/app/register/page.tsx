'use client';
import './register.css';

import { useState } from 'react';
import { auth, googleProvider } from '@/firebase/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { saveUserToFirestore } from '@/firebase/saveUserToFirestore';
import { useRouter } from 'next/navigation';


export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');



  
  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMessage('');

  if (password !== confirmPassword) {
    setErrorMessage('Passwords do not match');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await saveUserToFirestore(userCredential.user, displayName);
    console.log('Registered as:', userCredential.user.email);

    router.push('/dashboard');
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      setErrorMessage('An account with this email already exists. Please log in.');
    } else {
      setErrorMessage('Registration failed. Please try again.');
    }
    console.error('Registration error:', error);
  }
};




  const handleGoogleRegister = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await saveUserToFirestore(user);
      console.log('Signed in with Google:', user.displayName);
    } catch (error) {
      console.error('Google sign-up error:', error);
    }
  };

  return (
    <main className="register-main">
      <form onSubmit={handleRegister} className="register-form">
        {errorMessage && (
          <div className="register-error">{errorMessage}</div>
        )}
        <input
          type="text"
          placeholder="Account Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="register-input"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="register-input"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="register-input"
          required
        />

        <input
          type="password"
          placeholder="Verify Your Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="register-input"
          required
        />

        <button type="submit" className="register-btn">
          Register
        </button>


        <button
          type="button"
          onClick={handleGoogleRegister}
          className="google-btn"
        >
          <img src="/google-icon.png" alt="Google" className="google-icon" />
          Register with Google
        </button>

        <p className="register-bottom-text">
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </main>

  );
}
