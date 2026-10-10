# Deploy on an Ubuntu Hostinger VPS

This setup runs the frontend, API, and Redis in Docker Compose. Nginx on the VPS reverse-proxies web traffic to the containers; it does not serve either repository as a static document root.

## VPS directory layout

Keep the repositories as siblings:

```text
/var/www/html/
├── fe-property/   # frontend repository and Compose deployment directory
└── be-property/   # backend repository/source
```

The frontend GitHub Actions workflow copies `docker-compose.yml` to `DEPLOY_PATH`. In the frontend repository, set `DEPLOY_PATH` to `/var/www/html/fe-property`. Keep `/var/www/html/fe-property/backend.env` on the VPS and do not commit it. Compose reads this file for the API settings.

## GitHub image configuration

The frontend workflow builds and publishes `ghcr.io/roshansingh76/fe-property`. The Compose defaults use these image names:

- `ghcr.io/roshansingh76/fe-property:latest`
- `ghcr.io/roshansingh76/be-property:latest`

The backend image must be built and published from the `be-property` repository before the frontend deployment runs. This repository currently has no backend image-publishing workflow. For a public GHCR package, build and push it from a machine checked out to the backend repository:

```bash
cd /var/www/html/be-property
docker login ghcr.io -u roshansingh76
docker build -t ghcr.io/roshansingh76/be-property:latest .
docker push ghcr.io/roshansingh76/be-property:latest
```

If either GHCR package is private, log in to GHCR on the VPS as well so `docker compose pull` can access it.

Set these Actions values in the frontend repository:

- Variable `NEXT_PUBLIC_API_URL`: `https://be-property.onrender.com/api/v1` for the current backend. This is compiled into the frontend image; if omitted, the workflow uses this default.
- Secrets `SSH_HOST`, `SSH_USER`, and `SSH_PRIVATE_KEY`; optionally set `SSH_PORT` (default `22`).
- Secret `DEPLOY_PATH`: `/var/www/html/fe-property`.

## API environment

Create `/var/www/html/fe-property/backend.env` on the VPS:

```dotenv
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@DATABASE_HOST:5432/palia_property?schema=public
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long
JWT_EXPIRES_IN=7d
WEB_ORIGIN=https://example.com
EXTRA_WEB_ORIGINS=
```

Use a managed PostgreSQL database or a separately maintained database service, and replace all example values. Do not commit `backend.env`.

## Start or update the containers

From an SSH session on the VPS:

```bash
cd /var/www/html/fe-property
docker compose config --quiet
docker compose pull
docker compose run --rm api npx prisma migrate deploy
docker compose up -d
docker compose ps
```

The API connects to Redis at `redis://redis:6379` inside the Compose network. Redis is not exposed on a host port. The API and frontend are bound to `127.0.0.1:4000` and `127.0.0.1:3000`, respectively.

## Nginx reverse proxy

Point DNS A records for `example.com` and `api.example.com` to the VPS. Create `/etc/nginx/sites-available/palia-property` with the following, replacing the example domains:

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.example.com;
    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and validate the site, then reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/palia-property /etc/nginx/sites-enabled/palia-property
sudo nginx -t
sudo systemctl reload nginx
```

Configure HTTPS certificates for both domains (for example, with Certbot) and allow inbound ports 80 and 443 in the VPS firewall. Do not expose ports 3000, 4000, or 6379 publicly.

## Property images and persistence

Uploaded property images and documents are stored in the named `property_uploads` volume mounted at `/app/uploads` in the API container. Redis data is stored in `redis_data`. These volumes survive container replacement; they are not backups. Back them up regularly, and do not use `docker compose down -v` unless you intend to delete the data.
