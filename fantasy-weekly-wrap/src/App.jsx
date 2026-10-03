import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [screen, setScreen] = useState(0);

  useEffect(() => {
    fetch("/weekly_wrap.json")
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error("Error loading weekly wrap:", error));
  }, []);

  if (!data) {
    return (
      <div className="app">
        <div className="card screen screen--loading">
          <div className="football">🏈</div>
          <h1>LOADING...</h1>
          <p>Getting this week's fantasy chaos together.</p>
        </div>
      </div>
    );
  }

  const nextScreen = () => {
    setScreen((current) => current + 1);
  };

  /*
   * SCREEN 0 — INTRO
   */
  if (screen === 0) {
    return (
      <div className="app">
        <div className="card screen screen--intro">
          <div className="football">🏈</div>

          <h1 className="hero-title">
            <span>FANTASY</span>
            <span className="accent-text">WEEKLY</span>
            <span>WRAPPED</span>
          </h1>

          <p className="week-label">
            WEEK {data.week}
          </p>

          <p>
            Four teams.<br />
            One league.<br />
            Way too much confidence.
          </p>

          <button className="start-button" onClick={nextScreen}>
            LET'S GO →
          </button>
        </div>
      </div>
    );
  }

  /*
   * SCREEN 1 — WEEK IN NUMBERS
   */
  if (screen === 1) {
    return (
      <div className="app">
        <div className="card screen screen--stats">
          <p className="eyebrow">THE WEEK IN NUMBERS</p>

          <h2 className="screen-title">THE DAMAGE</h2>

          <div className="stats-grid">
            <div className="stat">
              <div className="big-number">{data.teamsChecked}</div>
              <div className="stat-label">TEAMS</div>
            </div>

            <div className="stat">
              <div className="big-number">{data.totalAlerts}</div>
              <div className="stat-label">ALERTS</div>
            </div>

            <div className="stat">
              <div className="big-number">{data.injuryAlerts}</div>
              <div className="stat-label">INJURY</div>
            </div>

            <div className="stat">
              <div className="big-number">{data.byeAlerts}</div>
              <div className="stat-label">BYE</div>
            </div>
          </div>

          <button className="start-button" onClick={nextScreen}>
            SHOW ME →
          </button>
        </div>
      </div>
    );
  }

  /*
   * SCREEN 2 — STANDINGS
   */
  if (screen === 2) {
    return (
      <div className="app">
        <div className="card screen screen--standings">
          <p className="eyebrow">CURRENT STANDINGS</p>

          <h2 className="screen-title">WHO'S ON TOP?</h2>

          <div className="standings">
            {data.standings.map((team, index) => (
              <div
                className="standing-row"
                key={team.team}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="rank">
                  {team.rank}
                </div>

                <div className="standing-team">
                  <div className="standing-name">
                    {team.team}
                  </div>

                  <div className="standing-record">
                    {team.wins}-{team.losses}
                    {team.ties ? `-${team.ties}` : ""}
                  </div>
                </div>

                <div className="standing-points">
                  {team.points.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <button className="start-button" onClick={nextScreen}>
            KEEP GOING →
          </button>
        </div>
      </div>
    );
  }

  /*
   * SCREEN 3 — LINEUP INTRO
   */
  if (screen === 3) {
    return (
      <div className="app">
        <div className="card screen screen--lineup">
          <div className="lineup-icon">🚨</div>

          <p className="eyebrow">LINEUP CHECK</p>

          <h2 className="screen-title">
            WHO NEEDS TO
            <br />
            DOUBLE CHECK?
          </h2>

          <p>
            Let's see who has players
            <br />
            that need attention.
          </p>

          <button className="start-button" onClick={nextScreen}>
            SHOW ME →
          </button>
        </div>
      </div>
    );
  }

  /*
   * SCREENS 4–7 — INDIVIDUAL TEAMS
   */
  if (screen >= 4 && screen <= 7) {
    const teamIndex = screen - 4;
    const team = data.teams[teamIndex];

    if (!team) {
      return null;
    }

    const totalTeamAlerts =
      team.alerts.length + team.byeCount;

    return (
      <div className="app">
        <div className="card screen screen--team">
          <p className="eyebrow">
            TEAM {teamIndex + 1} OF {data.teams.length}
          </p>

          <h2 className="screen-title">{team.name}</h2>

          {totalTeamAlerts === 0 ? (
            <div className="no-alerts">
              <div className="clean-icon">✅</div>

              <h3>LOOKS GOOD</h3>

              <p>
                No flagged starters this week.
              </p>
            </div>
          ) : (
            <>
              <p className="alert-summary">
                {totalTeamAlerts}{" "}
                {totalTeamAlerts === 1 ? "THING" : "THINGS"}{" "}
                TO CHECK
              </p>

              <div className="alerts">
                {team.alerts.map((alert, index) => (
                  <div
                    className="alert-item alert-item--injury"
                    key={`${alert.player}-${index}`}
                    style={{
                      animationDelay: `${index * 0.12}s`,
                    }}
                  >
                    <div className="alert-icon" aria-hidden="true">!</div>

                    <div className="alert-player-info">
                      {alert.headshot && (
                        <img
                          className="player-headshot"
                          src={alert.headshot}
                          alt={alert.player}
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      )}

                      <div>
                        <div className="alert-player">
                          {alert.player}
                        </div>

                        <div className="alert-details">
                          {alert.position} • {alert.reason}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {team.byeCount > 0 && (
                  <div
                    className="alert-item alert-item--bye"
                    style={{
                      animationDelay: `${
                        team.alerts.length * 0.12
                      }s`,
                    }}
                  >
                    <div className="alert-icon" aria-hidden="true">BYE</div>

                    <div>
                      <div className="alert-player">
                        {team.byeCount}{" "}
                        {team.byeCount === 1
                          ? "STARTER"
                          : "STARTERS"}{" "}
                        ON BYE
                      </div>

                      <div className="alert-details">
                        BYE WEEK
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <button className="start-button" onClick={nextScreen}>
            NEXT →
          </button>
        </div>
      </div>
    );
  }

  /*
   * FINAL SCREEN
   */
  return (
    <div className="app">
      <div className="card screen screen--final">
        <div className="football">🏈</div>

        <p className="eyebrow">
          WEEK {data.week}
        </p>

        <h1>
          THAT'S
          <br />
          A WRAP.
        </h1>

        <p>
          Good luck this week 👀
        </p>

        <button className="start-button" onClick={() => setScreen(0)}>
          REPLAY ↻
        </button>
      </div>
    </div>
  );
}

export default App;