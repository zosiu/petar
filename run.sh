#!/bin/bash
PYPKJS_PYTHON=/usr/local/python27-x86/bin/python2.7 \
  PHONESIM_PATH="$HOME/Library/Application Support/Pebble SDK/pypkjs/phonesim.py" \
  pebble install --emulator basalt build/petar.pbw "$@"
