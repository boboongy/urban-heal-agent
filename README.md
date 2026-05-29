# Heal Urban Agent

An interactive grid sandbox paired with an autonomous design agent that simulates and optimizes green spaces, pocket parks, and permeable pathways to mitigate Urban Heat Island (UHI) effects and optimize pedestrian circulation.

## 🚀 Local Setup & Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start local development server:
   ```bash
   npm run dev
   ```

---

## 🌐 Deploying to GitHub Pages (Automated)

We have configured a **GitHub Actions CI/CD pipeline** to automatically build and deploy this Vite project to GitHub Pages whenever you push code changes to the `main` branch.

### Deployment Steps:

1. **Initialize Git Repository**:
   Open a terminal inside this directory (`C:\Users\bobo\.gemini\antigravity\scratch\urban-heal-agent`) and execute:
   ```bash
   git init
   git add .
   git commit -m "feat: init sandbox co-designer prototyper"
   ```

2. **Create Repository on GitHub**:
   - Go to your GitHub account and create a new **public** repository named `urban-heal-agent`.
   - Leave it empty (do NOT check "Initialize this repository with a README" or add a gitignore/license).

3. **Add Remote Origin & Push**:
   Link your local repository and push:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/urban-heal-agent.git
   git branch -M main
   git push -u origin main
   ```
   *(Be sure to replace `YOUR_GITHUB_USERNAME` with your actual GitHub username!)*

4. **Enable GitHub Pages**:
   - Navigate to your repository page on GitHub.
   - Go to **Settings** > **Pages** (in the left sidebar).
   - Under **Build and deployment** > **Source**, click the dropdown and change it from *Deploy from a branch* to **GitHub Actions**.

The GitHub Action workflow defined in `.github/workflows/deploy.yml` will automatically trigger, build the project, and publish it. Within 1–2 minutes, your project will be live at:
`https://YOUR_GITHUB_USERNAME.github.io/urban-heal-agent/`
