import "./App.css";

function App() {
  return(
    <div className="wrap">
      <main className="card">
        <div className="week-label">WEEK 4</div>

        <div className="football">🏈</div>

        <h1>
          FANTASY
          <br />
          WEEKLY
          <br />
          WRAPPED
        </h1>

        <p className="subtitle">
          Your league's week, wrapped.
        </p>
        <button className="start-button">
          TAP TO ENTER →
        </button>

        <div className="swipe-hint">
          Swipe. Tap. Judge your friends.
        </div>
      </main>
    </div>
  );
}
export default App;