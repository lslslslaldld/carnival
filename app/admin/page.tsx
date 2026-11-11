import { redirect } from 'next/navigation';
import { getUserContext, getAdminContext } from '@/lib/admin';
import { AdminDashboard } from '@/components/AdminDashboard';
export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  if (!(await getUserContext())) redirect('/sign-in');
  if (!(await getAdminContext())) redirect('/');
  return <main className="admin-shell"><div className="container"><AdminDashboard /></div></main>;
}
