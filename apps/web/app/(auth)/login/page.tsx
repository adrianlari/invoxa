'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient, setApiContext } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appstoreLoginToken = searchParams.get('appstoreLoginToken') ?? '';
  const installToken = searchParams.get('installToken') ?? '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  return (
    <main className="mx-auto mt-24 max-w-md">
      <Card>
        <CardHeader><CardTitle className="text-2xl">Login</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <Button
          disabled={isPending}
          onClick={async () => {
            setError('');
            setIsPending(true);
            try {
              const res = await apiClient.post('/auth/login', { email, password });
              const token = res.session?.token ?? '';
              const orgId = res.defaultOrganizationId ?? '';

              setApiContext({ token, organizationId: orgId });
              setSession(token);

              if (appstoreLoginToken) {
                const cont = await apiClient.post('/integrations/amazon/appstore/continue', { appstoreLoginToken });
                if (cont.organizationId) {
                  setApiContext({ organizationId: cont.organizationId });
                }
                window.location.href = cont.redirectUrl;
                return;
              }

              if (installToken) {
                const claim = await apiClient.post('/integrations/amazon/install/claim', { installToken });
                if (claim.organizationId) {
                  setApiContext({ organizationId: claim.organizationId });
                }
                router.push(claim.redirectPath ?? '/integrations');
                return;
              }

              router.push('/dashboard');
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Login failed');
            } finally {
              setIsPending(false);
            }
          }}
        >
          {isPending ? 'Signing in...' : 'Login'}
        </Button>
        {appstoreLoginToken && (
          <p className="text-xs text-slate-500">
            Continue Amazon authorization after login.
          </p>
        )}
        {installToken && (
          <p className="text-xs text-slate-500">
            Amazon setup is waiting. Sign in to complete your Appstore installation.
          </p>
        )}
        {error && <p className="text-xs text-rose-500">{error}</p>}
        {session && <p className="text-xs text-slate-500">Session token: {session}</p>}
        </CardContent>
      </Card>
    </main>
  );
}
