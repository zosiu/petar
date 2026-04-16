#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <phone_ip>"
  exit 1
fi

pebble install --phone "$1" --logs build/petar.pbw
