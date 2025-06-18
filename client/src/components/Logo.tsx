'use client';
import Link from 'next/link';

export default function Logo() {
  return (
    <div className="logo-container">
      <Link href="/">
        <span className="logo">
          <span className="logo-my">My</span>
          <span className="logo-fit">FitTime</span>
        </span>
      </Link>

      <style jsx>{`
        // .logo-container {
        //   position: absolute;
        //   top: 24px;
        //   left: 24px;
        //   z-index: 1000;
        // }

        .logo {
        position: absolute;
        top: 10px;
        left: 20px;
        z-index: 2;
        font-family: 'Nunito', sans-serif;
      }


      .logo-my {
        font-family: 'Nunito', sans-serif;
        font-style: italic;
        font-weight: 600;
        font-size: 52px;
        color:#F2F2F2;
      }

      .logo-fit {
        font-family: 'Nunito', sans-serif;
        font-style: italic;
        font-weight: 400;
        font-size: 37px;
        margin-left: 1px;
        color: #f2f2f2;
      }



        .logo-time {
          color: #f2f2f2;
        }
      `}</style>
    </div>
  );
}
