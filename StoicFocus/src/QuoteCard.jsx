import { useState, useEffect } from 'react';
import { stoicQuotes } from './quotes';

function QuoteCard() {
  const [index, setIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [justFavorited, setJustFavorited] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sf_favorite_quotes');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const quote = stoicQuotes[index];
  const isFavorite = favorites.includes(index);

  function next() {
    setIndex((prev) => (prev + 1) % stoicQuotes.length);
    setJustFavorited(false);
  }

  function toggleFavorite() {
    let updated;
    if (isFavorite) {
      updated = favorites.filter(i => i !== index);
    } else {
      updated = [...favorites, index];
      setJustFavorited(true);
      setTimeout(() => setJustFavorited(false), 600);
    }
    setFavorites(updated);
    localStorage.setItem('sf_favorite_quotes', JSON.stringify(updated));
  }

  return (
    <div className="quote-card">
      <div className="quote-ornament">❧</div>
      <p className="quote-text">"{quote.text || quote}"</p>
      <span className="quote-author">— {quote.author || 'Marcus Aurelius'}</span>
      <div className="quote-actions">
        <button 
          className={`quote-heart-btn ${isFavorite ? 'favorited' : ''} ${justFavorited ? 'animate-heart' : ''}`}
          onClick={toggleFavorite}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '❤' : '🤍'}
        </button>
        <button className="quote-next-btn" onClick={next}>Next Quote</button>
      </div>
    </div>
  );
}

export default QuoteCard;