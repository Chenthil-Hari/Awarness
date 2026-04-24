import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, username } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'Target User ID required' }, { status: 400 });
    }

    // Set the impersonation cookie (valid for 1 hour)
    (await cookies()).set('impersonate_user_id', userId, { maxAge: 3600, path: '/' });
    (await cookies()).set('impersonate_username', username, { maxAge: 3600, path: '/' });

    return NextResponse.json({ message: `Now impersonating ${username}` });
  } catch (error) {
    return NextResponse.json({ error: 'Ghost Mode activation failed' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Clear cookies
    (await cookies()).delete('impersonate_user_id');
    (await cookies()).delete('impersonate_username');
    return NextResponse.json({ message: 'Ghost Mode deactivated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear Ghost Mode' }, { status: 500 });
  }
}
