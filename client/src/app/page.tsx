// 'use client';

// import { useRouter } from 'next/navigation';
// import './HomePage.css';

// export default function HomePage() {
//   const router = useRouter();

//   return (
//     <main className="home-container">
//       <div className="overlay" />
//       <div className="content">
//         <p className="subtitle">
//           Manage your time. Take care of your body.
//         </p>

//         <button
//           onClick={() => router.push('/login')}
//           className="get-started"
//         >
//           Get Started
//         </button>

//       </div>
//     </main>
//   );
// }
'use client';

import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/firebase/firebaseConfig';
import { saveUserToFirestore } from '@/firebase/saveUserToFirestore';
import { useState } from 'react';
import './HomePage.css';

export default function HomePage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await saveUserToFirestore(user); // שמירת המשתמש אם חדש
      console.log('✅ Logged in as:', user.email);

      router.push('/dashboard');
    } catch (error) {
      console.error('❌ Google login error:', error);
      setErrorMessage('שגיאה בהתחברות עם Google');
    }
  };

  return (
    <main className="home-container">
      <div className="overlay" />
      <div className="content">
        <p className="subtitle">
          Manage your time. Take care of your body.
        </p>

        <button type="button" onClick={handleGoogleLogin} className="get-started google-btn">
          <img src="/google-icon.png" alt="Google" />
          Continue with Google
        </button>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </main>
  );
}
