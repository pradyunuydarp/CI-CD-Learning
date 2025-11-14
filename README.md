# SciCalc Next

SciCalc Next is a scientific calculator web application built with Next.js and TypeScript. It exposes core mathematical operations—square root, factorial, natural logarithm, and exponentiation—through a modern UI and a typed API, and is wired for automated testing, containerisation, and infrastructure-as-code deployment.

## Features
- Clean React client that consumes a typed `/api/calc` endpoint
- Mathematical core with robust validation and unit coverage via Vitest
- Opinionated styling with a responsive, glassmorphism-inspired layout
- Ready-to-use Dockerfile, Jenkins pipeline, and Ansible playbook for CI/CD
- Developer experience tooling: ESLint, Prettier, and npm scripts for common tasks

## Getting Started
```bash
npm install
npm run dev
```
Visit `http://localhost:3000` to interact with the calculator.

## Available Scripts
- `npm run dev` – start the development server
- `npm run lint` – run ESLint checks
- `npm run test` – execute Vitest unit tests
- `npm run build` – build the production bundle
- `npm run start` – serve the production build
- `npm run format` – apply Prettier formatting across the repo

## Testing & Quality Gates
Unit tests live alongside source files under `src/`. The Jenkins pipeline runs linting and tests before building artefacts, ensuring that only vetted changes progress to packaging.

## Containerisation & CI/CD
- `Dockerfile` implements a multi-stage build to ship a slim runtime image.
- `Jenkinsfile` defines the end-to-end CI pipeline, including Docker image publishing to Docker Hub (credentials expected under the `dockerhub` ID).
- `.dockerignore` excludes local artefacts from the image context.

## Deployment with Ansible
The `ansible/` directory is self-contained and ships with:
- `ansible.cfg` that pins the inventory at `inventory/hosts.ini`
- `requirements.yml` declaring the `community.docker`, `community.general`, and `ansible.posix` collections
- `inventory/group_vars/all.yml` for shared defaults such as the Docker image, container name, ports, and Python interpreter (defaults to the CI virtualenv)
- `playbooks/ping.yml` for quick connectivity checks
- `playbooks/deploy.yml` that pulls and runs the published container on port 3000 without requiring sudo (runs as the current Docker-enabled user)
- `vault/secrets.yml` template bound for `ansible-vault` encryption (Docker Hub credentials)

Typical flow:
```bash
cd ansible
ansible-galaxy collection install -r requirements.yml
ansible-playbook playbooks/ping.yml
ansible-playbook playbooks/deploy.yml  # add --vault-password-file or --ask-vault-pass once encrypted
```
Override the image or host port by exporting `DOCKER_IMAGE` / `HOST_PORT` or by passing `-e` extra vars.

## Documentation & Reporting
Project documentation lives in `docs/`. Update `docs/report.tex` after each milestone and regenerate a companion PDF as evidence. Track high-level progress in `CHANGELOG.md` using Conventional Commit checkpoints.

## Project Structure
```
sci-calc-next/
├─ ansible/
├─ docs/
├─ public/
├─ src/
│  ├─ app/
│  ├─ components/
│  └─ lib/
├─ Dockerfile
├─ Jenkinsfile
├─ package.json
└─ vitest.config.ts
```

Feel free to extend the calculator with additional operations, richer input validation, or integrations that showcase more of the DevOps toolchain.
