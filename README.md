# English Tester

https://english-tester.com

English Tester was a fun little project I built in July of 2025 with the goal of exploring a couple subjects that interested me:

- ChatGPT content generation
- SSG
- V0 automated website generation
- Cloudflare

The frontend design was bootstrapped entirely using V0, then moved to an independent repository decoupled from Vercel's infrastructure. 

## Flow

1. Launch local Docker instances of Postgres and PGAdmin using `docker-compose.yaml`.
2. Create `.env` using all vars from `env.template`.
3. Generate English grammar tests and their internal relations using the Python scripts under `/populate` (OpenAI API key necessary). 
4. Build app using `pnpm install`.

To see app on http://localhost:3000, run `pnpm dev`.

To deploy to server:

5. Create `.env.production` using only the production build env vars from `env.template` (avoid including private vars in the built website!).
6. Run the deployment script: `./deploy.sh`

The deployment script will:
- Build the project using `pnpm build`
- Sync the built files to your remote server
- Fix file permissions on the server
- Purge Cloudflare cache

## Notes

- The `.env` file contains sensitive information and is automatically ignored by git.
- Database info (generated grammar tests) will be stored under the local `data` folder and will persist between Docker container launches.
- The current test generation algorithm does not have a 100% success rate, as some of the generated tests answer options are too varied to be possible to split into clean answers with no more than two slashes. 
- You need your own server to deploy the static site to, and for that server to include an Nginx configuration similar to the example provided in `example.conf`.
- Nginx handles some important broken link redirects. Look at `example.conf` for more information. 
