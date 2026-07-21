# Trading Journal

A command-line trading journal built with Python.

## Why I Built This

Keeping track of trades on paper or in a spreadsheet can get messy fast, and it can be difficult to understand the bigger picture: am I actually profitable? What is my win rate? What is my average R?

This project started as a way to answer those questions. It is a simple terminal application that logs every trade with its symbol, direction, entry price, stop loss, and exit price. It automatically calculates the result in R, also known as risk multiple, and gives aggregate statistics such as total R, win rate, loss rate, and average R across all saved trades.

## Features

- Add a trade with symbol, direction, entry price, stop loss, and exit price
- Automatically calculate R-multiple for long and short trades
- View all saved trades
- View aggregate statistics:
  - total R
  - number of trades
  - average R
  - winning trades
  - win rate
  - losing trades
  - loss rate
  - breakeven trades
- Edit an existing trade
- Delete a trade
- Undo the last deletion during the current session
- Save data locally between sessions
- Load saved data when the program starts
- Validate numeric inputs
- Validate trade selection when editing or deleting
- Handle a missing data file gracefully on first run

## How It Works

The journal stores each trade as a list of values:

```txt
symbol,direction,entry,stop,exit,result
```

The result is calculated as an R-multiple, a standard way traders measure performance relative to risk.

For long trades:

```txt
R = (exit - entry) / (entry - stop)
```

For short trades:

```txt
R = (entry - exit) / (stop - entry)
```

An R-multiple of `1` means the trade made one unit of planned risk in profit.

An R-multiple of `-1` means the trade lost one unit of planned risk.

This makes it possible to compare trades of different sizes using the same measurement.

All trades are stored locally in a text file, so the data is still available the next time the program runs.

## Technologies Used

- Python
- Git
- GitHub

## Installation

Make sure Python is installed on your computer.

Clone the repository:

```bash
git clone https://github.com/laurabaraldi98-lgtm/trading-journal-python.git
```

Open the project folder:

```bash
cd trading-journal-python
```

Run the application:

```bash
python journal.py
```

No external dependencies are required. The project only uses Python's standard library.

## Usage

When you run the program, you will see this menu:

```txt
TRADING JOURNAL
1. Add a trade
2. View trades
3. View statistics
4. Delete a trade
5. Undo last deletion
6. Edit a trade
7. Exit
```

Choose an option by typing its number. The program will guide you through entering the trade details and will ask again if you type something invalid.

## Example Data

The file `trades_sample.txt` contains example data only.

These trades are not real trades and are included only to show the format used by the program.

Example:

```txt
gold,long,100.0,98.0,104.0,2.0
gold,short,100.0,102.0,96.0,2.0
```

The actual `trades.txt` file is ignored by Git because it contains local user data.

## Project Structure

```txt
trading-journal-python/
│
├── journal.py
├── trades_sample.txt
├── .gitignore
└── README.md
```

## What I Learned

Through this project, I practiced:

- Working with Python variables
- Working with lists and indexes
- Using loops and conditional logic
- Creating reusable functions
- Handling exceptions with `try/except`
- Validating user input in a loop
- Reading from and writing to a text file
- Preserving data between sessions
- Calculating and formatting statistics
- Debugging logic errors
- Organizing a growing script into smaller reusable parts
- Using Git and preparing a project for GitHub

## Roadmap

- Migrate data storage from a text file to a SQLite database
- Add filtering by symbol
- Add filtering by date range
- Add more detailed statistics, such as best trade, worst trade, and streaks
- Export statistics to CSV
- Add charts and an equity curve
- Add an optional graphical user interface (GUI), so the journal can be used outside the terminal
- Later migrate the project to a web app

## Project Status

The core functionality is complete for a first terminal version.

Adding, viewing, editing, deleting trades, undoing the last deletion, saving data, loading data, calculating R, validating user input, and viewing statistics are working.

The project currently runs in the terminal. Future improvements include replacing plain text storage with a SQLite database, adding charts and an equity curve, and building a graphical user interface (GUI) so the journal can be used outside the terminal.