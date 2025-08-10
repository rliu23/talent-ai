"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_helmet_async_1 = require("react-helmet-async");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var TagInput_1 = require("@/components/TagInput");
var use_toast_1 = require("@/hooks/use-toast");
var domainPresets = [
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
var toolPresets = [
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
var skillPresets = [
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
var Index = function () {
    var toast = (0, use_toast_1.useToast)().toast;
    var _a = (0, react_1.useState)("Machine Learning Engineer"), jobTitle = _a[0], setJobTitle = _a[1];
    var _b = (0, react_1.useState)(""), location = _b[0], setLocation = _b[1];
    var _c = (0, react_1.useState)("full-time"), employmentType = _c[0], setEmploymentType = _c[1];
    var _d = (0, react_1.useState)("mid"), seniority = _d[0], setSeniority = _d[1];
    var _e = (0, react_1.useState)(3), years = _e[0], setYears = _e[1];
    var _f = (0, react_1.useState)("hybrid"), remotePolicy = _f[0], setRemotePolicy = _f[1];
    var _g = (0, react_1.useState)(["Python", "PyTorch"]), skills = _g[0], setSkills = _g[1];
    var _h = (0, react_1.useState)([]), niceToHave = _h[0], setNiceToHave = _h[1];
    var _j = (0, react_1.useState)(["Hugging Face"]), tools = _j[0], setTools = _j[1];
    var _k = (0, react_1.useState)(["Generative AI", "LLMs"]), domains = _k[0], setDomains = _k[1];
    var _l = (0, react_1.useState)(""), responsibilities = _l[0], setResponsibilities = _l[1];
    var pageTitle = "AI/ML Job JSON Generator | BluePrint";
    var pageDescription = "Create a clean JSON brief for AI/ML roles: skills, experience, location, domains, and more.";
    var computedSummary = (0, react_1.useMemo)(function () {
        var loc = location ? " in ".concat(location) : "";
        var dom = domains.length ? " focused on ".concat(domains.join(", ")) : "";
        return "".concat(jobTitle).concat(loc).concat(dom, ". You will build, evaluate, and deploy scalable AI/ML systems, partnering cross-functionally to deliver measurable impact.");
    }, [jobTitle, location, domains]);
    var onGenerate = function () {
        var now = new Date().toISOString();
        var respList = responsibilities
            .split(/\n|\r/)
            .map(function (r) { return r.trim(); })
            .filter(Boolean);
        var keywords = Array.from(new Set(__spreadArray(__spreadArray(__spreadArray([], skills, true), tools, true), domains, true)));
        var json = {
            meta: {
                generated_at: now,
                source: "AI/ML Job JSON Generator",
                version: 1,
            },
            role: {
                title: jobTitle,
                location: location || undefined,
                employment_type: employmentType,
                seniority: seniority,
                years_experience: years,
                remote_policy: remotePolicy,
            },
            summary: computedSummary,
            requirements: {
                core_skills: skills,
                nice_to_have: niceToHave,
                tools: tools,
                domains: domains,
            },
            responsibilities: respList,
            ats: {
                keywords: keywords,
                title_normalized: "".concat(jobTitle, " (").concat(seniority, ", ").concat(years, "+ yrs)"),
                location_policy: remotePolicy,
            },
        };
        var blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
        var a = document.createElement("a");
        var fileSafe = jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        a.href = URL.createObjectURL(blob);
        a.download = "".concat(fileSafe || "ai-ml-role", ".json");
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast({ title: "Job JSON downloaded", description: "Your AI/ML job brief is ready." });
    };
    return (<>
      <react_helmet_async_1.Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription}/>
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : "/"}/>
        <meta property="og:title" content={pageTitle}/>
        <meta property="og:description" content={pageDescription}/>
        <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "AI/ML Job JSON Generator",
            description: pageDescription,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: typeof window !== "undefined" ? window.location.href : "https://example.com",
        })}</script>
      </react_helmet_async_1.Helmet>

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
          <card_1.Card className="shadow-elegant">
            <card_1.CardHeader>
              <card_1.CardTitle id="form-title">Role Details</card_1.CardTitle>
              <card_1.CardDescription>Provide the essentials. You can leave fields blank and fill them later.</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label_1.Label htmlFor="title">Job title</label_1.Label>
                  <input_1.Input id="title" value={jobTitle} onChange={function (e) { return setJobTitle(e.target.value); }} placeholder="e.g. Machine Learning Engineer"/>
                </div>
                <div>
                  <label_1.Label htmlFor="location">Location</label_1.Label>
                  <input_1.Input id="location" value={location} onChange={function (e) { return setLocation(e.target.value); }} placeholder="e.g. San Francisco, CA"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label_1.Label>Employment type</label_1.Label>
                    <select_1.Select value={employmentType} onValueChange={setEmploymentType}>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Select"/>
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="full-time">Full-time</select_1.SelectItem>
                        <select_1.SelectItem value="part-time">Part-time</select_1.SelectItem>
                        <select_1.SelectItem value="contract">Contract</select_1.SelectItem>
                        <select_1.SelectItem value="internship">Internship</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                  <div>
                    <label_1.Label>Seniority</label_1.Label>
                    <select_1.Select value={seniority} onValueChange={setSeniority}>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Select"/>
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="junior">Junior</select_1.SelectItem>
                        <select_1.SelectItem value="mid">Mid</select_1.SelectItem>
                        <select_1.SelectItem value="senior">Senior</select_1.SelectItem>
                        <select_1.SelectItem value="staff">Staff/Principal</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label_1.Label htmlFor="years">Years of experience</label_1.Label>
                    <input_1.Input id="years" type="number" min={0} max={50} value={years} onChange={function (e) { return setYears(parseInt(e.target.value || "0", 10)); }}/>
                  </div>
                  <div>
                    <label_1.Label>Work policy</label_1.Label>
                    <select_1.Select value={remotePolicy} onValueChange={setRemotePolicy}>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Select"/>
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="remote">Remote</select_1.SelectItem>
                        <select_1.SelectItem value="hybrid">Hybrid</select_1.SelectItem>
                        <select_1.SelectItem value="onsite">On-site</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <TagInput_1.default label="Core skills" placeholder="Type a skill and press Enter" values={skills} onChange={setSkills} suggestions={skillPresets}/>
                </div>
                <div className="md:col-span-2">
                  <TagInput_1.default label="Tools & frameworks" placeholder="Add tools/frameworks" values={tools} onChange={setTools} suggestions={toolPresets}/>
                </div>
                <div className="md:col-span-2">
                  <TagInput_1.default label="Nice to have" placeholder="Optional extras" values={niceToHave} onChange={setNiceToHave}/>
                </div>
                <div className="md:col-span-2">
                  <TagInput_1.default label="Domains" placeholder="Add domains (e.g., NLP, LLMs)" values={domains} onChange={setDomains} suggestions={domainPresets}/>
                </div>
                <div className="md:col-span-2">
                  <label_1.Label htmlFor="responsibilities">Responsibilities (one per line)</label_1.Label>
                  <textarea_1.Textarea id="responsibilities" value={responsibilities} onChange={function (e) { return setResponsibilities(e.target.value); }} placeholder={"Design, train, and evaluate models for \nPartner with product to scope experiments \nShip models to production with MLOps best practices"}/>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">We generate clean, ATS-friendly JSON with keywords for AI/ML roles.</p>
                <button_1.Button variant="hero" size="lg" onClick={onGenerate}>Download JSON</button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </section>
      </main>
    </>);
};
exports.default = Index;
