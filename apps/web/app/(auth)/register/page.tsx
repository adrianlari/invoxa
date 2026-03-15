'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, setApiContext } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  return (
    <main className="mx-auto mt-24 max-w-md">
      <Card>
        <CardHeader><CardTitle className="text-2xl">Register</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <Button
          disabled={isPending}
          onClick={async () => {
            setIsPending(true);
            setError('');
            try {
              const res = await apiClient.post('/auth/register', { name, email, password });
              if (res.defaultOrganizationId) {
                setApiContext({ organizationId: res.defaultOrganizationId });
              }
              router.push('/login');
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Register failed');
            } finally {
              setIsPending(false);
            }
          }}
        >
          {isPending ? 'Creating account...' : 'Register'}
        </Button>
        {error && <p className="text-xs text-rose-500">{error}</p>}
        </CardContent>
      </Card>
    </main>
  );
}
