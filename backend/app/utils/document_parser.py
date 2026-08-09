from io import BytesIO

from fastapi import UploadFile
from pypdf import PdfReader


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".txt",
}


def get_file_extension(filename: str) -> str:
    return "." + filename.rsplit(".", 1)[-1].lower()


async def extract_text(file: UploadFile) -> str:
    if not file.filename:
        raise ValueError("File name is required")

    extension = get_file_extension(file.filename)

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported file type. Only PDF and TXT files are allowed")

    file_content = await file.read()

    if not file_content:
        raise ValueError("Uploaded file is empty")

    if extension == ".txt":
        return file_content.decode("utf-8")

    if extension == ".pdf":
        reader = PdfReader(BytesIO(file_content))

        pages = []

        for page in reader.pages:
            text = page.extract_text()

            if text:
                pages.append(text)

        extracted_text = "\n\n".join(pages)

        if not extracted_text.strip():
            raise ValueError("Could not extract text from PDF")

        return extracted_text

    raise ValueError("Unsupported file type")