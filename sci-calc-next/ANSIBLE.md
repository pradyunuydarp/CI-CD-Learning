# 🧩 Ansible Operations Guide

This guide explains how to operate the Ansible automation that deploys the SciCalc Next container. The configuration already lives in `ansible/`; you only need to install Ansible, supply credentials, and run the playbooks.

---

## 1. Install Ansible

macOS
```bash
brew install ansible
```

Ubuntu/Debian
```bash
sudo apt update && sudo apt install -y ansible
```

Verify your install:
```bash
ansible --version
```

---

## 2. Repository Layout
```
ansible/
  ansible.cfg
  requirements.yml
  inventory/hosts.ini
  inventory/group_vars/all.yml
  vault/secrets.yml
  playbooks/
    ping.yml
    deploy.yml
  roles/
```
- `ansible.cfg` pins the inventory, roles, and collection paths.
- `inventory/hosts.ini` targets `localhost` by default; extend it with remote hosts as needed.
- `inventory/group_vars/all.yml` defines shared defaults such as the Docker image, container name, and ports (with environment-variable overrides for `DOCKER_IMAGE` and `HOST_PORT`).
- `vault/secrets.yml` is a template file for Docker Hub credentials—encrypt it with `ansible-vault` before committing secrets.

---

## 3. Variables & Secrets
1. Update `ansible/inventory/group_vars/all.yml` if you need different defaults.
2. Populate `ansible/vault/secrets.yml`:
   ```yaml
   dockerhub_username: "your_dockerhub_user"
   dockerhub_password: "your_dockerhub_access_token"
   ```
3. Encrypt the file:
   ```bash
   cd ansible
   ansible-vault encrypt vault/secrets.yml
   ```
4. Store your vault password securely. The repo ignores `ansible/.vault_pass.txt`; create it locally if you prefer non-interactive runs.

---

## 4. Install Galaxy Collections
From the `ansible/` directory:
```bash
ansible-galaxy collection install -r requirements.yml
```
This pulls `community.docker`, `community.general`, and `ansible.posix` for the playbooks.

---

## 5. Run the Playbooks
Run everything from inside `ansible/` so that `ansible.cfg` is picked up automatically.

Connectivity smoke test:
```bash
ansible-playbook playbooks/ping.yml
```

    Deploy (pulls the image, logs into Docker Hub if credentials exist, and runs the container on port 3000 without sudo):
```bash
ansible-playbook playbooks/deploy.yml
```
Add `--ask-vault-pass` or `--vault-password-file .vault_pass.txt` when `vault/secrets.yml` is encrypted.

Override settings with environment variables or extra-vars, e.g.:
```bash
DOCKER_IMAGE=myuser/sci-calc-next:staging ansible-playbook playbooks/deploy.yml
ansible-playbook playbooks/deploy.yml -e host_port=8080
```

---

## 6. Jenkins Integration
Add an Ansible stage after the Docker build/push in your Jenkinsfile:
```groovy
stage('Ansible Deploy') {
  when { branch 'main' }
  steps {
    withCredentials([string(credentialsId: 'ANSIBLE_VAULT_PASS', variable: 'ANSIBLE_VAULT_PASS')]) {
      sh '''
        python3 -m venv .venv
        . .venv/bin/activate
        pip install --upgrade pip ansible
        cd ansible
        ansible-galaxy collection install -r requirements.yml
        echo "$ANSIBLE_VAULT_PASS" > .vault_pass.txt
        ansible-playbook playbooks/deploy.yml --vault-password-file .vault_pass.txt
      '''
    }
  }
}
```
Create a Jenkins Secret Text credential (`ANSIBLE_VAULT_PASS`) that holds the vault password used to encrypt `vault/secrets.yml`.

---

## 7. Quick Checklist
- [ ] Ansible installed and version-checked
- [ ] Galaxy collections installed
- [ ] `vault/secrets.yml` encrypted with valid Docker Hub credentials
- [ ] Optional: `.vault_pass.txt` created locally (ignored by git)
- [ ] Playbooks tested (`ping`, then `deploy`)
- [ ] Jenkins pipeline updated to call the deploy playbook

Keep this guide handy so every agent follows the same Ansible flow.
