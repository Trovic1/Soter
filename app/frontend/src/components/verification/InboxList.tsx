"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type ClaimItem = {
  id: string;
  campaignId?: string;
  amount?: number;
  recipientRef?: string;
  evidenceRef?: string | null;
  status: string;
  uiStatus?: string;
  nextStep?: string;
  deepLink?: string;
  createdAt: string;
  updatedAt: string;
};

function uiStatusLabel(dbStatus: string) {
  switch (dbStatus) {
    case 'requested':
      return 'Pending review';
    case 'verified':
      return 'Approved';
    case 'approved':
      return 'Approved';
    case 'archived':
      return 'Rejected';
    default:
      return dbStatus;
  }
}

function nextStepMessage(dbStatus: string) {
  switch (dbStatus) {
    case 'requested':
      return 'Review evidence — approve, reject, or request resubmission.';
    case 'verified':
    case 'approved':
      return 'No action required — claim approved.';
    case 'archived':
      return 'Claim archived (rejected). You may reopen if needed.';
    default:
      return 'View details.';
  }
}

export const InboxList: React.FC = () => {
  const [items, setItems] = useState<ClaimItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const base = process.env.NEXT_PUBLIC_API_URL ?? '';
    const url = `${base}/api/v1/verification`;

    setLoading(true);
    fetch(url, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        // backend now returns enriched items with uiStatus and nextStep
        setItems(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(String(err));
        setItems([]);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-6">Loading inbox…</div>;
  if (error)
    return (
      <div className="p-6 text-red-600">Error loading inbox: {error}</div>
    );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Verification Inbox</h1>
      {items && items.length === 0 && (
        <div className="text-sm text-gray-600">No items in the inbox.</div>
      )}

      <ul className="space-y-3">
        {items &&
          items.map((it) => (
            <li
              key={it.id}
              className="p-4 border rounded-lg bg-white dark:bg-gray-800 flex justify-between items-start"
            >
              <div>
                <div className="flex items-baseline space-x-3">
                  <h2 className="font-medium">Claim {it.id}</h2>
                  <span className="text-sm text-gray-500">{it.campaignId}</span>
                </div>
                <p className="text-sm text-gray-600">Recipient: {it.recipientRef}</p>
                <p className="mt-2 text-sm">{it.nextStep ?? ''}</p>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">{uiStatusLabel(it.uiStatus ?? it.status)}</div>
                <div className="mt-2 space-x-2">
                  <Link href={it.deepLink ?? `/verification/${it.id}`} className="text-blue-600 hover:underline">
                    Open
                  </Link>
                  <a href={`/#${it.deepLink ?? `/verification/${it.id}`}`} className="text-sm text-gray-400">
                    deep link
                  </a>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default InboxList;
