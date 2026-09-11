import json
import requests

## CONFIGS
ROSTER_FILE = "roster.json"
INJURY_URL = ("https://site.api.espn.com/apis/site/v2/sports/football/nfl/injuries")

## INJURY STATUSES
INJURY_STATUSES = {
    "QUESTIONABLE",
    "DOUBTFUL",
    "OUT",
    "INJURY_RESERVE",
    "IR"
}

## LOAD ROSTER
def load_roster():
    try:
        with open(ROSTER_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"ERROR - Could not find {ROSTER_FILE}.")
        raise
    except json.JSONDecodeError:
        print(f"ERROR - {ROSTER_FILE} contains invalid JSON")
        raise

## GET INJURY DATA
def get_injury_data():
    try:
        response = requests.get(INJURY_URL,timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"ERROR - Failed to fetch injury data: {e}")
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
                injury_lookup[player_name.lower()] = status.upper()
    return injury_lookup

## CHECK ROSTER
def check_roster(roster, injury_lookup):
    alerts = {}
    for manager, roster in roster.items():
        manager_alerts = []

        starters = roster.get("starters", [])
        for player in starters:
            player_name = player.get("name")
            team = player.get("team")
            position = player.get("position")

            if not player_name:
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
        alerts[manager] = manager_alerts
    return alerts

## CREATE MESSAGE
def create_message(alerts, week):
    week = week if week else "N/A"
    msg = [f"Week {week} Lineup Check:"]

    for manager, manager_alerts in alerts.items():
        if manager_alerts:
            msg.append(f"🚨{manager}:")

            for alert in manager_alerts:
                player = alert.get("player", "Unknown Player")
                reason = alert.get("reason", "Needs Checking")
                msg.append(f"* {player} - {reason}")
            msg.append("")
        else:
            msg.append(f"✅{manager}:")
            msg.append(f"* No players flagged")
            msg.append("")
    msg.append(
        "⚠️ Please review your lineup and make any necessary changes."
    )
    return "\n".join(msg)

def main():
    print("INFO - Checking fantasy rosters...\n")
    week = input("What week number is it? ").strip()
    print(f"INFO - Week {week} selected\n")
    rosters = load_roster()

    injury_data = get_injury_data()
    injury_lookup = build_injury_lookup(injury_data)
    alerts = check_roster(rosters, injury_lookup)

    print("INFO - Alerts generated\n")
    print("INFO - Creating message...\n")
    msg = create_message(alerts, week)

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