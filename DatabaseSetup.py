import csv
import os
import json
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI

# --- CONFIG ---
load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
INDEX_NAME = os.getenv("INDEX_NAME")
DIMENSION = int(os.getenv("DIMENSION"))
CSV_FILE_PATH = "AI_Resume_Screening.csv"  # Path to your CSV

# --- INIT CLIENTS ---
pc = Pinecone(api_key=PINECONE_API_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# --- CREATE INDEX IF NOT EXISTS ---
existing_indexes = [idx["name"] for idx in pc.list_indexes()]
if INDEX_NAME not in existing_indexes:
    pc.create_index(
        name=INDEX_NAME,
        dimension=DIMENSION,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )
    print(f"Index '{INDEX_NAME}' created.")
else:
    print(f"Index '{INDEX_NAME}' already exists.")

index = pc.Index(INDEX_NAME)

# --- FUNCTION: CREATE EMBEDDING ---
def create_embedding(text: str):
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

# # --- UPLOAD CANDIDATES TO PINECONE ---
# vectors = []
# with open(CSV_FILE_PATH, newline='', encoding='utf-8') as csvfile:
#     reader = csv.DictReader(csvfile)
#     for row in reader:
#         combined_text = f"{row['Skills']} | {row['Job Role']} | {row['Education']} | {row['Certifications']}"
#         embedding = create_embedding(combined_text)

#         metadata = {
#             "Name": row["Name"],
#             "Skills": row["Skills"],
#             "Experience": float(row["Experience (Years)"]),
#             "Education": row["Education"],
#             "Certifications": row["Certifications"],
#             "Job Role": row["Job Role"],
#             "Recruiter Decision": row["Recruiter Decision"],
#             "Salary Expectation": float(row["Salary Expectation ($)"]),
#             "Projects Count": int(row["Projects Count"]),
#             "AI Score": float(row["AI Score (0-100)"])
#         }
#         print("vector being saved...", row["Resume_ID"])
#         vectors.append((
#             row["Resume_ID"],
#             embedding,
#             metadata
#         ))

# # --- UPSERT IN BATCHES ---
# BATCH_SIZE = 100
# for i in range(0, len(vectors), BATCH_SIZE):
#     batch = vectors[i:i+BATCH_SIZE]
#     index.upsert(vectors=batch)
#     print(f"Uploaded batch {i//BATCH_SIZE + 1}")

print("All candidates uploaded to Pinecone.")

# --- FUNCTION: Convert Job JSON to Search String ---
def job_json_to_text(job_data: dict) -> str:
    return f"""
Title: {job_data['role']['title']}
Employment Type: {job_data['role']['employment_type']}
Seniority: {job_data['role']['seniority']}
Experience Required: {job_data['role']['years_experience']}+ years
Remote Policy: {job_data['role']['remote_policy']}
Summary: {job_data['summary']}
Core Skills: {', '.join(job_data['requirements']['core_skills'])}
Tools: {', '.join(job_data['requirements']['tools'])}
Domains: {', '.join(job_data['requirements']['domains'])}
Keywords: {', '.join(job_data['ats']['keywords'])}
"""

# --- FUNCTION: Search by Job JSON ---
def search_by_job_json(job_data, top_k=5):
    job_text = job_json_to_text(job_data)
    query_embedding = create_embedding(job_text)

    results = index.query(vector=query_embedding, top_k=top_k, include_metadata=True)

    required_years = job_data['role']['years_experience']
    required_skills = set(job_data['requirements']['core_skills'] +
                          job_data['requirements']['tools'] +
                          job_data['requirements']['domains'])

    def skill_overlap(candidate_skills):
        return len(required_skills & set(map(str.strip, candidate_skills.split(","))))

    filtered = [
        m for m in results['matches']
        if float(m['metadata']['Experience']) >= required_years
    ]

    ranked = sorted(
        filtered,
        key=lambda m: m['score'] + 0.05 * skill_overlap(m['metadata']['Skills']),
        reverse=True
    )

    return ranked

# --- MAIN EXECUTION: Example ---
job_json_str = """
{
  "meta": {"generated_at": "2025-08-10T05:36:49.918Z", "source": "AI/ML Job JSON Generator", "version": 1},
  "role": {"title": "Machine Learning Engineer", "employment_type": "full-time", "seniority": "mid", "years_experience": 3, "remote_policy": "hybrid"},
  "summary": "Machine Learning Engineer focused on Generative AI, LLMs. You will build, evaluate, and deploy scalable AI/ML systems, partnering cross-functionally to deliver measurable impact.",
  "requirements": {"core_skills": ["Python", "PyTorch"], "nice_to_have": [], "tools": ["Hugging Face"], "domains": ["Generative AI", "LLMs"]},
  "responsibilities": [],
  "ats": {"keywords": ["Python", "PyTorch", "Hugging Face", "Generative AI", "LLMs"], "title_normalized": "Machine Learning Engineer (mid, 3+ yrs)", "location_policy": "hybrid"}
}
"""

job_data = json.loads(job_json_str)
matches = search_by_job_json(job_data, top_k=5)

print("\nBest Matches:")
for m in matches:
    md = m["metadata"]
    print(f"{md['Name']} ({md['Skills']}) - Exp: {md['Experience']} yrs - AI Score: {md['AI Score']} - Match: {m['score']:.4f}")
