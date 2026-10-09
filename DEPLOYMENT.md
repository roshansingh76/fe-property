# Hostinger VPS deployment

These Docker files target a Hostinger VPS with Docker Engine and the Compose plugin. They do not apply to Hostinger shared hosting. Put a reverse proxy such as Nginx in front of the containers and configure TLS for the domains.

## GitHub setup

The frontend and API are separate repositories. Keep this repository's workflow in the frontend repo and add `paliapropertybk/.github/workflows/deploy.yml` from the API folder to the API repository. The API folder currently has no Git repository in this workspace, so it must be pushed to its own GitHub repository before its workflow can run.

Set this Actions variable in the frontend repository:

- `NEXT_PUBLIC_API_URL`: public API base URL, including `/api/v1`, for example `https://api.example.com/api/v1`. This value is compiled into the frontend image.

Set these Actions secrets in both repositories:

- `SSH_HOST`: Hostinger VPS IP or hostname.
- `SSH_USER`: SSH account with permission to run Docker Compose.
- `SSH_PRIVATE_KEY`: private key accepted by the VPS.
- `SSH_PORT`: SSH port, usually `22` (optional).
- `DEPLOY_PATH`: VPS deployment directory, default `/opt/palia-property` (optional).

Both workflows publish images named `ghcr.io/<owner>/<repository>`. Make the packages public in GitHub Packages, or configure registry pull credentials on the VPS before deployment. The Compose defaults expect `ghcr.io/mittalankur088/paliaproperty:latest` and `ghcr.io/mittalankur088/paliapropertybk:latest`; edit those defaults if the API repository/package uses a different name.

## VPS setup

Install Docker Engine with the Docker Compose plugin and create the deployment directory. In that directory, create `backend.env` with the API runtime settings:

```dotenv
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@DATABASE_HOST:5432/palia_property?schema=public
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long
JWT_EXPIRES_IN=7d
WEB_ORIGIN=https://example.com
EXTRA_WEB_ORIGINS=
```

Use a managed PostgreSQL database or a separately maintained database service. Do not commit `backend.env`. The API stores uploaded property files in a named Docker volume, so they survive container replacements.

Deploy the API repository first so its image exists in GHCR. Then deploy the frontend repository; its workflow copies `docker-compose.yml` to the VPS, runs pending Prisma migrations, and starts both services. The containers bind only to `127.0.0.1:3000` and `127.0.0.1:4000`; configure the VPS reverse proxy to send the frontend domain to port 3000 and the API domain to port 4000. The API allows browser origins listed by `WEB_ORIGIN` and `EXTRA_WEB_ORIGINS`.