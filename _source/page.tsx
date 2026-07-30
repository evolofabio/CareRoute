// app/(dashboard)/oggi/page.tsx
import DailyFeedDashboard from '@/components/daily-feed/DailyFeedDashboard';
import { createClient } from '@/lib/supabase/server'; // client SSR (cookies), da implementare in lib/supabase/server.ts
import { redirect } from 'next/navigation';

/**
 * Server Component: recupera l'utente autenticato e il CareGroup attivo
 * (es. da cookie/selezione utente), poi idrata il componente client interattivo.
 */
export default async function OggiPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // In produzione: recuperare il care_group_id attivo dell'utente (es. da preferenze
  // salvate o dall'unico gruppo se ne ha uno solo). Qui semplificato per l'MVP.
  const { data: membership } = await supabase
    .from('group_members')
    .select('care_group_id, care_groups(patient_name)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) redirect('/invito');

  return (
    <DailyFeedDashboard
      careGroupId={membership.care_group_id}
      patientName={(membership as any).care_groups?.patient_name ?? 'Assistito'}
      currentUserId={user.id}
    />
  );
}
