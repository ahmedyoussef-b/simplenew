// src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';

export async function GET() {
  console.log('--- 🔎 API: Get Session ---');
  const session = await getServerSession();

  if (!session) {
    console.log('🚫 Aucune session valide trouvée.');
    return NextResponse.json({ user: null }, { status: 401 });
  }

  console.log('✅ Session valide trouvée pour:', session.user.email);
  return NextResponse.json({ user: session.user });
}
