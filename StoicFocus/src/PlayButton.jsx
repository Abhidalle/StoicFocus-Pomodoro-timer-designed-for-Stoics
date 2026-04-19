function PlayButton(props) {
  return (
    <button 
      {...props} 
      className="control-button"
      style={{ cursor: 'pointer' }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        width="50px" 
        height="50px"
      >
        <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
      </svg>
    </button>
   
  );
}

export default PlayButton;