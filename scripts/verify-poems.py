"""Compare the published poems with the original DOCX, without normalization."""
import json
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

root = Path(__file__).resolve().parents[1]
with ZipFile(root / 'public/materiales/poemas-originales.docx') as doc:
    tree = ET.fromstring(doc.read('word/document.xml'))
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
paragraphs = [
    ''.join(t.text or '' for t in paragraph.findall('.//w:t', ns))
    for paragraph in tree.findall('.//w:body/w:p', ns)
]
data = json.loads((root / 'src/data/poems.json').read_text())
assert data['title'] == paragraphs[0]
assert data['context'] == paragraphs[2:8]
for voice, (heading, start, end, message_start, message_end) in zip(
    data['voices'], [(9, 10, 34, 25, 29), (34, 35, 59, 50, 54), (69, 70, 94, 85, 89)], strict=True
):
    assert voice['originalHeading'] == paragraphs[heading], voice['id']
    assert voice['title'] == paragraphs[heading].split(' – ')[1], voice['id']
    assert voice['body'] == '\n'.join(paragraphs[start:end]), voice['id']
    assert voice['message'] == '\n'.join(paragraphs[message_start:message_end]), voice['id']
    print(f"OK · {voice['title']} · 20 versos, 5 estrofas · texto exacto")
print('OK · Títulos, contexto, 60 versos y fragmentos coinciden con el Word original.')
