from flask import Flask, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
from pinecone import Pinecone
from flask_cors import CORS
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
CORS(app) 

def embed_text(text):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

@app.route("/match", methods=["POST"])
def match():
    print("Starting match endpoint...")
    data = request.json
    print(f"Received data: {data}")
    job_description = data.get("job_description", "")
    print(f"Received job description: {job_description}")
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

    results_dict = results.to_dict()  # or results.json() or similar, depending on Pinecone SDK
    return jsonify(results_dict)

if __name__ == "__main__":
    app.run(debug=True)

