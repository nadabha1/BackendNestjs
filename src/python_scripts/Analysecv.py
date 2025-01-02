import spacy
import json
from sentence_transformers import SentenceTransformer, util

# Charger le modèle spaCy pour l'extraction de compétences
nlp = spacy.load("en_core_web_sm")

# Charger le modèle SentenceTransformer pour la similarité
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

def extract_skills(text):
    """
    Extrait les compétences du texte à l'aide de spaCy.
    :param text: Texte du CV
    :return: Liste des compétences extraites
    """
    doc = nlp(text)
    skills = set()
    
    # Extraction des entités nommées pertinentes
    for token in doc.ents:
        if token.label_ in ["ORG", "PRODUCT", "GPE", "NORP", "LANGUAGE", "TECH"]:
            skills.add(token.text.lower())
    
    # Ajout des compétences basées sur les mots-clés
    for token in doc:
        if token.pos_ in ["NOUN", "PROPN"] and len(token.text) > 2:
            skills.add(token.text.lower())
    
    return list(skills)

def match_skills(project, cv_text):
    """
    Compare les compétences mentionnées dans le projet et celles extraites du CV.
    :param project: Dictionnaire contenant les détails du projet
    :param cv_text: Texte brut du CV
    :return: Projet enrichi avec des scores de correspondance des compétences
    """
    # Extraire les compétences du CV
    cv_skills = extract_skills(cv_text)
    
    # Extraire les technologies du projet
    project_technologies = project.get("technologies", "")
    
    # Encoder les compétences et les technologies
    skills_embedding = model.encode(cv_skills, convert_to_tensor=True)
    project_embedding = model.encode(project_technologies, convert_to_tensor=True)
    
    # Calculer la similarité cosine
    similarity_score = util.cos_sim(skills_embedding, project_embedding).mean().item()
    
    # Retourner les informations enrichies
    return {
        "project_id": project.get("_id"),
        "project_title": project.get("title"),
        "match_score": round(similarity_score, 2),
        "cv_skills": cv_skills,
        "project_technologies": project_technologies
    }

def main():
    # Exemple de données
    example_project = {
        "_id": "project_123",
        "title": "AI-Powered Chatbot",
        "technologies": "Python, TensorFlow, Natural Language Processing, AI, Chatbot",
        "description": "A chatbot project using AI and NLP techniques.",
        "budget": 5000,
        "status": "active",
        "duration": "3 months"
    }
    example_cv = """
    Experienced developer skilled in Python, machine learning, natural language processing, and artificial intelligence. 
    Familiar with frameworks like TensorFlow and PyTorch. Proficient in building chatbots and other AI-powered solutions.
    """
    
    # Appeler la fonction de correspondance
    result = match_skills(example_project, example_cv)
    
    # Afficher le résultat
    print(json.dumps(result, indent=4))

if __name__ == "__main__":
    main()
