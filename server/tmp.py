from pdfminer.high_level import extract_text_to_fp

def pdf_to_html(pdf_path, html_path):
    with open(pdf_path, 'rb') as pdf_file, open(html_path, 'w', encoding='utf-8') as html_file:
        extract_text_to_fp(pdf_file, html_file, output_type='html')

# Example usage
pdf_to_html('demo.pdf', 'output.html')