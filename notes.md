# Build Compatibility Fixes

| Issue | Fix |
|---|---|
| `pebble-tool` PyPI deps require Python 3 | Installed from original GitHub source (v4.5) |
| Analytics prompt blocked CLI | Created `NO_TRACKING` file |
| `virtualenv --no-site-packages` removed in v20 | Downgraded `virtualenv` to 16.x |
| `sourcemap` module missing | `pip install sourcemap` |
| `npm` not on PATH during SDK install | Installed Node.js via asdf and set global version |
| FreeType library not found by `ctypes` | Patched SDK's `freetype/__init__.py` with Homebrew path fallback |
| `time_t` unknown (GCC 15 + `-D_TIME_H_` blocks `time.h`) | Added guarded `typedef long time_t` to `pebble.h` for both platforms |
| `__FILE_NAME__` builtin redefinition error | Added `-Wno-builtin-macro-redefined` to wscript |
| `strftime` return type mismatch | Added `-Wno-builtin-declaration-mismatch` to wscript |

## Files Patched

| File | Change |
|---|---|
| `~/Library/Application Support/Pebble SDK/SDKs/current/.env/lib/python2.7/site-packages/freetype/__init__.py` | Added Homebrew path fallback for FreeType library discovery |
| `~/Library/Application Support/Pebble SDK/SDKs/current/sdk-core/pebble/chalk/include/pebble.h` | Added guarded `typedef long time_t` after blocked `#include <time.h>` |
| `~/Library/Application Support/Pebble SDK/SDKs/current/sdk-core/pebble/basalt/include/pebble.h` | Added guarded `typedef long time_t` after blocked `#include <time.h>` |
| `wscript` | Added `-Wno-builtin-macro-redefined` and `-Wno-builtin-declaration-mismatch` to compiler flags |
