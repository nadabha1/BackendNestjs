import sys
import json
import spacy
import pdfplumber
import pytesseract
import cv2
import numpy as np
from pdf2image import convert_from_path
from PIL import Image

# Load spaCy NLP model
nlp = spacy.load("en_core_web_sm")

# Correct the Tesseract executable path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Define stopwords and irrelevant terms
STOPWORDS = {
    "nefzi", "de conception", "technologie", "a0", "francais", "nada", "ajir", 
    "english", "expériences", "de technologie", "cycle", "el andalous", 
    "baccalauréat", "php", "application", "tracer"
}

# Keywords to prioritize skill-related sections
SKILL_KEYWORDS = [
    "compétences", "skills", "technologies", "logiciels", "tools", 
    "frameworks", "languages", "abilities", "expertise", "experience"
]

def extract_text_with_ocr(pdf_path):
    """Extract text from image-based PDF using OCR."""
    try:
        poppler_path = r"C:\poppler\bin"  # Specify Poppler path
        images = convert_from_path(pdf_path, poppler_path=poppler_path)

        text = ""
        for image in images:
            img = np.array(image)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            _, binary = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)
            processed_image = Image.fromarray(binary)
            text += pytesseract.image_to_string(processed_image)
        return text
    except Exception as e:
        raise RuntimeError(f"OCR extraction failed: {str(e)}")

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF using pdfplumber, fallback to OCR if necessary."""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
            if text.strip():
                return text
        print("No structured text found with pdfplumber. Falling back to OCR.", file=sys.stderr)
        return extract_text_with_ocr(pdf_path)
    except Exception as e:
        print(f"Error using pdfplumber: {str(e)}. Falling back to OCR.", file=sys.stderr)
        return extract_text_with_ocr(pdf_path)

def extract_skills(text):
    """Extract potential skills using spaCy and heuristic matching."""
    doc = nlp(text)

    # Extract entities related to skills
    skills = [ent.text.strip() for ent in doc.ents if ent.label_ in ["ORG", "PRODUCT", "SKILL", "LANGUAGE"]]

    # Heuristic: prioritize lines containing known skill-related keywords
    for line in text.split("\n"):
        line = line.strip().lower()
        if any(keyword in line for keyword in SKILL_KEYWORDS):
            # Split and extract potential skill entries
            skills.extend([skill.strip() for skill in line.split(",") if len(skill.strip()) > 3])

    return clean_skills(skills)

def clean_skills(skills):
    """Clean and normalize the extracted skills."""
    cleaned_skills = set()
    for skill in skills:
        skill = skill.strip().rstrip('.,')
        # Exclude short or overly generic terms
        if 3 < len(skill) <= 50 and skill.lower() not in STOPWORDS:
            # Normalize case and remove duplicates
            cleaned_skills.add(skill.title())
    return sorted(cleaned_skills)

def main():
    try:
        input_data = json.loads(sys.stdin.read())
        pdf_path = input_data.get("filePath")
        if not pdf_path:
            raise ValueError("PDF file path is required.")

        # Extract text from the PDF
        text = extract_text_from_pdf(pdf_path)

        # Extract and clean skills
        skills = extract_skills(text)

        # Output the cleaned skills as JSON
        print(json.dumps({"skills": skills}))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
