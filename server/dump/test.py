from docx import Document
import pypandoc

# Modify the .docx file
def modify_docx(input_docx_path, output_docx_path):
    doc = Document(input_docx_path)
    for paragraph in doc.paragraphs:
        if "KAPL/__/25-26" in paragraph.text:
            paragraph.text = paragraph.text.replace("KAPL/__/25-26", "KAPL/01/25-26")
        if "__/__/20__ (\"Effective Date\") at Kolkata" in paragraph.text:
            paragraph.text = paragraph.text.replace("__/__/20__ (\"Effective Date\") at Kolkata", "08/01/25 (\"Effective Date\") at Kolkata")
        if "_______________ a C" in paragraph.text:
            paragraph.text = paragraph.text.replace("_______________ a C", "Devsenst a Company")
    doc.save(output_docx_path)

# Convert the .docx file to PDF
def convert_docx_to_pdf(input_docx_path, output_pdf_path):
    pypandoc.convert_file(input_docx_path, 'pdf', outputfile=output_pdf_path)

# Usage
input_docx = 'Proposal Template_Non AR.docx'
output_docx = 'updates02_new.docx'
output_pdf = 'updates02_new.pdf'

modify_docx(input_docx, output_docx)
convert_docx_to_pdf(output_docx, output_pdf)
