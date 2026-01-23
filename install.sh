#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REQUIRED_NODE_MAJOR=18
PREFERRED_NODE_VERSION="lts" # uses the latest LTS via nvm

log() { echo "[axiom-play] $*"; }

ensure_nvm_loaded() {
	if command -v nvm >/dev/null 2>&1; then
		return
	fi
	if [ -s "$HOME/.nvm/nvm.sh" ]; then
		# shellcheck source=/dev/null
		. "$HOME/.nvm/nvm.sh"
	fi
}

install_node_with_nvm() {
	log "Installing Node.js via nvm (requires curl)…"
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
	ensure_nvm_loaded
	nvm install "$PREFERRED_NODE_VERSION"
	nvm use "$PREFERRED_NODE_VERSION"
}

ensure_node() {
	if command -v node >/dev/null 2>&1; then
		local ver major
		ver=$(node -v | sed 's/^v//')
		major=${ver%%.*}
		if [ "$major" -lt "$REQUIRED_NODE_MAJOR" ]; then
			log "Node.js v$ver detected (<$REQUIRED_NODE_MAJOR). Installing latest LTS…"
			ensure_nvm_loaded || true
			if command -v nvm >/dev/null 2>&1; then
				nvm install "$PREFERRED_NODE_VERSION"
				nvm use "$PREFERRED_NODE_VERSION"
			else
				install_node_with_nvm
			fi
		fi
	else
		ensure_nvm_loaded || true
		if command -v nvm >/dev/null 2>&1; then
			log "Node.js not found. Installing latest LTS via nvm…"
			nvm install "$PREFERRED_NODE_VERSION"
			nvm use "$PREFERRED_NODE_VERSION"
		else
			install_node_with_nvm
		fi
	fi
}

ensure_corepack() {
	if corepack enable >/dev/null 2>&1; then
		return
	fi
	if command -v sudo >/dev/null 2>&1; then
		log "Retrying corepack enable with sudo (you may be prompted for your password)…"
		sudo corepack enable || true
	else
		log "corepack enable failed. Please rerun this script from an admin shell."
	fi
}

ensure_env() {
	if [ ! -f "$REPO_ROOT/.env" ]; then
		log "No .env found. Creating one now (stored locally only)."
		read -r -p "Enter OPENAI_API_KEY: " OPENAI_API_KEY
		read -r -p "Enter OPTIMIZELY_AUTH_IDENT: " OPTIMIZELY_AUTH_IDENT
		read -r -p "Enter OPTIMIZELY_USERNAME: " OPTIMIZELY_USERNAME
		read -r -p "Enter OPTIMIZELY_PASSWORD: " OPTIMIZELY_PASSWORD
		cat > "$REPO_ROOT/.env" <<EOF
OPENAI_API_KEY=$OPENAI_API_KEY
OPTIMIZELY_AUTH_IDENT=$OPTIMIZELY_AUTH_IDENT
OPTIMIZELY_USERNAME=$OPTIMIZELY_USERNAME
OPTIMIZELY_PASSWORD=$OPTIMIZELY_PASSWORD
EOF
	fi

	set -a
	# shellcheck source=/dev/null
	. "$REPO_ROOT/.env"
	set +a
}

install_dependencies() {
	log "Installing dependencies with Yarn…"
	(cd "$REPO_ROOT" && export $(cat .env | grep -v '^#' | xargs) && yarn install)
}

ensure_missing_packages() {
	# Add new deps here to keep installer idempotent
	local packages=("@tabler/icons-react" "nanoid")
	local missing=()

	for pkg in "${packages[@]}"; do
		if ! node -e "const pkg=require('./package.json');const deps={...pkg.dependencies,...pkg.devDependencies};if(!deps['${pkg}'])process.exit(1);" >/dev/null 2>&1; then
			missing+=("${pkg}")
		fi
	done

	if [ ${#missing[@]} -gt 0 ]; then
		log "Adding missing dependencies: ${missing[*]}"
		(cd "$REPO_ROOT" && export $(cat .env | grep -v '^#' | xargs) && yarn add "${missing[@]}")
	else
		log "All required dependencies already present."
	fi
}

open_browser() {
	local url="http://localhost:3000"
	if command -v open >/dev/null 2>&1; then
		( sleep 2 && open "$url" ) >/dev/null 2>&1 &
	elif command -v xdg-open >/dev/null 2>&1; then
		( sleep 2 && xdg-open "$url" ) >/dev/null 2>&1 &
	else
		log "Dev server starting; open $url in your browser."
	fi
}

maybe_start_dev_server() {
	read -r -p "Start the dev server now? [Y/n]: " reply || true
	if [ -z "$reply" ] || [ "$reply" = "Y" ] || [ "$reply" = "y" ]; then
		log "Starting dev server (Ctrl+C to stop)…"
		open_browser
		yarn dev
	else
		log "Skipped starting dev server. Run 'yarn dev' when ready."
	fi
}

main() {
	log "Starting Axiom Play installer (macOS/Linux)…"
	ensure_node
	ensure_corepack
	ensure_env
	ensure_missing_packages
	install_dependencies
	log "Done."
	maybe_start_dev_server
}

main "$@"
