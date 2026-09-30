import json
import requests
import os
from dotenv import load_dotenv

load_dotenv()

## CONFIGS
# ROSTER_FILE = "roster.json"

LEAGUE_ID = os.getenv("ESPN_LEAGUE_ID")
ESPN_SWID = os.getenv("ESPN_SWID")
ESPN_S2 = os.getenv("ESPN_S2")
ESPN_YEAR = 2026

INJURY_URL = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/injuries"
SCHEDULE_URL = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard"
ESPN_URL = (
    f"https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/"
    f"seasons/{ESPN_YEAR}/segments/0/leagues/{LEAGUE_ID}"
)

## INJURY STATUSES
INJURY_STATUSES = {
    "QUESTIONABLE",
    "DOUBTFUL",
    "OUT",
    "INJURED_RESERVE",
    "IR"
}

NFL_TEAM_ABBREVIATIONS = {
    1: "ATL", 2: "BUF", 3: "CHI", 4: "CIN", 5: "CLE",
    6: "DAL", 7: "DEN", 8: "DET", 9: "GB", 10: "TEN",
    11: "IND", 12: "KC", 13: "LV", 14: "LAR", 15: "MIA",
    16: "MIN", 17: "NE", 18: "NO", 19: "NYG", 20: "NYJ",
    21: "PHI", 22: "ARI", 23: "PIT", 24: "LAC", 25: "SF",
    26: "SEA", 27: "TB", 28: "WSH", 29: "CAR", 30: "JAX",
    33: "BAL", 34: "HOU"
}

