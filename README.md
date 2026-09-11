# Fantasy Alerts
![Python](https://img.shields.io/badge/Python-3.x-blue?logo=python)
![Requests](https://img.shields.io/badge/Requests-HTTP%20Library-green)
![License](https://img.shields.io/badge/License-Personal-lightgrey)

Fantasy Alerts checks your fantasy football starters against current NFL injury information from ESPN and creats a copy-and-paste lineup message.

## Features

- Loads fantasy rosters from `roster.json`
- Fetches NFL injury data from ESPN
- Flags players listed as:
    - Questionable
    - Doubtful
    - Out
    - Injured Reserve
    - IR
- Generates a weekly lineup alert message
- Prompts for the fantasy football week number

## File Structure
```text
fantasy-alert/
|--- main.py
|--- roster.json
|--- requirements.txt
|--- README.md
```
### Files
`main.py` - Main application logic\
`roster.json` - Fantasy managers, starters, and bench players\
`requirements.txt` - Python dependencies\
`README.md` - Project documentation

### Requirements
- Python 3.x
- Internet connection
- ESPN injury API access

### Installation
Clone or download the project, then open a terminal in the project directory.\
Create a virtual environment:
```bash
python3 -m venv .venv
```
Activate the virtual environment on macOS or Linux:

```bash
source .venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

### Roster Format
Roster information is stored in `roster.json`.\
Each manager should have a `starter` list and a `bench` list:
```json
{
    "Manager Name": {
        "starters":[
            {
                "name": "Player Name",
                "team": "TEAM",
                "postition": "QB"
            }
        ],
        "bench":[
            {
                "name": "Bench Player",
                "team": "TEAM",
                "position": "RB"
            }
        ]
    }
}
```
Player names should match the names used by ESPN.

## How to Run
Run the program with:
```bash
python3 main.py
```
The program will ask for the fantasy football week:
```text
What week number is it?
```
Enter the week number and press Enter.

### Example Output
```text
INFO - Checking fantasy roster...

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

✅Another Manager:
* No players flagged

⚠️ Please review your lineup and make any necessary changes.
```

### Notes
- The program currently checks players listed under `starters`
- Injury information comes from ESPN's NFL injuries API
- The program requires an active internet connection
- if ESPN cannot be reached, the program will display an error and continue with no injury data
