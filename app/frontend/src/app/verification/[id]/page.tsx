"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Claim = {
  id: string;
  campaignId?: string;
  recipientRef?: string;
  amount?: number;
  status?: string;
};

export default function VerificationDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const base = process.env.NEXT_PUBLIC_API_URL ?? '';
    fetch(`${base}/api/v1/verification/${id}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Not found`);
        return res.json();
      })
      .then((data) => mounted && setClaim(data))
      .catch((err) => mounted && setError(String(err)))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  async function doAction(action: 'approve' | 'reject' | 'request-resubmission') {
    const base = process.env.NEXT_PUBLIC_API_URL ?? '';
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/v1/verification/${id}/${action}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: 'operator-ui' }),
      });
      if (!res.ok) throw new Error(`Action failed: ${res.status}`);
      const body = await res.json();
      setClaim((c) => (c ? { ...c, status: body.status ?? c.status } : c));
      // navigate back to inbox to reflect change
      router.push('/verification/inbox');
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!claim) return <div className="p-6">Not found</div>;

  return (
    <main className="max-w-3xl mx-auto py-8">
      <h1 className="text-xl font-semibold mb-4">Verification — {claim.id}</h1>
      <div className="p-4 border rounded bg-white dark:bg-gray-800">
        <p><strong>Campaign:</strong> {claim.campaignId}</p>
        <p><strong>Recipient:</strong> {claim.recipientRef}</p>
        <p><strong>Amount:</strong> {claim.amount}</p>
        <p><strong>Status:</strong> {claim.status}</p>
        <p className="mt-3 text-sm text-gray-600">Next step: review the evidence and choose an action.</p>

        <div className="mt-4 space-x-2">
          <button onClick={() => doAction('approve')} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
          <button onClick={() => doAction('reject')} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
          <button onClick={() => doAction('request-resubmission')} className="px-3 py-1 bg-yellow-600 text-white rounded">Request resubmission</button>
        </div>
      </div>
    </main>
  );
}
