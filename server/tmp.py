import fitz
import os
import pymupdf4llm
import pathlib
import re
from markdown import markdown



def extract_images(pdf_path, output_folder):
    pdf_document = fitz.open(pdf_path)
    for page_num in range(len(pdf_document)):
        page = pdf_document[page_num]
        image_list = page.get_images(full=True)
        for image_index, img in enumerate(image_list):
            xref = img[0]
            base_image = pdf_document.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            image_filename = f"image_{page_num + 1}_{image_index + 1}.{image_ext}"
            with open(os.path.join(output_folder, image_filename), "wb") as image_file:
                image_file.write(image_bytes)
    pdf_document.close()


def replace_images_with_placeholders(pdf_path, output_pdf_path, image_positions):
    pdf_document = fitz.open(pdf_path)
    for page_number, images in image_positions.items():
        page = pdf_document.load_page(page_number)
        images.sort(key=lambda x: (x[0].y0, x[0].x0))  # Sort images by their position on the page
        for rect, image_filename in images:
            placeholder_text = f"[{image_filename}]"
            page.insert_textbox(rect, placeholder_text, fontsize=12, color=(0, 0, 0))
    pdf_document.save(output_pdf_path)

def convert_pdf_to_markdown(pdf_path, image_folder):
    output_markdown_path = "output.md"
    pymupdf4llm.convert(pdf_path, output_markdown_path, image_folder=image_folder)
    return output_markdown_path

def convert_into_markdownimages(markdown_path, output_folder):
    with open(markdown_path, "r") as md_file:
        lines = md_file.readlines()

    new_lines = []
    image_pattern = re.compile(r'\[([^\]]+\.png)\]')

    for line in lines:
        matches = image_pattern.findall(line)
        if matches:
            for match in matches:
                image_filename = match
                image_path = os.path.join(output_folder, image_filename)
                if os.path.exists(image_path):
                    image_markdown = f"![image]({image_path})"
                    line = line.replace(f'[{image_filename}]', image_markdown)
        new_lines.append(line)

    with open(markdown_path, "w") as md_file:
        md_file.writelines(new_lines)

def convert_markdown_to_html(markdown_path, html_output_path):
   
   html = markdown(open(markdown_path, 'r', errors='ignore').read())

   with open(html_output_path, 'w') as html_file:
        html_file.write(html)


extract_images('./demo.pdf', 'images')
replace_images_with_placeholders('./demo.pdf', '/', '')