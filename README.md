# Fantasy Alerts

![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

Fantasy Alerts retrieves a private ESPN fantasy league's rosters and standings, checks starters against NFL injury and schedule data, prints a copy-and-paste lineup report, and generates JSON for the Fantasy Weekly Wrap web app.

## What It Does

- Reads the ESPN league ID and authentication cookies from environment variables.
- Retrieves team rosters and standings from ESPN's fantasy football API.
- Prompts for a week number, then retrieves NFL injury data and that week's schedule from ESPN.
- Flags starters with injury statuses `QUESTIONABLE`, `DOUBTFUL`, `OUT`, `INJURED_RESERVE`, or `IR`, and starters whose NFL team is absent from the schedule response.
- Prints a manager-by-manager lineup message and league standings.
- Writes `weekly_wrap.json` for the frontend.

The season is currently fixed to 2026 in `fantasy-alerts/main.py`. The week is entered when the script runs. `fantasy-alerts/roster.json` is a legacy local roster file; the current script does not read it.

## Repository Layout

```text
fantasy-alerts/
├── README.md
├── fantasy-alerts/
│   ├── main.py
│   ├── test.py
│   ├── requirements.txt
│   └── roster.json          # legacy; not used by main.py
└── fantasy-weekly-wrap/
    ├── package.json
    ├── public/
    │   └── weekly_wrap.json
    └── src/
```

`fantasy-alerts/test.py` is a small ESPN connection diagnostic that prints league team names and IDs; it is not a unit-test suite.

## Requirements

- Python 3
- Node.js and npm, to run the web app
- Internet access to ESPN APIs
- Access to the ESPN fantasy league and its authentication cookies

## Configuration

Create a `.env` file in the repository root. The root `.gitignore` excludes it, so do not commit your credentials.

```dotenv
ESPN_LEAGUE_ID=your_league_id
ESPN_SWID=your_swid_cookie
ESPN_S2=your_espn_s2_cookie
```

Install the Python dependencies from the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r fantasy-alerts/requirements.txt
```

## Generate Weekly Data

Run the generator with the frontend's `public` directory as the working directory. The output path is relative to the current directory, and the web app fetches `/weekly_wrap.json` from this location.

```bash
cd fantasy-weekly-wrap/public
python3 ../../fantasy-alerts/main.py
```

Enter the NFL week when prompted. The script prints the lineup message and writes `fantasy-weekly-wrap/public/weekly_wrap.json`. The schedule request uses the entered week and the 2026 regular season.

To check ESPN league connectivity without generating the weekly data, run from the repository root:

```bash
python3 fantasy-alerts/test.py
```

## Run the Web App

After generating `weekly_wrap.json`, start Vite:

```bash
cd fantasy-weekly-wrap
npm install
npm run dev
```

The app displays the generated week's summary, standings, and team lineup alerts. To create a production build, run `npm run build` from `fantasy-weekly-wrap`.

## Data and Error Handling

- ESPN supplies league rosters, standings, injury statuses, and the NFL schedule.
- Only starters are checked; bench and injured-reserve players are retrieved but not checked for alerts.
- A team absent from the schedule response is treated as being on a bye. If the schedule request fails, verify the request/data before relying on bye alerts.
- If the ESPN league request fails, the script prints an error and stops. Injury and schedule request failures print an error and return empty data.
- The generated JSON is written to the current working directory, so run the generator from `fantasy-weekly-wrap/public` for the web app to load the newly generated file.
