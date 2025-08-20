import fitz  # PyMuPDF
import docx2txt
import io

def parse_pdf(file_stream):
    doc = fitz.open(stream=file_stream.read(), filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def parse_docx(file_stream):
    return docx2txt.process(io.BytesIO(file_stream.read()))

def parse_resume(file):
    filename = file.filename
    ext = filename.split('.')[-1].lower()
    
    if ext == 'pdf':
        return {"text": parse_pdf(file.stream)}
    elif ext == 'docx':
        return {"text": parse_docx(file.stream)}
    else:
        return {"error": "Unsupported file format. Use PDF or DOCX."}
