'use client';

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




  // const handleRegister = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setErrorMessage('');

  //   try {
  //     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  //     await saveUserToFirestore(userCredential.user);
  //     console.log('Registered as:', userCredential.user.email);
  //     window.location.href = '/'; // מעביר לדף הבית
  //   } catch (error: any) {
  //     if (error.code === 'auth/email-already-in-use') {
  //       setErrorMessage('כבר קיים חשבון עם האימייל הזה. עבור למסך ההתחברות.');
  //     } else {
  //       setErrorMessage('אירעה שגיאה בהרשמה. נסה שוב.');
  //     }
  //     console.error('Registration error:', error);
  //   }
  // };

 const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMessage('');

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await saveUserToFirestore(userCredential.user);
    console.log('Registered as:', userCredential.user.email);

    // כאן השינוי
    router.push('/home');
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      setErrorMessage('כבר קיים חשבון עם האימייל הזה. עבור למסך ההתחברות.');
    } else {
      setErrorMessage('אירעה שגיאה בהרשמה. נסה שוב.');
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
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-700">הרשמה</h1>
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-center text-sm">
            {errorMessage}
          </div>
        )}


        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-6 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          הרשם
        </button>

        <div className="my-4 text-center text-sm text-gray-500">או</div>

        <button
          type="button"
          onClick={handleGoogleRegister}
          className="w-full bg-white border border-gray-300 text-black py-2 rounded hover:bg-gray-100 flex items-center justify-center gap-2"
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
          הרשמה עם Google
        </button>

        <p className="mt-4 text-sm text-center">
          כבר יש לך חשבון?{' '}
          <a href="/login" className="text-purple-600 hover:underline">
            התחבר כאן
          </a>
        </p>
      </form>
    </main>
  );
}
