FROM alpine:3.18
WORKDIR /home
# RUN apk --no-cache add curl
# RUN curl -LO https://github.com/YOU54F/pact-reference/releases/download/pact_mock_server_cli-v1.0.4/pact_mock_server_cli-linux-aarch64-musl.gz && \
#     gunzip pact_mock_server_cli-linux-aarch64-musl.gz && \
#     chmod +x pact_mock_server_cli-linux-aarch64-musl && \
#     mv pact_mock_server_cli-linux-aarch64-musl /usr/local/bin/pact_mock_server_cli

# # ENTRYPOINT ["/usr/local/bin/pact_mock_server_cli"]
# RUN curl -LO https://github.com/YOU54F/pact-reference/releases/download/pact_verifier_cli-v1.0.3/pact_verifier_cli-linux-aarch64-musl.gz && \
#     gunzip pact_verifier_cli-linux-aarch64-musl.gz && \
#     chmod +x pact_verifier_cli-linux-aarch64-musl && \
#     mv pact_verifier_cli-linux-aarch64-musl /usr/local/bin/pact_verifier_cli

# # ENTRYPOINT ["/usr/local/bin/pact_verifier_cli"]

RUN apk --no-cache add curl protoc

RUN curl -LO https://github.com/YOU54F/pact-plugins/releases/download/pact-plugin-cli-v0.1.3/pact-plugin-cli-linux-aarch64-musl.gz && \
    gunzip pact-plugin-cli-linux-aarch64-musl.gz && \
    chmod +x pact-plugin-cli-linux-aarch64-musl && \
    mv pact-plugin-cli-linux-aarch64-musl /usr/local/bin/pact-plugin-cli

# ENTRYPOINT ["/usr/local/bin/pact-plugin-cli"]
RUN pact-plugin-cli install --yes protobuf
# RUN pact-plugin-cli install --yes https://github.com/YOU54F/pact-protobuf-plugin/releases/tag/v-0.3.14
ENTRYPOINT ["/root/.pact/plugins/protobuf-0.3.14/pact-protobuf-plugin","-h", "127.0.0.1"]

# RUN pact-plugin-cli install --yes https://github.com/YOU54F/pact-protobuf-plugin/releases/tag/v-0.3.14 && \
#     curl -LO https://github.com/YOU54F/pact-protobuf-plugin/releases/download/v-0.3.14/pact-protobuf-plugin-linux-aarch64-musl.gz && \
#     gunzip pact-protobuf-plugin-linux-aarch64-musl.gz && \
#     chmod +x pact-protobuf-plugin-linux-aarch64-musl && \
#     mv pact-protobuf-plugin-linux-aarch64-musl /root/.pact/plugins/protobuf-0.3.14/pact-protobuf-plugin
# ENTRYPOINT ["/root/.pact/plugins/protobuf-0.3.14/pact-protobuf-plugin","-h", "127.0.0.1"]

# run with --init to avoid it failing to response to sigkill
# docker run --rm --init --platform=linux/arm64 alpy