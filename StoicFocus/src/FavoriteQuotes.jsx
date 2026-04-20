import { useState, useEffect } from 'react';
import { stoicQuotes } from './quotes';

function FavoriteQuotes() {
  const [favoriteIndices, setFavoriteIndices] = useState([]);
  const [removingIndex, setRemovingIndex] = useState(null);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sf_favorite_quotes');
    if (saved) {
      setFavoriteIndices(JSON.parse(saved));
    }
  }, []);

  const favoriteQuotes = favoriteIndices
    .map(i => ({ index: i, quote: stoicQuotes[i] }))
    .filter(q => q.quote); // Filter out any invalid indices

  function removeFavorite(index) {
    setRemovingIndex(index);
    setTimeout(() => {
      const updated = favoriteIndices.filter(i => i !== index);
      setFavoriteIndices(updated);
      localStorage.setItem('sf_favorite_quotes', JSON.stringify(updated));
      setRemovingIndex(null);
    }, 300);
  }

  function clearAllFavorites() {
    if (window.confirm('Are you sure you want to clear all favorites?')) {
      setFavoriteIndices([]);
      localStorage.setItem('sf_favorite_quotes', JSON.stringify([]));
    }
  }

  return (
    <div className="favorites-page">
      <h2 className="favorites-title">Favorite Quotes</h2>
      <p className="favorites-subtitle">Your collection of inspiration.</p>
      
      {favoriteQuotes.length === 0 ? (
        <div className="favorites-empty">
          <p className="empty-icon">🤍</p>
          <p className="empty-message">No favorites yet. Start adding quotes from the Stoic Library or during breaks!</p>
        </div>
      ) : (
        <>
          <p className="favorites-count">{favoriteQuotes.length} {favoriteQuotes.length === 1 ? 'quote' : 'quotes'} saved</p>
          <div className="favorites-grid">
            {favoriteQuotes.map(({ index, quote }) => (
              <div 
                key={index} 
                className={`favorite-card ${removingIndex === index ? 'removing' : ''}`}
              >
                <p className="favorite-quote">"{quote.text || quote}"</p>
                <span className="favorite-author">— {quote.author || 'Unknown'}</span>
                <button 
                  className="favorite-remove-btn"
                  onClick={() => removeFavorite(index)}
                  title="Remove from favorites"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button className="btn-ghost" onClick={clearAllFavorites}>Clear All Favorites</button>
        </>
      )}
    </div>
  );
}

export default FavoriteQuotes;
