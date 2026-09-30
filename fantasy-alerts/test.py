import os
import requests
from dotenv import load_dotenv

load_dotenv()

LEAGUE_ID = os.getenv("ESPN_LEAGUE_ID")
ESPN_SWID = os.getenv("ESPN_SWID")
ESPN_S2 = os.getenv("ESPN_S2")

YEAR = 2026

URL = (
    f"https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/"
    f"seasons/{YEAR}/segments/0/leagues/{LEAGUE_ID}"
)

def get_league_data():
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

    response = requests.get(
        URL,
        cookies=cookies,
        headers=headers,
        params={
            "view": "mTeam"
        },
        timeout=10
    )

    response.raise_for_status()

    return response.json()

def main():
    print("INFO - Connecting to ESPN...\n")
    try:
        data = get_league_data()
        print("INFO - Successfully connected!\n")
        print("League Teams:")

        for team in data.get("teams", []):
            team_name = team.get("name")
            team_id = team.get("id")

            print(f"- {team_name} (ID: {team_id})")
    except requests.HTTPError as error:
        print("ERROR - ESPN rejected the requests")
        print(error)
    except requests.RequestException as error:
        print("ERROR - Could not connect to ESPN")
        print(error)
if __name__ == "__main__":
    main()
