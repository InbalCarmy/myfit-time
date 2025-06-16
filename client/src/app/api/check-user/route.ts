// /client/src/app/api/check-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@server/firebaseAdmin';


export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ exists: false });

  try {
    await admin.auth().getUserByEmail(email);
    return NextResponse.json({ exists: true });
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json({ exists: false });
    }
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
