import os.path

top = '.'
out = 'build'


def options(ctx):
    ctx.load('pebble_sdk')


def configure(ctx):
    ctx.load('pebble_sdk')

    for platform in ctx.env.TARGET_PLATFORMS:
        ctx.setenv(platform, ctx.all_envs[platform])
        cflags = ctx.env.CFLAGS
        cflags = [x for x in cflags if not x.startswith('-std=')]
        cflags.extend(['-std=c11',
                       '-fms-extensions',
                       '-Wno-address',
                       '-Wno-type-limits',
                       '-Wno-missing-field-initializers',
                       '-Wno-builtin-macro-redefined',
                       '-Wno-builtin-declaration-mismatch'])
        ctx.env.CFLAGS = cflags


def build(ctx):
    ctx.load('pebble_sdk')

    build_worker = os.path.exists('worker_src')
    binaries = []

    cached_env = ctx.env
    for platform in ctx.env.TARGET_PLATFORMS:
        ctx.env = ctx.all_envs[platform]
        ctx.set_group(ctx.env.PLATFORM_NAME)
        app_elf = '{}/pebble-app.elf'.format(ctx.env.BUILD_DIR)
        ctx.pbl_program(source=ctx.path.ant_glob('src/**/*.c'), target=app_elf)

        if build_worker:
            worker_elf = '{}/pebble-worker.elf'.format(ctx.env.BUILD_DIR)
            binaries.append({'platform': platform, 'app_elf': app_elf, 'worker_elf': worker_elf})
            ctx.pbl_worker(source=ctx.path.ant_glob('worker_src/**/*.c'), target=worker_elf)
        else:
            binaries.append({'platform': platform, 'app_elf': app_elf})
    ctx.env = cached_env

    ctx.set_group('bundle')
    ctx.pbl_bundle(binaries=binaries,
                   js=ctx.path.ant_glob(['src/js/**/*.js', 'src/js/**/*.json']),
                   js_entry_file='src/js/main.js')
