# Coastal Erosion Prediction — Website Version

This turns the desktop project into a real website: a Flask backend runs
the exact same Modules 1-4 (Pandas cleaning, scikit-learn regression, risk
classification, Matplotlib charts) behind an HTTP API, and a plain HTML/JS
page in the browser calls it.

```
CoastalErosionWebsite/
├── backend/
│   ├── app.py                Flask server + /api/analyze, /api/sample
│   ├── data_processing.py    Module 1 (same as desktop version)
│   ├── prediction.py         Module 2
│   ├── risk_assessment.py    Module 3
│   ├── visualization.py      Module 4
│   ├── coastal_data.csv      sample dataset, served via /api/sample
│   ├── requirements.txt
│   ├── uploads/               temp storage for uploaded CSVs (auto-cleaned)
│   └── static/charts/         generated PNGs, served back to the browser
└── frontend/
    └── index.html             upload form + results display, calls the API
```

This was tested end-to-end in development here: server start, `/`,
`/api/sample`, and `/api/analyze` (both JSON and real multipart file
upload) all returned correct, verified numbers and generated chart PNGs.

## Run it locally

```bash
cd backend
pip install -r requirements.txt
python3 app.py
```

Open **http://localhost:5000** — that's it, one server serves both the API
and the frontend page.

## How it works

- The browser either uploads a CSV or clicks "use the sample dataset"
  (fetched from `/api/sample`).
- It POSTs to `/api/analyze` with the CSV + segment name + horizon.
- Flask runs your tested Python modules, writes a chart PNG to
  `static/charts/`, and returns JSON: erosion rate, predicted position,
  R², risk level, and a URL to the chart image.
- The page renders the numbers and `<img>`s the chart — no page reload.

## Putting it on the actual internet (free options)

Running it on your laptop only reaches your laptop. To get a real public
URL, deploy the `backend/` folder (which also serves `frontend/`) to a
host that runs Python. All of these have free tiers suitable for a college
project:

| Host | Notes |
|---|---|
| **Render** (render.com) | Easiest for Flask. Connect a GitHub repo, set start command to `gunicorn app:app`, done. |
| **PythonAnywhere** | No credit card needed for the free tier; upload files directly, no GitHub required. |
| **Railway** (railway.app) | Similar to Render, generous free trial credit. |

General steps for Render/Railway (both work the same way):
1. Push this `backend/` folder (with `frontend/` alongside it, one level up)
   to a GitHub repository.
2. Create a new "Web Service" on the host, point it at the repo.
3. Set the start command to: `gunicorn app:app` (gunicorn is already in
   `requirements.txt`).
4. Deploy — you'll get a public URL like `https://your-app.onrender.com`.

For PythonAnywhere, upload the files through their web file manager instead
of GitHub, and use their "Web" tab to point a Flask app at `app.py` (no
gunicorn needed there — they run it for you).

## One thing to fix before deploying

`app.py` currently runs with `debug=True`, which is fine for testing but
should be `False` (or removed) once it's live on the internet, since debug
mode can leak source code through error pages. Change the last line to:

```python
app.run(host="0.0.0.0", port=5000)
```

or better, let gunicorn run it (`gunicorn app:app`) and drop the
`if __name__ == "__main__"` block from being the actual production entry
point entirely.
