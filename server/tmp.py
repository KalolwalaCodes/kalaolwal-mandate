from pdfminer.high_level import extract_text, extract_text_to_fp
from pdfminer.layout import LAParams
import io

def pdf_to_html(pdf_path, html_path):
    """Converts a PDF file to an HTML file."""
    output = io.StringIO()
    with open(pdf_path, "rb") as pdf_file:
        extract_text_to_fp(pdf_file, output, laparams=LAParams(), output_type='html', codec=None)
    
    html_content = output.getvalue()
    output.close()
    
    with open(html_path, "w", encoding="utf-8") as html_file:
        html_file.write(html_content)
    
    print(f"Converted {pdf_path} to {html_path}")

# Example usage
pdf_to_html("demo.pdf", "output.html")
