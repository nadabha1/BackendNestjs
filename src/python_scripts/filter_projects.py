from sentence_transformers import SentenceTransformer, util
import sys
import json

# Load the SentenceTransformer model
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

def main():
    try:
        # Read input data from Node.js
        input_data = json.loads(sys.stdin.read())
        
        # Validate input keys
        if 'skills' not in input_data or 'projects' not in input_data:
            raise KeyError("Both 'skills' and 'projects' fields are required in the input.")

        user_skills = input_data['skills']  # Skills of the registered user
        projects = input_data['projects']  # List of projects with technologies

        # Extract technologies from projects
        project_descriptions = [project['technologies'] for project in projects]

        # Encode user skills and project technologies
        skills_embedding = model.encode(user_skills, convert_to_tensor=True)
        technologies_embeddings = model.encode(project_descriptions, convert_to_tensor=True)

        # Calculate cosine similarity
        similarities = util.cos_sim(skills_embedding, technologies_embeddings)

        # Convert numpy.float32 to Python float and build ranked projects
        ranked_projects = sorted(
            [
                {
                    "id":project['_id'],
                    "title": project['title'],  # Project title
                    "technologies": project['technologies'],  # Technologies
                    "description": project['description'],
                    "budget": project['budget'],
                    "status": project['status'],
                    "duration": project['duration'],
                    "score": float(score)  # Match score
                }
                for project, score in zip(projects, similarities[0].cpu().numpy())
            ],
            key=lambda x: x["score"],
            reverse=True
        )

        # Output the results as JSON
        print(json.dumps(ranked_projects))
        #print(json.dumps({"ranked_projects": ranked_projects}))


    except KeyError as e:
        print(f"KeyError: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
