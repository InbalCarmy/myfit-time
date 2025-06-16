// // src/app/login/page.tsx
// 'use client';

// import { useState } from 'react';
// import { auth, googleProvider } from '@/firebase/firebaseConfig';
// import { signInWithPopup } from 'firebase/auth';
// import { saveUserToFirestore } from '@/firebase/saveUserToFirestore';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { useRouter } from 'next/navigation';
// import './login.css';


// export default function LoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [password, setPassword] = useState('');


//   const handleLogin = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setErrorMessage(''); // איפוס שגיאות קודמות

//   try {
//     const result = await signInWithEmailAndPassword(auth, email, password);
//     const user = result.user;

//     await saveUserToFirestore(user);
//     console.log('Logged in as:', user.email);

//     router.push('/home');
//   } catch (error: any) {
//     console.error('Email login error:', error);
    
//     if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
//       setErrorMessage('אימייל או סיסמה שגויים');
//     } else {
//       setErrorMessage('שגיאה בהתחברות. נסי שוב מאוחר יותר');
//     }
//   }
// };


// const handleGoogleLogin = async () => {
//   try {
//     const result = await signInWithPopup(auth, googleProvider);
//     const user = result.user;

//     await saveUserToFirestore(user); // שמירה ל-Firestore אם צריך
//     console.log('Logged in as:', user.displayName);
//     router.push('/home'); // ניווט לדף הבית
//   } catch (error) {
//     console.error('Google login error:', error);
//     alert('שגיאה בהתחברות עם Google');
//   }
// };


//   return (
//     <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
//       <form
//         onSubmit={handleLogin}
//         className="login-form"
//       >
//         <h1 className="text-2xl font-bold mb-6 text-center text-purple-700">התחברות</h1>

//         <input
//           type="email"
//           placeholder="אימייל"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="w-full p-2 mb-4 border rounded"
//           required
//         />
//         <input
//           type="password"
//           placeholder="סיסמה"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full p-2 mb-6 border rounded"
//           required
//         />

//         <button
//           type="submit"
//           className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
//         >
//           התחבר
//         </button>

//         <div className="my-4 text-center text-sm text-gray-500">או</div>

//         <button
//           type="button"
//           onClick={handleGoogleLogin}
//           className="w-full bg-white border border-gray-300 text-black py-2 rounded hover:bg-gray-100 flex items-center justify-center gap-2"
//         >
//           <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
//           התחברות עם Google
//         </button>
//     {errorMessage && (
//   <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
// )}


//         <p className="mt-4 text-sm text-center">
//           אין לך חשבון?{' '}
//           <a href="/register" className="text-purple-600 hover:underline">
//             הרשם כאן
//           </a>
//         </p>
//       </form>
//     </main>
//   );
// }

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

      router.push('/home');
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
      router.push('/home');
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
