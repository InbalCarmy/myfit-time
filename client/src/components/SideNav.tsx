'use client';

import { useRouter } from 'next/navigation';
import './SideNav.css'; // אפשר לשמור את ה-CSS בנפרד

export default function SideNav() {
  const router = useRouter();

  return (
    <nav className="side-nav">
      <button onClick={() => router.push('/diary')} className="nav-btn">
        <img src="/diary.png" alt="Diary" />
      </button>
      <button onClick={() => router.push('/calendar')} className="nav-btn">
        <img src="/calendar.png" alt="Calendar" />
      </button>
      <button onClick={() => router.push('/smart-plan')} className="nav-btn">
        <img src="/ai-icon-white.png" alt="AI" />
      </button>
      <button onClick={() => router.push('/profile')} className="nav-btn">
        <img src="/profile.png" alt="Profile" />
      </button>
    </nav>
  );
}
