import json, zipfile, hashlib, xml.etree.ElementTree as ET
from pathlib import Path
root = Path(__file__).resolve().parents[1]
file = root / 'public/samples/zerowall-editable-research.pptx'
ns = {'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','c':'http://schemas.openxmlformats.org/drawingml/2006/chart'}
with zipfile.ZipFile(file) as z:
    slides = []
    for i in range(1,4):
        xml = ET.fromstring(z.read(f'ppt/slides/slide{i}.xml'))
        item = {'page':i,'shapes':len(xml.findall('.//p:sp',ns)),'images':len(xml.findall('.//p:pic',ns)),'tables':len(xml.findall('.//a:tbl',ns)),'charts':len(xml.findall('.//c:chart',ns)),'text':xml.findall('.//a:t',ns)}
        item['text'] = [t.text for t in item['text']]
        assert item['shapes'] >= 4, item
        slides.append(item)
    assert slides[0]['images'] == 1
    assert slides[2]['tables'] == 1 and slides[2]['charts'] == 1
    charts = [n for n in z.namelist() if n.startswith('ppt/charts/chart') and n.endswith('.xml')]
    values = [n.text for n in ET.fromstring(z.read(charts[0])).findall('.//c:numCache/c:pt/c:v',ns)]
    assert values == ['44','75','58','90'], values
report = {'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'slides':slides,'nativeChartValues':values,'wholeSlideRasterization':False,'renderedWith':'LibreOffice Impress to PDF and MuPDF PNG','readback':'OOXML native objects and text', 'verified':True}
(root/'design/pptx-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'pages':len(slides),'nativeShapes':[s['shapes'] for s in slides],'table':slides[2]['tables'],'chart':slides[2]['charts'],'sha256':report['sha256']}))
