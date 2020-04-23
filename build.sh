#!/usr/bin/env bash
set -e

if command -v podman;then
    DOCKER=podman
elif command -v docker;then
    DOCKER=docker
else
    echo "Could not locate any docker runtime"
    exit 1
fi

IMAGE=local/mageops-node-coordinator-build

"$DOCKER" build -t "$IMAGE" ./build
"$DOCKER" run --rm -v "$PWD:/workdir:z" "$IMAGE"
