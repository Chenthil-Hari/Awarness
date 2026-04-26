'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import ScenarioCard from '../components/ScenarioCard';
import SimulationViewer from '../components/SimulationViewer';
import { scenarios } from '../data/scenarios';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ScenariosPage() {
  const { data: session } = useSession();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredScenarios = scenarios.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'All' || s.domain === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="container" style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
      <Navbar />
      
      <div style={{ marginTop: '3rem', marginBottom: '3rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>All <span className="gradient-text">Scenarios</span></h1>
        <p style={{ color: 'var(--text-secondary)' }}>Browse our complete library of real-world simulations.</p>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search scenarios..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.8rem 1rem 0.8rem 3rem', 
              background: 'var(--bg-tertiary)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              outline: 'none'
            }} 
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['All', 'Cybersecurity', 'Financial Literacy', 'Life Skills'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.8rem 1.2rem',
                borderRadius: 'var(--radius-md)',
                background: filter === f ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: filter === f ? 'white' : 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid var(--glass-border)',
                transition: 'all 0.2s'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', 
        gap: '2rem' 
      }}>
        {filteredScenarios.map((scenario) => (
          <ScenarioCard 
            key={scenario.id} 
            scenario={scenario} 
            onSelect={(s) => setSelectedScenario(s)} 
          />
        ))}
      </div>

      {filteredScenarios.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>No scenarios found matching your criteria.</p>
        </div>
      )}

      {selectedScenario && (
        <SimulationViewer 
          scenario={selectedScenario} 
          onExit={() => setSelectedScenario(null)} 
        />
      )}
    </main>
  );
}
