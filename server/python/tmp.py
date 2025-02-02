import pymupdf4llm
import sys
# pymupdf4llm.
md_text = pymupdf4llm.to_markdown(sys.argv[1], show_progress=False)
print(md_text)
