# !/bin/bash -eu
set -e # This needs to be here for windows bash, which doesn't read the #! line above
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/../lib/robust-bash.sh

# if [[ "$CIRRUS_RELEASE" == "" ]]; then
#   echo "Not a release. No need to deploy!"
#   exit 0
# fi

if [[ "$GITHUB_TOKEN" == "" ]]; then
  echo "Please provide GitHub access token via GITHUB_TOKEN environment variable!"
  exit 1
fi

## normalise OS and ARCH names
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
case $OS in
  "linux"*)
    case $ARCH in
      "aarch64"*)
        OS=arm64
        ;;
    esac
    ;;
esac
REPO=${REPO:-you54f/pact-js-core}
GH_API="https://api.github.com"
GH_REPO="$GH_API/repos/$REPO"
GH_UPLOAD_API="https://uploads.github.com"
GH_UPLOAD_URL="$GH_UPLOAD_API/repos/$REPO"
NEXT_VERSION=$(npx -y commit-and-tag-version --dry-run | grep 'tagging release' | grep -E -o "([0-9\.]+(-[a-z\.0-9]+)?)")
NEXT_TAG="v${NEXT_VERSION}"
TAG=${TAG:-$NEXT_TAG}
AUTH="Authorization: token $GITHUB_TOKEN"
GH_TAGS="$GH_REPO/releases/tags/$TAG"


# if [[ "$GITHUB_TAG" ]]; then
#   GH_TAGS="$GH_REPO/releases/tags/$GITHUB_TAG"
# fi
# if [[ "$GITHUB_TAG" == 'LATEST' ]]; then
#   GH_TAGS="$GH_REPO/releases/latest"
# fi

response=$(curl -sH "$AUTH" $GH_TAGS)
eval $(echo "$response" | grep -m 1 "id.:" | grep -w id | tr : = | tr -cd '[[:alnum:]]=')
[ "${id:-}" ] || { echo "Error: Failed to get release id for tag: $TAG"; echo "$response" | awk 'length($0)<100' >&2; exit 1; }

echo "$id"
file_content_type="application/octet-stream"
files_to_upload=(
  $PWD/prebuilds/${OS}-${ARCH}.tar.gz
)

for fpath in $files_to_upload
do
  echo "Uploading $fpath..."
  name=$(basename "$fpath")
  url_to_upload="$GH_UPLOAD_URL/releases/$id/assets?name=$name"
  curl \
    --data-binary @$fpath \
    --header "$AUTH" \
    --header "Content-Type: $file_content_type" \
    $url_to_upload
done