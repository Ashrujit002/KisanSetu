# AgriProcure — Flask Version

This version uses **Flask for the backend** while keeping the existing frontend and API behavior unchanged.

## Project structure

```text
agriprocure_flask/
├── app.py
├── requirements.txt
├── data/
│   └── agri-procure.json
└── public/
    ├── index.html
    ├── app.js
    └── styles.css
```

## Run on Windows

Open PowerShell in this folder:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Then open:

http://localhost:5174

If PowerShell blocks activation, you can run:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

## Demo accounts

- Farmer: `farmer@demo.local` / `demo123`
- Buyer: `buyer@demo.local` / `demo123`
- Admin: `admin@demo.local` / `demo123`

The app remains in DEMO MODE and persists changes in `data/agri-procure.json`.
