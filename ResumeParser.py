# Resume Parser Class
class ResumeParser:
    def __init__(self):
        self.skills_flat = []
        for category, skills in AI_SKILLS.items():
            self.skills_flat.extend(skills)
    
    def extract_text_from_resume(self, content: bytes, filename: str) -> str:
        """Extract text from resume file"""
        # For demo purposes, assume text input
        # In production, you'd use libraries like pdfplumber, python-docx
        try:
            return content.decode('utf-8')
        except:
            return str(content)
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract AI/ML skills from resume text"""
        text_lower = text.lower()
        found_skills = []
        
        for skill in self.skills_flat:
            if skill.lower() in text_lower:
                found_skills.append(skill)
        
        # Remove duplicates and return
        return list(set(found_skills))
    
    def extract_experience_years(self, text: str) -> int:
        """Extract years of experience"""
        patterns = [
            r'(\d+)[\+\s]*years?\s+(?:of\s+)?experience',
            r'experience[:\s]+(\d+)[\+\s]*years?',
            r'(\d+)[\+\s]*yrs?\s+experience'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text.lower())
            if matches:
                return int(matches[0])
        
        # Fallback: estimate from graduation dates
        current_year = datetime.now().year
        grad_pattern = r'(19|20)\d{2}'
        years = re.findall(grad_pattern, text)
        if years:
            oldest_year = min([int(year) for year in years])
            return max(0, current_year - oldest_year - 2)  # Subtract 2 for typical degree duration
        
        return 0
    
    def extract_education(self, text: str) -> List[str]:
        """Extract education information"""
        education_keywords = ['university', 'college', 'institute', 'school', 'phd', 'msc', 'bsc', 'ms', 'bs', 'bachelor', 'master', 'doctorate']
        lines = text.split('\n')
        education = []
        
        for line in lines:
            line_lower = line.lower()
            if any(keyword in line_lower for keyword in education_keywords):
                education.append(line.strip())
        
        return education[:3]  # Return top 3 education entries
    
    def extract_location(self, text: str) -> str:
        """Extract location from resume"""
        # Simple regex patterns for common locations
        patterns = [
            r'([A-Z][a-z]+,\s*[A-Z]{2})',  # City, STATE
            r'([A-Z][a-z]+,\s*[A-Z][a-z]+)',  # City, Country
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            if matches:
                return matches[0]
        
        return "Remote"
    
    def generate_summary(self, text: str, skills: List[str], experience: int) -> str:
        """Generate a summary for embedding"""
        skill_str = ", ".join(skills[:10])  # Top 10 skills
        return f"AI/ML professional with {experience} years experience. Skills: {skill_str}"