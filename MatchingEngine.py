class MatchingEngine:
    def __init__(self, ai_models):
        self.ai_models = ai_models
    
    async def add_candidate_to_index(self, candidate: CandidateProfile):
        """Add candidate embedding to FAISS index"""
        if not self.ai_models.embedding_model:
            raise HTTPException(status_code=500, detail="Embedding model not initialized")
        
        # Generate embedding for candidate summary
        embedding = self.ai_models.embedding_model.encode([candidate.summary])
        embedding = embedding.astype('float32')
        
        # Add to FAISS index
        self.ai_models.faiss_index.add(embedding)
        
        # Store mapping
        index_id = self.ai_models.faiss_index.ntotal - 1
        self.ai_models.candidate_embeddings[index_id] = candidate.id
    
    async def find_matches_for_job(self, job: JobPosting, top_k: int = 10) -> List[MatchResult]:
        """Find top matching candidates for a job"""
        if not self.ai_models.embedding_model:
            raise HTTPException(status_code=500, detail="Embedding model not initialized")
        
        # Generate embedding for job description
        job_text = f"{job.title} {job.description} Required skills: {', '.join(job.required_skills)}"
        job_embedding = self.ai_models.embedding_model.encode([job_text])
        job_embedding = job_embedding.astype('float32')
        
        # Search FAISS index
        if self.ai_models.faiss_index.ntotal == 0:
            return []
        
        scores, indices = self.ai_models.faiss_index.search(job_embedding, min(top_k, self.ai_models.faiss_index.ntotal))
        
        matches = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:  # FAISS returns -1 for invalid indices
                continue
                
            candidate_id = self.ai_models.candidate_embeddings.get(idx)
            if not candidate_id or candidate_id not in candidates_db:
                continue
            
            candidate = candidates_db[candidate_id]
            
            # Calculate matching skills
            matching_skills = list(set(candidate.skills) & set(job.required_skills))
            
            # Generate explanation
            explanation = self.generate_match_explanation(candidate, job, matching_skills, float(score))
            
            matches.append(MatchResult(
                candidate_id=candidate_id,
                job_id=job.id,
                score=float(score),
                matching_skills=matching_skills,
                explanation=explanation
            ))
        
        return sorted(matches, key=lambda x: x.score, reverse=True)
    
    def generate_match_explanation(self, candidate: CandidateProfile, job: JobPosting, matching_skills: List[str], score: float) -> str:
        """Generate human-readable explanation for the match"""
        skill_match_pct = (len(matching_skills) / len(job.required_skills)) * 100 if job.required_skills else 0
        
        explanation = f"Score: {score:.2f} | "
        explanation += f"Skill Match: {len(matching_skills)}/{len(job.required_skills)} ({skill_match_pct:.0f}%) | "
        
        if matching_skills:
            explanation += f"Key matches: {', '.join(matching_skills[:3])}"
        
        if candidate.experience_years >= 5:
            explanation += " | Senior experience level"
        elif candidate.experience_years >= 2:
            explanation += " | Mid-level experience"
        else:
            explanation += " | Junior level"
        
        return explanation