'use client';
import { useState, FormEvent } from 'react';
type SimType = 'physics' | 'hexagon' | 'montecarlo';
const SimRunner = ({ simType }: { simType: SimType }) => {
    const [params, setParams] = useState<any>({});
    const [results, setResults] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault(); setIsLoading(true); setResults(null); setSaveStatus('');
        try {
            const response = await fetch(`/api/v1/sim/${simType}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
            if (!response.ok) throw new Error('Simulation failed');
            const data = await response.json();
            setResults(data);
        } catch (error) { setResults({ error: 'Failed to run simulation.' }); } finally { setIsLoading(false); }
    };
    const handleSaveToDiary = async () => {
        if (!results || results.error) return; setSaveStatus('Saving...');
        try {
            const observation = `Ran a ''${simType}'' simulation with params: ${JSON.stringify(params)}. Results: ${JSON.stringify(results)}`;
            const response = await fetch('/api/v1/journal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ observation, tags: ['simulation', simType] }) });
            if (!response.ok) throw new Error('Failed to save');
            setSaveStatus('Saved to Diary!');
        } catch (error) { setSaveStatus('Error saving.'); }
    }
    const renderParams = () => {
        switch (simType) {
            case 'physics': return (<><label>Gravity: <input type="number" defaultValue={9.8} onChange={e => setParams({...params, gravity: parseFloat(e.target.value) || 9.8})} /></label><label>Friction: <input type="number" defaultValue={0.1} onChange={e => setParams({...params, friction: parseFloat(e.target.value) || 0.1})} /></label></>);
            case 'hexagon': return (<><label>Ball Speed: <input type="number" defaultValue={5} onChange={e => setParams({...params, ball_speed: parseFloat(e.target.value) || 5})} /></label><label>Rotation Speed: <input type="number" defaultValue={1.2} onChange={e => setParams({...params, rotation_speed: parseFloat(e.target.value) || 1.2})} /></label></>);
            case 'montecarlo': return (<><label>Simulations: <input type="number" defaultValue={10000} onChange={e => setParams({...params, simulations: parseInt(e.target.value) || 10000})} /></label><label>Investment: <input type="number" defaultValue={1000} onChange={e => setParams({...params, investment: parseFloat(e.target.value) || 1000})} /></label></>);
        }
    }
    return (
        <div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {renderParams()}
                <button type="submit" disabled={isLoading}>{isLoading ? 'Running...' : 'Run Simulation'}</button>
            </form>
            {results && (
                <div>
                    <h3>Results:</h3>
                    <pre style={{ backgroundColor: '#222', padding: '10px', borderRadius: '5px', whiteSpace: 'pre-wrap' }}>{JSON.stringify(results, null, 2)}</pre>
                    {!results.error && <button onClick={handleSaveToDiary} disabled={!!saveStatus}>{saveStatus || 'Save to Diary'}</button>}
                </div>
            )}
        </div>
    )
}
export const SimLabInterface = () => {
  const [activeTab, setActiveTab] = useState<SimType>('physics');
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('physics')} disabled={activeTab === 'physics'}>Physics</button>
        <button onClick={() => setActiveTab('hexagon')} disabled={activeTab === 'hexagon'}>Hexagon</button>
        <button onClick={() => setActiveTab('montecarlo')} disabled={activeTab === 'montecarlo'}>Monte Carlo</button>
      </div>
      <div><SimRunner simType={activeTab} /></div>
    </div>
  );
};
