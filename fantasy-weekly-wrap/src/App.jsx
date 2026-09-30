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
  if (screen === 3){
    return (
      <div className="wrap">
        <main className="card lineup-intro-card">
          <div className="week-label">
            WEEK {data.week}
          </div>
          <div className="lineup-icon">🔍</div>
          <div classNam="snapshot-label">LINEUPCHECK</div>

          <h1>WHO NEEDS <br/> TO <br/> DOUBLE CHECK?</h1>

          <p className="subtitle">
            {data.totalAlerts === 0 
              ? "No flags this week."
              : `${data.totalAlerts} thing${data.totalAlerts === 1 ? "" : "s"}
              to double check across the league.`}
          </p>

          <button
            className="start-button"
            onClick={() => setScreen(4)}
          >
            SHOW ME →
          </button>
        </main>
      </div>
    );
  }
  if (screen === 4){
    const team = data.teams[0];
    return (
      <div className="wrap">
        <main className="card team-card">
          <div className="week-label">
            {team.name}
          </div>

          <div className="team-alert-count">
            {team.alerts.length + team.byeCount}
          </div>

          <div className="snapshot-label">
            THNGS TO DOUBLE CHECK
          </div>
          {team.alerts.length === 0 && team.byeCount == 0 ? (
            <div className="clear-message">
              <div className="clear-icon">✅</div>

              <h2>LOOKING CLEAR</h2>
              <p>No injury or bye flags for this team's starters.</p>
            </div>
          ) : (
            <div className="alert-list">
              {team.alerts.map((alert, index) => (
                <div className="alert-item" key={index}>
                  <div className="alert-icon">⚠️</div>
                  <div>
                    <div className="alert-player">
                      {alert.player}
                    </div>

                    <div className="alert-details">
                      {alert.position} • {alert.reason}
                    </div>
                  </div>
                </div>
              ))}

              {team.byeCount > 0 && (
                <div className="alert-item">
                  <div className="alert-icon">🏖️</div>
                  <div>
                    <div className="alert-player">
                      {team.byeCount} BYE WEEK
                      {team.byeCount > 1 ? "S" : ""}
                    </div>

                    <div className="alert-details">
                      STARTER{team.byeCount > 1 ? "S" : ""} ON BYE
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            className="start-button"
            onClick={() => setScreen(5)}
          >
            NEXT TEAM →
          </button>
        </main>
      </div>
    );
  };
}
export default App;