## LOAD ROSTER
def get_espn_league_data():
    cookies = {
        "SWID": ESPN_SWID,
        "espn_s2": ESPN_S2
    }

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/140.0.0.0 Safari/537.36"
        )
    }

    try:
        response = requests.get(
            ESPN_URL,
            cookies=cookies,
            headers=headers,
            params={
                "view": ["mTeam", "mRoster"]
            },
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException as err:
        print(f"ERROR - Could not retrieve ESPN league data: {err}")
        return {}

def build_rosters(data):
    rosters = {}
    for team in data.get("teams", []):
        team_name = team.get("name", "Unknown Team")
        starters = []
        bench = []
        ir_players = []

        roster_entries = team.get("roster", {}).get("entries", [])
        for entry in roster_entries:
            player_pool_entry = entry.get("playerPoolEntry", {})
            player = player_pool_entry.get("player", {})
            player_name = player.get("fullName")
            pro_team = NFL_TEAM_ABBREVIATIONS.get(player.get("proTeamId"))
            position_id = player.get("defaultPositionId")

            if not player_name:
                continue

            player_info = {
                "name": player_name,
                "team": pro_team,
                "position": position_id
            }

            lineup_slot = entry.get("lineupSlotId")

            # ESPN lineupSlotId 20 = bench, 21 = injured reserve
            if lineup_slot == 20:
                bench.append(player_info)
            elif lineup_slot == 21:
                ir_players.append(player_info)

            else:
                starters.append(player_info)

        rosters[team_name] = {
            "starters": starters,
            "bench": bench,
            "ir": ir_players
        }

    return rosters

def build_standings(data):
    standings = []

    for team in data.get("teams", []):
        record = team.get("record", {}).get("overall", {})
        standings.append({
            "team": team.get("name", "Unknown Team").strip(),
            "wins": record.get("wins", 0),
            "losses": record.get("losses", 0),
            "ties": record.get("ties", 0),
            "points": team.get("points", 0)
        })

    standings.sort(
        key=lambda team: (team["wins"], team["points"]),
        reverse=True
    )

    return standings

# def load_roster():
#     try:
#         with open(ROSTER_FILE, "r") as f:
#             return json.load(f)
#     except FileNotFoundError:
#         print(f"ERROR - Could not find {ROSTER_FILE}.")
#         raise
#     except json.JSONDecodeError:
#         print(f"ERROR - {ROSTER_FILE} contains invalid JSON")
#         raise

## GET INJURY DATA
def get_injury_data():
    try:
        response = requests.get(INJURY_URL,timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"ERROR - Failed to fetch injury data: {e}")
        return {}

## GET BYE WEEK DATA
def get_schedule_data(week=1):
    try:
        response = requests.get(
            SCHEDULE_URL,
            params={
                "limit": 1000,
                "dates": 2026,
                "seasontype": 2,
                "week": week
            },
            timeout=10
        )

        response.raise_for_status()
        return response.json()
    except requests.RequestException as err:
        print(f"ERROR - Could not retrieve schedule data: {err}")
        return {}
## INJURY LOOKUP
def build_injury_lookup(data):
    injury_lookup = {}
    for team in data.get("injuries", []):
        for injury in team.get("injuries", []):
            athlete = injury.get("athlete", {})
            player_name = athlete.get("displayName")
            status = injury.get("status", "")

            if player_name and status:
                normalized_status = status.upper().replace(" ", "_")
                injury_lookup[player_name.lower()] = normalized_status
    return injury_lookup

## LIST OF TEAMS PLAYING
def build_teams_playing(schedule_data):
    teams_playing = set()
    for event in schedule_data.get("events", []):
        for competition in event.get("competitions", []):
            for competitor in competition.get("competitors", []):
                team = competitor.get("team", {})
                abbr = team.get("abbreviation")
                if abbr:
                    teams_playing.add(abbr.upper())
    return teams_playing


## CHECK ROSTER
def check_roster(roster, injury_lookup, teams_playing):
    alerts = {}
    for manager, roster in roster.items():
        manager_alerts = []
        bye_count = 0

        starters = roster.get("starters", [])
        for player in starters:
            player_name = player.get("name")
            team = player.get("team")
            position = player.get("position")

            if not player_name or not team:
                continue
            team = team.upper()

            ### CHECK BYE WEEK
            if team not in teams_playing:
                manager_alerts.append({
                    "player": player_name,
                    "team": team,
                    "position": position,
                    "reason": "BYE WEEK"
                })
                bye_count += 1
                continue

            ### CHECK INJURY
            injury_status = injury_lookup.get(
                player_name.lower()
            )

            if injury_status in INJURY_STATUSES:
                manager_alerts.append({
                    "player": player_name,
                    "team": team,
                    "position": position,
                    "reason": f"INJURY: {injury_status}"
                })
        alerts[manager] = {
            "alerts": manager_alerts,
            "bye_count": bye_count
        }
    return alerts

## CREATE WEEKLY WRAPPED
def create_weekly_wrap_data(alerts, week, standings):
    total_alerts = 0
    injury_alerts = 0
    bye_alerts = 0
    teams = []

    for manager, manager_data in alerts.items():
        manager_alerts = manager_data["alerts"]
        bye_count = manager_data["bye_count"]

        total_alerts += len(manager_alerts)
        bye_alerts += bye_count

        team_alerts = []

        for alert in manager_alerts:
            reason = alert["reason"]

            if reason.startswith("INJURY"):
                injury_alerts += 1
            team_alerts.append({
                "player": alert["player"],
                "team": alert["team"],
                "position": alert["position"],
                "reason": reason
            })
        teams.append({
            "name": manager,
            "alerts": team_alerts,
            "byeCount": bye_count
        })

    ## Add standings info
    standings_data = []

    for rank, team in enumerate(standings, start=1):
        standings_data.append({
            "rank": rank,
            "team": team["team"],
            "wins": team["wins"],
            "losses": team["losses"],
            "ties": team["ties"],
            "points": team["points"]

        })
    return{
        "week": int(week),
        "teamsChecked": len(teams),
        "totalAlerts": total_alerts,
        "injuryAlerts": injury_alerts,
        "byeAlerts": bye_alerts,
        "standings": standings_data,
        "teams": teams
    }


## SAVE TO JSON
def save_weekly_wrap(data):
    with open("weekly_wrap.json", "w") as f:
        json.dump(data, f, indent=2)
    print("INFO - weekly_wrap.json created")

## CREATE MESSAGE
def create_message(alerts, week, standings):
    week = week if week else "N/A"
    msg = [f"Week {week} Lineup Check:"]

    for manager, manager_data in alerts.items():
        manager_alerts = manager_data["alerts"]
        bye_count = manager_data["bye_count"]

        if manager_alerts:
            msg.append(f"🚨{manager}:")

            for alert in manager_alerts:
                player = alert.get("player", "Unknown Player")
                reason = alert.get("reason", "Needs Checking")
                msg.append(f"* {player} - {reason}")
            
        else:
            msg.append(f"✅{manager}:")
            msg.append(f"* No players flagged")
            
        if bye_count == 0:
            msg.append("* No starters on bye week")
        else:
            msg.append(f"* {bye_count} starter(s) on bye week")
        msg.append("")

    msg.append("League Standings:")
    for rank, team in enumerate(standings, start=1):
        record = f"{team['wins']}-{team['losses']}"
        if team["ties"]:
            record += f"-{team['ties']}"
        msg.append(
            f"{rank}. {team['team']} ({record}) - "
            f"{team['points']:.2f} points"
        )

    msg.append("")
    msg.append(
        "⚠️ Please review your lineup and make any necessary changes."
    )
    return "\n".join(msg)

def main():
    print("INFO - Connecting to ESPN..\n")
    espn_data = get_espn_league_data()
    if not espn_data:
        print("ERROR - Could not retireve ESPN League data")
        return
    rosters = build_rosters(espn_data)
    standings = build_standings(espn_data)
    print("INFO - ESPN rosters retrieved\n")
    print("INFO - ESPN roster players:")

    for manager, roster in rosters.items():
        print(f"\n{manager}:")

        for lineup, players in roster.items():
            lineup_label = "IR" if lineup == "ir" else lineup.title()
            print(f"  {lineup_label}:")
            for player in players:
                print(
                    f"    - {player['name']} | "
                    f"{player['team']} | position {player['position']}"
                )
    print()

    week = input("What week number is it? ").strip()
    print(f"\nINFO - Week {week} selected\n")

    ### Injury data
    injury_data = get_injury_data()
    injury_lookup = build_injury_lookup(injury_data)

    ### Schedule data
    schedule_data = get_schedule_data(week)
    teams_playing = build_teams_playing(schedule_data)
    alerts = check_roster(
        rosters,
        injury_lookup,
        teams_playing
    )

    print("INFO - Alerts generated\n")

    ## CREATE DATA FOR WEEKLY WRAP
    wrap_data = create_weekly_wrap_data(alerts, week, standings)
    save_weekly_wrap(wrap_data)

    print()
    print("INFO - Creating message...\n")
    msg = create_message(alerts, week, standings)

    ## DISPLAY MESSAGE
    print("=" * 50)
    print("COPY/PASTE MESSAGE")
    print("=" * 50)
    print()
    print(msg)
    print()
    print("=" * 50)

if __name__ == "__main__":
    main()