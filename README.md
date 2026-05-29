# CoffeeAndChill-Frontend

## Environment

Create a local `.env` from `.env.example` and set the backend URL used by the browser app.

```bash
VITE_API_URL=http://localhost:8000
```

In Vercel, set `VITE_API_URL` to the Render backend URL, for example:

```bash
VITE_API_URL=https://<your-render-backend>.onrender.com
```

## Docker

### Build y run con Docker

```bash
docker build -t coffeeandchill-frontend .
docker run --rm -p 8080:80 coffeeandchill-frontend
```

### Run con Docker Compose

```bash
docker compose up --build -d
```

La app queda disponible en `http://localhost:8080`.
