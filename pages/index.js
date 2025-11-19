import React, { useEffect, useState } from "react";

function CreateLinkForm({ onCreated }) {
  const [target, setTarget] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          code: code || undefined
        })
      });

      if (res.status === 409) {
        const data = await res.json();
        setError(data.error || "Code already exists");
      } else if (res.status === 400) {
        const data = await res.json();
        setError(data.error || "Invalid input");
      } else if (res.status === 201) {
        const created = await res.json();
        setTarget("");
        setCode("");
        onCreated(created);
      } else {
        setError("Unexpected error");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow mb-6 space-y-3"
    >
      <h2 className="font-semibold text-lg">Create short link</h2>

      <div>
        <label className="block text-sm mb-1">Target URL</label>
        <input
          type="url"
          required
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="https://example.com/docs"
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">
          Custom code (optional)&nbsp;
          <span className="text-xs text-gray-500">[A-Za-z0-9] length 6–8</span>
        </label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="docs123"
          className="w-full border rounded p-2"
        />
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
      >
        {loading ? "Creating…" : "Create"}
      </button>
    </form>
  );
}

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      // you could store an error state if desired
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleCreated = (link) => {
    setLinks((prev) => [link, ...prev]);
  };

  const handleDelete = async (code) => {
    const ok = window.confirm("Delete this link?");
    if (!ok) return;

    const res = await fetch(`/api/links/${code}`, {
      method: "DELETE"
    });

    if (res.status === 204) {
      setLinks((prev) => prev.filter((l) => l.code !== code));
    } else {
      alert("Failed to delete link");
    }
  };

  const filtered = links.filter((l) => {
    const q = filter.toLowerCase();
    return l.code.toLowerCase().includes(q) || l.target.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">TinyLink</h1>
            <p className="text-sm text-gray-600">
              Shorten URLs, view click statistics, and manage links.
            </p>
          </div>
          <a
            href="/healthz"
            className="text-sm px-3 py-2 border rounded bg-white"
          >
            Healthcheck
          </a>
        </header>

        <CreateLinkForm onCreated={handleCreated} />

        <div className="mb-4 flex justify-between items-center gap-4">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by code or URL"
            className="border p-2 rounded w-full md:w-1/2"
          />
        </div>

        <div className="bg-white rounded shadow overflow-x-auto">
          {loading ? (
            <div className="p-6">Loading links…</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-gray-500">No links yet.</div>
          ) : (
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Short code</th>
                  <th className="text-left p-3">Target URL</th>
                  <th className="text-left p-3">Total clicks</th>
                  <th className="text-left p-3">Last clicked</th>
                  <th className="text-center p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.code} className="border-t">
                    <td className="p-3 font-mono">
                      <a
                        href={`/${l.code}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600"
                      >
                        {l.code}
                      </a>
                    </td>
                    <td className="p-3 max-w-md">
                      <div className="truncate" title={l.target}>
                        {l.target}
                      </div>
                    </td>
                    <td className="p-3">{l.clicks}</td>
                    <td className="p-3">
                      {l.lastClicked ? new Date(l.lastClicked).toLocaleString() : "—"}
                    </td>
                    <td className="p-3 text-center space-x-2 whitespace-nowrap">
                      <a
                        href={`/code/${l.code}`}
                        className="px-2 py-1 border rounded text-xs"
                      >
                        Stats
                      </a>
                      <button
                        className="px-2 py-1 border rounded text-xs"
                        onClick={() => {
                          const url = `${window.location.origin}/${l.code}`;
                          navigator.clipboard?.writeText(url);
                        }}
                      >
                        Copy
                      </button>
                      <button
                        className="px-2 py-1 border rounded text-xs bg-red-50"
                        onClick={() => handleDelete(l.code)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
