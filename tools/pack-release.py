#!/usr/bin/env python3
"""Build deterministic independent GENEX plugin ZIPs and a source pack. No installs or network."""
import hashlib
import json
import sys
import zipfile
from pathlib import Path

root = Path(__file__).resolve().parent.parent
out = Path(sys.argv[1]).expanduser().resolve() if len(sys.argv) > 1 else root.parent
out.mkdir(parents=True, exist_ok=True)
version = '0.9.1'
names = ['playwright-game-tester', 'xstate-rulebook', 'ink-narrative', 'spector-frame-inspector']
assert sorted(p.name for p in (root / 'plugins').iterdir() if p.is_dir()) == sorted(names)
for name in names:
    assert json.loads((root / 'plugins' / name / 'plugin.json').read_text())['version'] == version


def archive(output, pairs):
    seen = set()
    with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as dest:
        for source, target in sorted(pairs, key=lambda pair: pair[1]):
            if source.is_symlink() or not source.is_file():
                raise RuntimeError(f'Non-regular file refused: {source}')
            parts = Path(target).parts
            if target.startswith('/') or '..' in parts or target in seen:
                raise RuntimeError(f'Unsafe/duplicate archive entry: {target}')
            seen.add(target)
            info = zipfile.ZipInfo(target, date_time=(2026, 10, 11, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (0o100644 << 16)
            info.create_system = 3
            dest.writestr(info, source.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    with zipfile.ZipFile(output) as source:
        assert source.testzip() is None
        assert sorted(source.namelist()) == sorted(seen)
    return {'file': output.name, 'sha256': hashlib.sha256(output.read_bytes()).hexdigest(), 'bytes': output.stat().st_size, 'entries': len(seen)}


artifacts = []
for name in names:
    folder = root / 'plugins' / name
    items = [(p, name + '/' + p.relative_to(folder).as_posix()) for p in folder.rglob('*') if p.is_file()]
    artifacts.append(archive(out / f'GENEX-{name}-{version}.zip', items))

# Avoid accidental temp/build output in the reusable source pack.
excluded = {'__pycache__', 'node_modules', '.git', '.DS_Store'}
files = [(p, 'GENEX-four-plugins/' + p.relative_to(root).as_posix()) for p in root.rglob('*')
         if p.is_file() and not any(x in excluded for x in p.relative_to(root).parts)]
artifacts.append(archive(out / f'GENEX-FOUR-PLUGINS-{version}.zip', files))
manifest = {'name': 'GENEX Four Plugin Pack', 'version': version, 'date': '2026-10-11',
            'plugins': names, 'artifacts': artifacts,
            'evidence': '127 local Node fixture tests including both MCP client-disconnect cleanup, upstream-output closure, SIGTERM-resistant child kill fallback, preserved crash diagnostics, and existing GENEX SDK integration; four local manifest checks; official Mac GENEX/gameplay execution unverified'}
(out / f'GENEX-FOUR-PLUGINS-{version}-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps(manifest, indent=2))
