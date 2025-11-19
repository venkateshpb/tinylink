import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function CodeStatsPage() {
  const router = useRouter();
  const { code } = router.query;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    setError(null);

    fetch(`/api/links/${code}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Error loading data');
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError('Unable to load stats');
        setLoading(false);
      });
  }, [code]);

  if (!code) {
    return <div className="p-6">Loading…</div>;
  }

  if (loading) {
    return <div className="p-6">Loading stats…</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Stats for code: {data.code}</h1>
        <p className="text-sm text-gray-500 break-all">{data.target}</p>
      </header>

      <div className="bg-white rounded shadow p-6 space-y-3">
        <div>
          <span className="font-semibold">Total clicks: </span>
          <span>{data.clicks}</span>
        </div>
        <div>
          <span className="font-semibold">Last clicked: </span>
          <span>{data.lastClicked ? new Date(data.lastClicked).toLocaleString() : 'Never'}</span>
        </div>
        <div>
          <span className="font-semibold">Created at: </span>
          <span>{new Date(data.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={data.target}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-2 border rounded"
        >
          Open target
        </a>
        <button
          className="px-3 py-2 border rounded"
          onClick={() => {
            const url = `${window.location.origin}/${data.code}`;
            navigator.clipboard?.writeText(url);
          }}
        >
          Copy short URL
        </button>
        <Link href="/">
          <span className="px-3 py-2 border rounded cursor-pointer">Back to dashboard</span>
        </Link>
      </div>
    </div>
  );
}
