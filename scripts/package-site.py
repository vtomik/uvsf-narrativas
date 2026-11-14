"""Create the Webuzo upload from the compiled site, with no source files."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
if not (dist / 'index.html').is_file():
    raise SystemExit('Primero ejecuta npm run build.')
target = root / 'publicacion/polifonia-del-cuidado-web.zip'
target.parent.mkdir(exist_ok=True)
files = sorted(path for path in dist.rglob('*') if path.is_file())
with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
    for path in files:
        archive.write(path, path.relative_to(dist))
with ZipFile(target) as archive:
    assert archive.testzip() is None, 'El ZIP no pasó la verificación de integridad.'
    for path in files:
        assert archive.read(str(path.relative_to(dist))) == path.read_bytes()
print(f'ZIP listo para Webuzo: {target} ({len(files)} archivos)')
