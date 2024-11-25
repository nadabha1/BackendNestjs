import spacy
from spacy.matcher import PhraseMatcher

def extract_skills(text):
    # Load the spaCy language model
    nlp = spacy.load("en_core_web_sm")
    matcher = PhraseMatcher(nlp.vocab)
    
    # Define a list of skills
    skills = ["Python", "Java", "SQL", "Machine Learning", "Data Analysis", 
              "Docker", "Kubernetes", "AWS", "Git", "TensorFlow", "Keras"]
    patterns = [nlp.make_doc(skill) for skill in skills]
    matcher.add("SKILLS", patterns)
    
    # Process the text with spaCy
    doc = nlp(text)
    matches = matcher(doc)
    extracted_skills = [doc[start:end].text for _, start, end in matches]
    return list(set(extracted_skills))

if __name__ == "__main__":
    # Example text
    resume_text = """
    I have experience with Python, Java, Docker, AWS, Machine Learning, and Kubernetes.
    I am proficient in SQL and have worked with TensorFlow and Keras for deep learning projects.
    """
    skills = extract_skills(resume_text)
    print("Extracted skills:", skills)
