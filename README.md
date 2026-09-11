# Fantasy Alerts

![Python](https://img.shields.io/badge/Python-3.x-blue?logo=python)
![Requests](https://img.shields.io/badge/Requests-HTTP%20Library-green)

Fantasy Alerts checks fantasy football starters against current NFL injury data from ESPN and creates a copy-and-paste lineup message.

## Features

- Loads fantasy rosters from `roster.json`
- Prompts for the fantasy football week number
- Fetches NFL injury data from ESPN
- Fetches the weekly NFL schedule from ESPN to check for team bye weeks
- Flags starters listed as `QUESTIONABLE`, `DOUBTFUL`, `OUT`, `INJURY_RESERVE`, or `IR`
- Flags starters whose team is on a bye week
- Creates a lineup alert message for each manager

## File Structure

```text
fantasy-alerts/
├── main.py
├── roster.json
├── requirements.txt
└── README.md
```

- `main.py` - Application logic and output generation
- `roster.json` - Fantasy managers, starters, and bench players
- `requirements.txt` - Python dependencies
- `README.md` - Project documentation

## Requirements

- Python 3.x
- An internet connection for the ESPN injury API

## Installation

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the project dependency:

```bash
pip install -r requirements.txt
```

## Roster Format

Roster information is stored in `roster.json`. Each manager has a `starters` list and a `bench` list:

```json
{
  "Manager Name": {
    "starters": [
      {
        "name": "Player Name",
        "team": "TEAM",
        "position": "QB"
      }
    ],
    "bench": [
      {
        "name": "Bench Player",
        "team": "TEAM",
        "position": "RB"
      }
    ]
  }
}
```

Player names should match ESPN's `displayName` values. The current program checks `starters`; bench players are stored for roster reference but are not currently checked.

## How to Run

From the project directory, run:

```bash
python3 main.py
```

Enter the week number when prompted:

```text
What week number is it? 3
```

## Example Output

```text
INFO - Checking fantasy rosters...

What week number is it? 3
INFO - Week 3 selected

INFO - Alerts generated

INFO - Creating message...

==================================================
COPY/PASTE MESSAGE
==================================================

Week 3 Lineup Check:
🚨Manager Name:
* Player Name - INJURY: QUESTIONABLE
* Another Player - BYE WEEK
* 1 starter(s) on bye week

✅Another Manager:
* No players flagged
* No starters on bye week

⚠️ Please review your lineup and make any necessary changes.

==================================================
```

## Notes

- Injury data comes from ESPN's NFL injuries API.
- Bye-week data comes from ESPN's NFL scoreboard API.
- A starter is marked `BYE WEEK` when their team does not appear in the schedule returned by ESPN.
- The current schedule request is configured for the 2026 regular season, week 1. Update the `dates`, `seasontype`, and `week` parameters in `get_schedule_data()` for another season or week.
- The program requires an active internet connection.
- If the roster file is missing or contains invalid JSON, the program reports an error.
- If ESPN cannot be reached, the program reports the request error and continues with no injury data.
