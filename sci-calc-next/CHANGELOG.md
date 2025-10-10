# Changelog

All notable changes to this project will be documented in this file.

## [0.3.4] - 2025-10-10
- Expanded the CI/CD report with Jenkins and Ansible code snippets plus an appendix for pasting the latest instructions and screenshots.

Author: CDX

## [0.3.3] - 2025-10-10
- Added email notifications to the Jenkins pipeline, driven by the `NOTIFY_EMAILS` environment variable so teams can opt-in per job.
- Included build metadata and resolved host port in the success message, with console logs attached to failure notices.
- Updated documentation to describe the notification flow.

Author: CDX

## [0.3.2] - 2025-10-10
- Taught the Jenkins deploy stage to probe for a free host port (preferring 3000) before running Ansible and export the selection for the playbook.
- Added container cleanup pre-tasks so Ansible stops and removes stale deployments before recreating the service, preventing port binding conflicts.
- Documented the port fallback behaviour and cleanup flow in the project report.

Author: CDX

## [0.3.1] - 2025-10-10
- Ensured the Jenkins Ansible deploy stage exports the absolute virtualenv interpreter so Docker modules resolve during deployment.
- Documented the pipeline fix in the CI/CD report.

Author: CDX

## [0.3.0] - 2025-10-10
- Finalised the Ansible layout with config, inventory, group vars, and dedicated ping/deploy playbooks.
- Added a vault credential template plus supporting ignore rules for local vault password files.
- Refreshed README and ANSIBLE guidance to describe the end-to-end deployment flow.
- Tuned CI pipeline to run inside the project workspace, force production builds, and invoke the Ansible deploy stage on every run.
- Updated the Ansible deploy playbook to run without sudo, keeping Jenkins and local runs simple.
- Relocated group variables alongside the inventory and wired the Python interpreter through the Jenkins virtual environment for reliable Docker modules.

Author: CDX

## [0.2.0] - 2025-09-30
- Refined the calculator experience with a responsive split layout, thematic styling, and contextual helpers.
- Added expression parsing, quick operation toggles, and result copy support to streamline advanced use.
- Documented the refresh with updated screenshots and report notes for traceability.

Author: CDX

## [0.1.0] - 2025-09-30
- Initial Next.js scaffold with scientific calculator UI and API
- Added mathematical library with unit tests powered by Vitest
- Configured project tooling (linting, formatting) and CI/CD infrastructure assets

Author: CDX
