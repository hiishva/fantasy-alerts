import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [screen, setScreen] = useState(0);
  const [theme, setTheme] = useState("stadium");
  const themeInitialized = useRef(false);

  useEffect(() => {
    fetch("/weekly_wrap.json")
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error("Error loading weekly wrap:", error));
  }, []);

  useEffect(() => {
    if (themeInitialized.current) {
      return;
    }
    themeInitialized.current = true;

    const themes = ["stadium", "violet", "sunset", "ice"];
    let previousTheme;

    try {
      previousTheme = window.localStorage.getItem("weekly-wrap-theme");
    } catch (error) {
      console.warn("Unable to read the previous weekly-wrap theme:", error);
    }

    const availableThemes = themes.filter((candidate) => candidate !== previousTheme);
    const nextTheme =
      availableThemes[Math.floor(Math.random() * availableThemes.length)];

    setTheme(nextTheme);

    try {
      window.localStorage.setItem("weekly-wrap-theme", nextTheme);
    } catch (error) {
      console.warn("Unable to save the weekly-wrap theme:", error);
    }
  }, []);

  const appClassName = `app theme-${theme}`;

  if (!data) {
    return (
      <div className={appClassName}>
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
  const hasTopScorers = data.topScorers?.length > 0;
  const teamStartScreen = hasTopScorers ? 5 : 4;

  /*
   * SCREEN 0 — INTRO
   */
  if (screen === 0) {
    return (
      <div className={appClassName}>
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
      <div className={appClassName}>
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
      <div className={appClassName}>
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
   * SCREEN 3 — TOP SCORERS
   */
  if (hasTopScorers && screen === 3) {
    return (
      <div className={appClassName}>
        <div className="card screen screen--top-scorers">
          <p className="eyebrow">WEEK {data.week} LEADERBOARD</p>

          <h2 className="screen-title">TOP 5 PLAYERS</h2>

          <div className="top-scorers">
            {data.topScorers.slice(0, 5).map((scorer, index) => (
              <div
                className="scorer-row"
                key={`${scorer.player}-${scorer.team}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="scorer-rank">{index + 1}</div>

                {scorer.headshot && (
                  <img
                    className="scorer-headshot"
                    src={scorer.headshot}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                )}

                <div className="scorer-info">
                  <div className="scorer-name">{scorer.player}</div>
                  <div className="scorer-team">{scorer.team}</div>
                </div>

                <div className="scorer-points">
                  {scorer.points.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <button className="start-button" onClick={nextScreen}>
            TEAM CHECKS →
          </button>
        </div>
      </div>
    );
  }

  /*
   * LINEUP INTRO
   */
  if (screen === (hasTopScorers ? 4 : 3)) {
    return (
      <div className={appClassName}>
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
   * INDIVIDUAL TEAMS
   */
  if (
    screen >= teamStartScreen &&
    screen < teamStartScreen + data.teams.length
  ) {
    const teamIndex = screen - teamStartScreen;
    const team = data.teams[teamIndex];

    if (!team) {
      return null;
    }

    const totalTeamAlerts =
      team.alerts.length + team.byeCount;

    return (
      <div className={appClassName}>
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
    <div className={appClassName}>
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