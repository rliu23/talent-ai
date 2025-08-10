import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TagInput from "@/components/TagInput";
import { useToast } from "@/hooks/use-toast";

const domainPresets = [
  "NLP",
  "Computer Vision",
  "MLOps",
  "Generative AI",
  "Recommendation Systems",
  "Reinforcement Learning",
  "Time Series",
  "Optimization",
  "LLMs",
  "Data Engineering",
];

const toolPresets = [
  "PyTorch",
  "TensorFlow",
  "Keras",
  "scikit-learn",
  "Hugging Face",
  "LangChain",
  "Ray",
  "MLflow",
  "Airflow",
  "Docker",
  "Kubernetes",
];

const skillPresets = [
  "Python",
  "SQL",
  "Statistics",
  "Experimentation",
  "Data Visualization",
  "Prompt Engineering",
  "Distributed Training",
  "Feature Engineering",
  "Model Deployment",
  "A/B Testing",
];

const Index = () => {
  const { toast } = useToast();

  const [jobTitle, setJobTitle] = useState("Machine Learning Engineer");
  
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("full-time");
  const [seniority, setSeniority] = useState("mid");
  const [years, setYears] = useState<number>(3);
  const [remotePolicy, setRemotePolicy] = useState("hybrid");

  const [skills, setSkills] = useState<string[]>(["Python", "PyTorch"]);
  const [niceToHave, setNiceToHave] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>(["Hugging Face"]);
  const [domains, setDomains] = useState<string[]>(["Generative AI", "LLMs"]);
  const [responsibilities, setResponsibilities] = useState("");
  

  const pageTitle = "AI/ML Job JSON Generator | BluePrint";
  const pageDescription = "Create a clean JSON brief for AI/ML roles: skills, experience, location, domains, and more.";


  const computedSummary = useMemo(() => {
    const loc = location ? ` in ${location}` : "";
    const dom = domains.length ? ` focused on ${domains.join(", ")}` : "";
    return `${jobTitle}${loc}${dom}. You will build, evaluate, and deploy scalable AI/ML systems, partnering cross-functionally to deliver measurable impact.`;
  }, [jobTitle, location, domains]);


  const onMatch = async () => {
    const now = new Date().toISOString();
    const respList = responsibilities
      .split(/\n|\r/)
      .map((r) => r.trim())
      .filter(Boolean);

    const keywords = Array.from(new Set([...skills, ...tools, ...domains]));

    const jsonData = {
      meta: {
        generated_at: now,
        source: "AI/ML Job JSON Generator",
        version: 1,
      },
      role: {
        title: jobTitle,
        location: location || undefined,
        employment_type: employmentType,
        seniority,
        years_experience: years,
        remote_policy: remotePolicy,
      },
      summary: computedSummary,
      requirements: {
        core_skills: skills,
        nice_to_have: niceToHave,
        tools,
        domains,
      },
      responsibilities: respList,
      ats: {
        keywords,
        title_normalized: `${jobTitle} (${seniority}, ${years}+ yrs)`,
        location_policy: remotePolicy,
      },
    };

    try {
      const res = await fetch("http://localhost:5000/match", {
        // mode: 'no-cors',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_description: JSON.stringify(jsonData), // Send as string for embedding
        }),
      });
      console.log("Sending match request with data:", jsonData);
      if (!res.ok) {
        throw new Error("Failed to fetch match results");
      }
      const data = await res.json();
      console.log("Match results:", data);

      toast({
        title: "Matching candidates found",
        description: `Retrieved ${data.matches?.length || 0} candidates`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not match candidates",
        variant: "destructive",
      });
    }
  };

  const onGenerate = () => {
    const now = new Date().toISOString();
    const respList = responsibilities
      .split(/\n|\r/)
      .map((r) => r.trim())
      .filter(Boolean);

    const keywords = Array.from(new Set([...skills, ...tools, ...domains]));

    const json = {
      meta: {
        generated_at: now,
        source: "AI/ML Job JSON Generator",
        version: 1,
      },
      role: {
        title: jobTitle,
        
        location: location || undefined,
        employment_type: employmentType,
        seniority,
        years_experience: years,
        remote_policy: remotePolicy,
      },
      summary: computedSummary,
      requirements: {
        core_skills: skills,
        nice_to_have: niceToHave,
        tools,
        domains,
      },
      responsibilities: respList,
      ats: {
        keywords,
        title_normalized: `${jobTitle} (${seniority}, ${years}+ yrs)`,
        location_policy: remotePolicy,
      },
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    const fileSafe = jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    a.href = URL.createObjectURL(blob);
    a.download = `${fileSafe || "ai-ml-role"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    toast({ title: "Job JSON downloaded", description: "Your AI/ML job brief is ready." });
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : "/"} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "AI/ML Job JSON Generator",
          description: pageDescription,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: typeof window !== "undefined" ? window.location.href : "https://example.com",
        })}</script>
      </Helmet>

      <header className="relative overflow-hidden">
        <div className="aurora-animate">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              AI/ML Job JSON Generator
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Define your AI/ML role and instantly get a clean JSON brief.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <section aria-labelledby="form-title">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle id="form-title">Role Details</CardTitle>
              <CardDescription>Provide the essentials. You can leave fields blank and fill them later.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Job title</Label>
                  <Input id="title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Machine Learning Engineer" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Employment type</Label>
                    <Select value={employmentType} onValueChange={setEmploymentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Seniority</Label>
                    <Select value={seniority} onValueChange={setSeniority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="staff">Staff/Principal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="years">Years of experience</Label>
                    <Input id="years" type="number" min={0} max={50} value={years} onChange={(e) => setYears(parseInt(e.target.value || "0", 10))} />
                  </div>
                  <div>
                    <Label>Work policy</Label>
                    <Select value={remotePolicy} onValueChange={setRemotePolicy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <TagInput
                    label="Core skills"
                    placeholder="Type a skill and press Enter"
                    values={skills}
                    onChange={setSkills}
                    suggestions={skillPresets}
                  />
                </div>
                <div className="md:col-span-2">
                  <TagInput
                    label="Tools & frameworks"
                    placeholder="Add tools/frameworks"
                    values={tools}
                    onChange={setTools}
                    suggestions={toolPresets}
                  />
                </div>
                <div className="md:col-span-2">
                  <TagInput
                    label="Nice to have"
                    placeholder="Optional extras"
                    values={niceToHave}
                    onChange={setNiceToHave}
                  />
                </div>
                <div className="md:col-span-2">
                  <TagInput
                    label="Domains"
                    placeholder="Add domains (e.g., NLP, LLMs)"
                    values={domains}
                    onChange={setDomains}
                    suggestions={domainPresets}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
                  <Textarea id="responsibilities" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} placeholder={"Design, train, and evaluate models for \nPartner with product to scope experiments \nShip models to production with MLOps best practices"} />
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
  <p className="text-sm text-muted-foreground">
    We generate clean, ATS-friendly JSON with keywords for AI/ML roles.
  </p>
  <div className="flex gap-2">
    <Button variant="hero" size="lg" onClick={onGenerate}>
      Download JSON
    </Button>
    <Button variant="outline" size="lg" onClick={onMatch}>
      Match Candidates
    </Button>
  </div>
</div>

            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default Index;
