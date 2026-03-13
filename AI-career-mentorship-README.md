## AI Career & Mentorship Recommendations – Implementation Plan

This document describes how we will implement **medium-level AI recommendations** inside the existing Alumni Hub project, using embeddings + similarity search (no heavy model training).

We will build **two main features**:
- **Mentor recommendations for students** (suggest relevant alumni).
- **Career path recommendations** (suggest likely roles + skills to learn).

---

## 1. Data model & assumptions

We will rely on (and slightly extend) existing data:

- **User model** (students & alumni)
  - Existing fields: `role` (student/alumni), `department`, `graduationYear`, `skills`, `company`, `jobTitle`, `location`, `bio`, etc.
  - We may **add/ensure**:
    - `interests` (array of strings; e.g. \"backend\", \"data science\").
    - `headline` or use `jobTitle` + `bio` for text.

- **Jobs model**
  - Use fields like `title`, `company`, `location`, `category`, `description`, `skillsRequired` (if present; otherwise infer from description).

No schema changes are strictly required to start; we can derive text from existing fields and later add optional fields if needed.

---

## 2. Tech choice for embeddings

We want **text embeddings** to represent:
- Student profile text.
- Alumni profile text.
- Job descriptions / titles.
- Predefined \"career path\" descriptions.

### Options

1. **External API (recommended for simplicity)**
   - Use an embedding API (e.g., OpenAI, or any local embedding service available).
   - Pros: Easy to use, good quality, no model training.
   - Cons: Requires API key and internet access.

2. **Local / lightweight model (optional)**
   - Use a small sentence-embedding model via Node or Python microservice.
   - More setup; not necessary for first version.

For this project we will **assume an embedding API** and wrap it in a small service module.

---

## 3. Representing profiles & jobs as vectors

We will create a **profile text string** for each user and job, then request an embedding for that text.

- **Student profile text example**
  - Concatenate: `department`, `graduationYear`, `skills`, `interests`, `bio`.
  - Example template:
    - `\"Student in Computer Science, graduating 2026. Interested in backend development and cloud. Skills: Node.js, MongoDB, React.\"`

- **Alumni profile text example**
  - Concatenate: `jobTitle`, `company`, `department`, `skills`, `bio`.
  - Example template:
    - `\"Alumni working as Backend Engineer at Google. Skills: Node.js, Express, MongoDB, AWS. Mentoring topics: system design, backend careers.\"`

- **Job profile text example**
  - Concatenate: `title`, `company`, `location`, `category`, `description`, `skillsRequired`.

We store the resulting **embedding vectors** (arrays of numbers) in MongoDB, e.g.:
- `user.profileEmbedding: number[]`
- `job.embedding: number[]`

---

## 4. Embedding & similarity utilities (backend)

In the backend (`src/services`), we will add:

- `embedding.service.js`
  - `getEmbeddingForText(text: string): Promise<number[]>`
    - Calls external embedding API and returns the vector.

- `similarity.service.js`
  - `cosineSimilarity(vecA, vecB): number`
  - `rankBySimilarity(targetVec, candidateVecs)`: returns candidates sorted by similarity score.

We will keep this logic **stateless** and reusable across mentor and career path recommendations.

---

## 5. Mentor recommendation flow

### 5.1 When to compute embeddings

Two approaches:

1. **On-demand with caching (simpler)**
   - When a student opens the \"Recommended Mentors\" page:
     - Ensure the student has a `profileEmbedding`.
       - If not, compute it and save on their `User` document.
     - Ensure all alumni have `profileEmbedding`.
       - In background or via a script, compute and cache embeddings for all `role: \"alumni\"` users.

2. **Pre-compute via cron / admin script**
   - Run a script to compute embeddings for all users periodically.
   - Useful if the user base becomes large.

We will start with **on-demand + background pre-compute** for alumni.

### 5.2 API endpoint

Add an endpoint to the backend, e.g.:

- `GET /api/recommendations/mentors`
  - Authenticated as a **student**.
  - Steps:
    1. Load current student user (from JWT).
    2. Build student profile text → embed → `studentVec`.
    3. Fetch all alumni with `profileEmbedding` not null (and within filters like same department/related).
    4. For each alumni, compute similarity to `studentVec`.
    5. Sort by similarity descending.
    6. Return top N mentors (e.g., 5–10) with basic public profile info and similarity score.

Optional filters:
- Same department or related departments.
- Location preference.
- Minimum similarity threshold.

---

## 6. Career path recommendation flow

### 6.1 Define career path templates

Create a **static config file** (e.g., `src/config/career-paths.js`) with entries like:

- `\"Backend Engineer\"`
- `\"Frontend Engineer\"`
- `\"Full Stack Developer\"`
- `\"Data Analyst\"`
- `\"Data Scientist\"`
- `\"DevOps Engineer\"`
- `\"Product Manager\"`, etc.

Each career path contains:
- `name`
- `description`
- `recommendedSkills` (array)
- `roadmap` (short bulleted plan – optional for UI)

We will also precompute an **embedding** for each career path description:
- `careerPath.embedding: number[]`

### 6.2 Recommendation logic

For a given student:

1. Ensure the student has `profileEmbedding`.
2. Compare the student vector with all career path embeddings.
3. Compute similarity scores and sort.
4. Return top 3–5 career paths with:
   - `name`
   - `score`
   - `recommendedSkills`
   - `roadmap` (optional)

### 6.3 API endpoint

Add an endpoint, e.g.:

- `GET /api/recommendations/careers`
  - Authenticated as any user (typically student).
  - Returns top career paths + suggested skills.

---

## 7. Frontend integration (React/Vite)

We will add:

- **New pages / sections**
  - `Recommended Mentors` (for students)
    - Fetch from `/api/recommendations/mentors`.
    - Show cards with mentor name, company, role, shared skills, and a \"Request Mentorship\" / \"Connect\" button.
  - `Career Recommendations`
    - Fetch from `/api/recommendations/careers`.
    - Show recommended roles + scores + key skills to learn.

- **UI details**
  - Tag common skills / interests between student and mentor.
  - Show simple explanation: e.g., \"Matched because you both know React and are in Computer Science\" (based on overlapping skills/department).
  - Use existing component style (Tailwind + shadcn UI) for consistency.

---

## 8. Security, performance & fallbacks

- **Security**
  - Endpoints require authentication (JWT).
  - Students only get public mentor information (no private emails unless already allowed by existing API).

- **Performance**
  - Cache embeddings on the user/job documents to avoid repeated API calls.
  - For many users, consider limiting candidates (e.g., same department) before similarity computation.

- **Fallbacks**
  - If embedding service is unavailable:
    - Fall back to simple rule-based recommendations (same department + overlapping skills count).
  - If student profile is incomplete:
    - Show a message prompting them to add skills/interests.

---

## 9. Implementation order (step-by-step)

1. **Backend preparation**
   - [ ] Add `.env` config for embedding API key (if needed).
   - [ ] Create `embedding.service.js` and `similarity.service.js`.
   - [ ] Add optional `profileEmbedding` fields to `User` (and `Job` if desired).

2. **Career path config**
   - [ ] Create `career-paths` config file with roles, descriptions, skills.
   - [ ] Precompute embeddings for each career path and store them in memory or DB.

3. **Mentor recommendations**
   - [ ] Implement helper to build profile text for users.
   - [ ] Add logic to compute/cache user embeddings.
   - [ ] Implement `/api/recommendations/mentors` endpoint.

4. **Career path recommendations**
   - [ ] Implement `/api/recommendations/careers` endpoint.
   - [ ] Ensure both endpoints share reusable similarity utilities.

5. **Frontend**
   - [ ] Add API client functions to call the new endpoints.
   - [ ] Create React pages/components for mentor and career recommendations.
   - [ ] Integrate into navigation (e.g., dashboard tabs).

6. **Testing & polish**
   - [ ] Seed/update user skills & interests for realistic recommendations.
   - [ ] Manually verify recommendations look sensible for different student profiles.
   - [ ] Add loading/error states and UX polish.

Once these steps are complete, the Alumni Hub will have **AI-powered mentor and career recommendations** using embeddings and similarity search, without training complex ML models.

