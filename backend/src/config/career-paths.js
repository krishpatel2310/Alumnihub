// Static configuration for career paths used in AI recommendations.
// Each path has a name, description, recommended skills and an optional roadmap.
// Embeddings for each path are computed lazily at runtime and cached in memory.

export const careerPaths = [
  {
    key: "backend_engineer",
    name: "Backend Engineer",
    description:
      "Designs and builds server-side applications, APIs, and databases. Focuses on scalability, performance, and security.",
    recommendedSkills: [
      "Node.js",
      "Express",
      "MongoDB",
      "SQL",
      "REST APIs",
      "Authentication",
      "Docker",
      "System Design",
    ],
    roadmap: [
      "Master JavaScript/TypeScript fundamentals",
      "Learn Node.js and Express for building APIs",
      "Understand databases (MongoDB and/or SQL)",
      "Implement authentication and authorization",
      "Practice system design and scalable architectures",
    ],
    embedding: null,
  },
  {
    key: "frontend_engineer",
    name: "Frontend Engineer",
    description:
      "Builds interactive user interfaces and web applications, focusing on user experience, accessibility, and performance.",
    recommendedSkills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "State Management",
      "Responsive Design",
      "Accessibility",
      "Performance Optimization",
    ],
    roadmap: [
      "Learn HTML, CSS, and modern JavaScript",
      "Build projects using React or a similar framework",
      "Understand responsive and accessible design",
      "Optimize frontend performance",
    ],
    embedding: null,
  },
  {
    key: "fullstack_developer",
    name: "Full Stack Developer",
    description:
      "Works on both frontend and backend, able to build end-to-end web applications and collaborate across the stack.",
    recommendedSkills: [
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "REST APIs",
      "Git",
      "Deployment",
    ],
    roadmap: [
      "Learn frontend fundamentals (HTML, CSS, JS, React)",
      "Learn backend fundamentals (Node.js, Express, databases)",
      "Build full-stack projects and deploy them",
    ],
    embedding: null,
  },
  {
    key: "data_analyst",
    name: "Data Analyst",
    description:
      "Analyzes data to generate insights, dashboards, and reports to support business decisions.",
    recommendedSkills: [
      "SQL",
      "Excel",
      "Python",
      "Pandas",
      "Data Visualization",
      "Statistics",
    ],
    roadmap: [
      "Learn SQL and basic statistics",
      "Practice with Excel or Google Sheets",
      "Use Python and Pandas for data analysis",
      "Build dashboards and visualizations",
    ],
    embedding: null,
  },
  {
    key: "data_scientist",
    name: "Data Scientist",
    description:
      "Builds models and experiments using data, machine learning, and statistics to solve complex problems.",
    recommendedSkills: [
      "Python",
      "Machine Learning",
      "Statistics",
      "Pandas",
      "NumPy",
      "Scikit-learn",
    ],
    roadmap: [
      "Strengthen math and statistics foundations",
      "Learn Python for data manipulation and ML",
      "Study common ML algorithms and evaluation",
      "Work on end-to-end ML projects",
    ],
    embedding: null,
  },
];

