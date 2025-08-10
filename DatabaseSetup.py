import csv
import os
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

# --- READ CSV & UPLOAD ---
vectors = []
with open(CSV_FILE_PATH, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        # Combine text fields for embedding
        combined_text = f"{row['Skills']} | {row['Job Role']} | {row['Education']} | {row['Certifications']}"
        embedding = create_embedding(combined_text)

        metadata = {
            "Name": row["Name"],
            "Skills": row["Skills"],
            "Experience": row["Experience (Years)"],
            "Education": row["Education"],
            "Certifications": row["Certifications"],
            "Job Role": row["Job Role"],
            "Recruiter Decision": row["Recruiter Decision"],
            "Salary Expectation": row["Salary Expectation ($)"],
            "Projects Count": row["Projects Count"],
            "AI Score": row["AI Score (0-100)"]
        }
        print("vector being saved...", row["Resume_ID"])
        vectors.append((
            row["Resume_ID"],  # Unique ID
            embedding,
            metadata
        ))

# --- UPSERT IN BATCHES ---
BATCH_SIZE = 100
for i in range(0, len(vectors), BATCH_SIZE):
    batch = vectors[i:i+BATCH_SIZE]
    index.upsert(vectors=batch)
    print(f"Uploaded batch {i//BATCH_SIZE + 1}")

print("All candidates uploaded to Pinecone.")

# --- SEARCH FUNCTION ---
def search_candidates(query, top_k=5):
    query_embedding = create_embedding(query)
    results = index.query(vector=query_embedding, top_k=top_k, include_metadata=True)
    return results

# --- TEST SEARCH ---
search_results = search_candidates("Python and AI with 5+ years experience")
print("\nTop Matches:")
for match in search_results["matches"]:
    md = match["metadata"]
    print(f"{md['Name']} ({md['Skills']}) - Score: {match['score']:.4f}")
