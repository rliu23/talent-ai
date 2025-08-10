from flask import Flask, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
from pinecone import Pinecone
import os

load_dotenv()

# --- CONFIG ---
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
INDEX_NAME = "candidates"

# --- CLIENTS ---
client = OpenAI(api_key=OPENAI_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

app = Flask(__name__)

def embed_text(text):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

@app.route("/match", methods=["POST"])
def match():
    data = request.json
    job_description = data.get("job_description", "")

    if not job_description:
        return jsonify({"error": "job_description is required"}), 400

    # Convert job description to vector
    vector = embed_text(job_description)

    # Query Pinecone
    results = index.query(
        vector=vector,
        top_k=5,
        include_metadata=True
    )

    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True)

