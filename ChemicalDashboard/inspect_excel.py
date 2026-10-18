import zipfile
import xml.etree.ElementTree as ET

path = r'F:\Code\HalalSazanDashboard\ChemicalDashboard\Docs\Excel\hallal sazan reports-4050208.xlsm'

with zipfile.ZipFile(path, 'r') as z:
    shared_strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        root_ss = ET.fromstring(z.read('xl/sharedStrings.xml'))
        ns_ss = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        for si in root_ss.findall('.//ns:si', ns_ss):
            shared_strings.append(''.join([t.text or '' for t in si.findall('.//ns:t', ns_ss)]))

    with z.open('xl/worksheets/sheet17.xml') as f:
        types_list = []
        for event, elem in ET.iterparse(f, events=('end',)):
            if elem.tag.endswith('row'):
                r_num = int(elem.attrib.get('r'))
                if 43035 <= r_num <= 45780:
                    c_dict = {}
                    for c in elem.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                        col = ''.join(filter(str.isalpha, c.attrib.get('r')))
                        v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                        val = v.text if v is not None else None
                        if c.attrib.get('t') == 's' and val is not None:
                            val = shared_strings[int(val)]
                        c_dict[col] = val
                    if c_dict.get('C') == '3':
                        pt = c_dict.get('AE') or ''
                        types_list.append(pt)
                elem.clear()

        # Output type mapping:
        # 1: آیزوتروپ
        # 2: الکل 700
        # 3: پساب 1300
        type_ids = {
            'آیزوتروپ': 1,
            'الکل 700': 2,
            'پساب 1300': 3
        }
        
        # Write SQL script to update OutputType
        with open('update_output_types.sql', 'w', encoding='utf-8') as out:
            out.write("BEGIN TRANSACTION;\n")
            for idx, pt in enumerate(types_list, start=1):
                tid = type_ids.get(pt, 0)
                if tid > 0:
                    out.write(f"UPDATE dbo.BatchProductionLog SET OutputType = {tid} WHERE Id = {idx};\n")
            out.write("COMMIT TRANSACTION;\n")
        print("Generated update_output_types.sql successfully.")

