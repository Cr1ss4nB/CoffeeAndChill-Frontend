# CoffeeAndChill-Frontend

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
