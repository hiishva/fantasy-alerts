import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [screen, setScreen] = useState(0);

  useEffect(() => {
    fetch("/weekly_wrap.json")
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) =>
        console.error("Could not load weekly wrap:", error)
      );
  }, []);

  if (!data) {
    return (
      <div className="wrap">
        <main className="card">
          <div className="loading">LOADING YOUR WEEK...</div>
        </main>
      </div>
    );
  }

  // SCREEN 1 - INTRO
  if (screen === 0) {
    return (
      <div className="wrap">
        <main className="card">
          <div className="week-label">WEEK {data.week}</div>

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

          <button
            className="start-button"
            onClick={() => setScreen(1)}
          >
            TAP TO ENTER →
          </button>

          <div className="swipe-hint">
            Tap. Swipe. Judge your friends.
          </div>
        </main>
      </div>
    );
  }
  
  // SCREEN 2 - SNAPSHOT
  if (screen === 1){
    return (
      <div className="wrap">
        <main className="card snapshot-card">
          <div className="week-label">WEEK {data.week}</div>

          <div className="snapshot-label">
            YOUR WEEK IN NUMBERS
          </div>

          <div className="big-number">
            {data.teamsChecked}
          </div>

          <div className="big-text">
            TEAMS
            <br />
            CHECKED
          </div>

          <div className="stats">
            <div className="stat">
              <span>{data.totalAlerts}</span>
              <small> THINGS TO<br />DOUBLE-CHECK</small>
            </div>

            <div className="stat">
              <span>{data.injuryAlerts}</span>
              <small>INJURY<br />FLAGS</small>
            </div>

            <div className="stat">
              <span>{data.byeAlerts}</span>
              <small>BYE<br />FLAGS</small>
            </div>
          </div>

          <button
            className="start-button"
            onClick={() => setScreen(2)}
          >
            SEE STANDINGS →
          </button>
        </main>
      </div>
    );
  }

  // SCREEN 3 - STANDINGS
  if (screen === 2){
    return (
      <div className="wrap">
        <main className="card standings-card">
          <div className="week-label">
            WEEK {data.week}
          </div>

          <div className="standings-header">
            <div className="snapshot-label">
              SO... HOW'S THE LEAGUE LOOKING?
            </div>
            <h2>LET'S <br /> SEE.</h2>
            <p>The standings after Week {data.week}. </p>
          </div>
          <div className="standings-list">
            {data.standings.map((team) => (
              <div className={`standing-row rank-${team.rank}`} key={team.team}>
                <div className="rank">
                  #{team.rank}
                </div>
                <div className="team-info">
                  <div className="team-name">
                    {team.team}
                  </div>

                  <div className="record">
                    {team.wins} - {team.losses}
                    {team.ties > 0 && `-${team.ties}`}
                    {" • "}
                    {team.points.toFixed(2)} PTS
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="start-button"
            onClick={() => setScreen(3)}
          >
            CHECK THE LINEUPS →
          </button>
        </main>
      </div>
    );
  }

  //SCREEN 4 - TEMP
  return (
    <div className="wrap">
      <main className="card">
        <div className="football">🔍</div>
        <h1>LINEUP <br/> CHECK</h1>

        <p className="subtitle">
          Coming next...
        </p>

        <button
          className="start-button"
          onClick={() => setScreen(2)}
        >
          ← BACK
        </button>
      </main>
    </div>
  );
}

export default App;