#!/usr/bin/env python3
"""Generate canonical PRD/SRS requirement trace CSVs from ORIGINAL CampusOS DOCX.

Run after binary originals are committed:
 python scripts/build_requirements_index.py
Optionally override --prd and --srs. Stdlib only. Never label existing code VERIFIED automatically.
"""
from __future__ import annotations
import argparse
import csv
import re
import sys
import zipfile
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
PATTERN = re.compile(r"\b([A-Z]{2,4}-\d{3})\b")
ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PRD = ROOT / "documents/originals/CampusOS_Full_Master_PRD_All_Phases.docx"
DEFAULT_SRS = ROOT / "documents/originals/CampusOS_Complete_SRS_All_Phases.docx"
OUT = ROOT / "documents/requirements"

def text(element):
    """Extract text from all w:t descendants, preserving tab/newline."""
    items = []
    for node in element.iter():
        if node.tag == W+"t":
            items.append(node.text or "")
        elif node.tag in (W+"br",W+"cr"):
            items.append("\n")
        elif node.tag == W+"tab":
            items.append("\t")
    return "".join(items).strip()

def blocks(path):
    with zipfile.ZipFile(path) as z:
        body = ET.fromstring(z.read("word/document.xml")).find(W+"body")
    for idx, element in enumerate(body or []):
        if element.tag == W+"p":
            value = text(element)
            if value:
                yield idx, "paragraph", value
        elif element.tag == W+"tbl":
            for row_number, row in enumerate(element.findall(".//"+W+"tr")):
                cells = [text(cell) for cell in row.findall(W+"tc")]
                value = " | ".join(c.replace("\n"," / ") for c in cells)
                if value.strip(" |"):
                    yield idx, "table-row", value

def extract(path, source):
    entries = {}
    for index, block_type, value in blocks(path):
        matches = list(PATTERN.finditer(value))
        for match in matches:
            ident = match.group(1)
            # Some master SRS rows mention other requirement IDs in narrative;
            # reject duplicates conservatively, to be reviewed manually.
            if ident in entries:
                continue
            excerpt = value[max(0,match.start()-10):].strip(" |")
            excerpt = re.sub(r"\s+", " ", excerpt)
            entries[ident] = dict(
                source=source, requirement_id=ident, domain=ident.split("-")[0],
                source_block=index, block_type=block_type, source_excerpt=excerpt[:1800],
                status="NOT_STARTED", owner="", release="", code_path="", migration="",
                positive_test="", negative_test="", ui_parity="", approval="", notes="Review original DOCX for full context and formatting"
            )
    return list(entries.values())

def save(filename, rows):
    OUT.mkdir(parents=True, exist_ok=True)
    columns = ["source","requirement_id","domain","source_block","block_type","source_excerpt",
               "status","owner","release","code_path","migration","positive_test",
               "negative_test","ui_parity","approval","notes"]
    with (OUT/filename).open("w",newline="",encoding="utf-8-sig") as f:
        writer=csv.DictWriter(f,fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)
    print(f"{filename}: {len(rows)} rows; prefixes: {dict(sorted(Counter(r['domain'] for r in rows).items()))}")

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--prd",type=Path,default=DEFAULT_PRD)
    parser.add_argument("--srs",type=Path,default=DEFAULT_SRS)
    a=parser.parse_args()
    for src in (a.prd,a.srs):
        if not src.is_file():
            parser.error(f"Missing ORIGINAL source: {src}. Extract files from CampusOS_Codex_Original_Source_Pack.zip.")
    prd=extract(a.prd,"PRD")
    srs=extract(a.srs,"SRS")
    acceptance=[r for r in srs if r["domain"]=="AT"]
    requirements=[r for r in srs if r["domain"]!="AT"]
    save("PRD_REQUIREMENTS.csv",prd)
    save("SRS_REQUIREMENTS.csv",requirements)
    save("SRS_ACCEPTANCE_CASES.csv",acceptance)
    print("Expected published SRS baseline: 304 numbered requirements + 20 AT cases.")
    if len(requirements)!=304 or len(acceptance)!=20:
        print("WARNING: extracted counts differ; inspect original Word XML/table cell boundaries.",file=sys.stderr)
        sys.exit(2)
    print("All rows default NOT_STARTED. Set actual statuses only after reviewing implementation/test evidence.")

if __name__=="__main__":
    main()
