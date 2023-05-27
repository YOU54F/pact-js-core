# !/bin/bash -eu
set -e # This needs to be here for windows bash, which doesn't read the #! line above
set -u

SCRIPT_DIR="$(
  cd "$(dirname "${BASH_SOURCE[0]}")"
  pwd
)" # Figure out where the script is running
. "$SCRIPT_DIR"/../lib/robust-bash.sh

NEXT_VERSION=$(npm run release -- --dry-run | grep 'tagging release' | grep -E -o "([0-9\.]+(-[a-z\.0-9]+)?)")
NEXT_TAG="v${NEXT_VERSION}"
TAG="v${VERSION}"

if [ "$GH_RELEASE_CREATE_PRERELEASE" = true ]; then
  gh release create ${NEXT_TAG} --prerelease
  prebuilds/*.tar.gz
  exit 0
elif [ "$GH_RELEASE_UPLOAD" = true ]; then
  gh release upload ${NEXT_TAG} prebuilds/*.tar.gz
  exit 0
elif [ "$GH_RELEASE_UPDATE_TO_RELEASED" = true ]; then
  gh release edit ${TAG:-} --title ${release_name} --notes ${notes} --draft=false --prerelease=false
fi
