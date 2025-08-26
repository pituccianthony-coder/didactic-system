'use client';

import { useState, useEffect, FormEvent } from 'react';

interface JournalEntry {
  id: string;
  observation: string;
  hypothesis?: string;
  check_plan?: string;
  tags?: string[];
  createdAt: string;
}

export const JournalInterface = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    observation: '',
    hypothesis: '',
    check_plan: '',
    tags: '',
  });

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch('/api/v1/journal');
        if (!response.ok) throw new Error('Failed to fetch entries');
        const data = await response.json();
        setEntries(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      });
      if (!response.ok) throw new Error('Failed to create entry');
      const newEntry = await response.json();
      setEntries([newEntry, ...entries]);
      setFormData({ observation: '', hypothesis: '', check_plan: '', tags: '' }); // Clear form
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <form onSubmit={handleSubmit} style={{ marginBottom: '40px' }}>
        <h2>New Entry</h2>
        <textarea
          value={formData.observation}
          onChange={e => setFormData({ ...formData, observation: e.target.value })}
          placeholder="Observation..."
          required
          style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }}
        />
        <input
          type="text"
          value={formData.hypothesis}
          onChange={e => setFormData({ ...formData, hypothesis: e.target.value })}
          placeholder="Hypothesis..."
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <input
            type="text"
            value={formData.check_plan}
            onChange={e => setFormData({ ...formData, check_plan: e.target.value })}
            placeholder="Check Plan..."
            style={{ width: '100%', marginBottom: '10px' }}
        />
        <input
            type="text"
            value={formData.tags}
            onChange={e => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Tags (comma-separated)..."
            style={{ width: '100%', marginBottom: '10px' }}
        />
        <button type="submit">Save Entry</button>
      </form>
      <div>
        <h2>Entries</h2>
        {isLoading ? <p>Loading entries...</p> : entries.map(entry => (
          <div key={entry.id} style={{ border: '1px solid #444', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
            <p><strong>Observation:</strong> {entry.observation}</p>
            {entry.hypothesis && <p><strong>Hypothesis:</strong> {entry.hypothesis}</p>}
            {entry.check_plan && <p><strong>Check Plan:</strong> {entry.check_plan}</p>}
            {entry.tags && entry.tags.length > 0 && <p><strong>Tags:</strong> {entry.tags.join(', ')}</p>}
            <small>{new Date(entry.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};
