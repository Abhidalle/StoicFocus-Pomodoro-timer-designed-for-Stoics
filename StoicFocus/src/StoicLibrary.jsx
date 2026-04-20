import { useState } from 'react';
import { stoicQuotes } from './quotes';

function StoicLibrary() {
  const [search, setSearch] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  // Get unique authors with quote counts
  const authorStats = [...new Set(stoicQuotes.map(q => q.author || 'Unknown'))].map(author => ({
    name: author,
    count: stoicQuotes.filter(q => (q.author || 'Unknown') === author).length
  })).sort((a, b) => b.count - a.count);

  // Filter quotes based on search and selected author
  const filtered = stoicQuotes.filter(q => {
    const author = q.author || 'Unknown';
    const matchesAuthor = !selectedAuthor || author === selectedAuthor;
    const text = (q.text || q).toLowerCase();
    const searchLower = search.toLowerCase();
    const matchesSearch = search.trim() === '' || text.includes(searchLower) || author.toLowerCase().includes(searchLower);
    return matchesAuthor && matchesSearch;
  });

  return (
    <div className="library-page">
      <h2 className="library-title">Stoic Library</h2>
      <p className="library-subtitle">Wisdom from the ancients, for the present.</p>
      
      <input
        className="library-search"
        type="text"
        placeholder="Search quotes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        autoFocus
      />

      <div className="library-authors">
        <button 
          className={`author-tag ${!selectedAuthor ? 'author-tag-active' : ''}`}
          onClick={() => setSelectedAuthor(null)}
        >
          All Authors ({stoicQuotes.length})
        </button>
        {authorStats.map(author => (
          <button
            key={author.name}
            className={`author-tag ${selectedAuthor === author.name ? 'author-tag-active' : ''}`}
            onClick={() => setSelectedAuthor(selectedAuthor === author.name ? null : author.name)}
          >
            {author.name} ({author.count})
          </button>
        ))}
      </div>

      <div className="library-grid">
        {filtered.length > 0 ? (
          filtered.map((q, i) => (
            <div key={i} className="library-card">
              <p className="library-quote">"{q.text || q}"</p>
              <span className="library-author">— {q.author || 'Unknown'}</span>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: 'var(--cream-dim)', fontSize: '1.1rem' }}>
            No quotes found for "{search}"
          </div>
        )}
      </div>
    </div>
  );
}

export default StoicLibrary;