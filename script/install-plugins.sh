#!/bin/sh -e
#
# Usage:
#   $ curl -fsSL https://raw.githubusercontent.com/pact-foundation/pact-plugins/master/install-cli.sh | bash
# or
#   $ wget -q https://raw.githubusercontent.com/pact-foundation/pact-plugins/master/install-cli.sh -O- | bash
#
set -e # Needed for Windows bash, which doesn't read the shebang


~/.pact/bin/pact-plugin-cli -y install https://github.com/you54f/pact-protobuf-plugin/releases/tag/v-0.3.14
# ~/.pact/bin/pact-plugin-cli -y install https://github.com/you54f/pact-plugins/releases/tag/csv-plugin-0.0.6
~/.pact/bin/pact-plugin-cli -y install https://github.com/you54f/pact-matt-plugin/releases/tag/v0.1.0
# ~/.pact/bin/pact-plugin-cli -y install https://github.com/austek/pact-avro-plugin/releases/tag/v0.0.5