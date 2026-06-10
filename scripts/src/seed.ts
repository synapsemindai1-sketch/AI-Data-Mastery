import { db, coursesTable, modulesTable, lessonsTable, quizzesTable, quizQuestionsTable } from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  // Check if already seeded
  const existing = await db.select().from(coursesTable);
  if (existing.length > 0) {
    console.log("Database already has data, skipping seed.");
    process.exit(0);
  }

  // ---- COURSES ----
  const courses = await db.insert(coursesTable).values([
    {
      title: "AI Safety & Red Teaming Fundamentals",
      description: "Master the techniques used to identify vulnerabilities in AI systems. Learn adversarial prompting, jailbreaking detection, and how to evaluate model robustness against real-world misuse.",
      level: "Intermediate",
      durationHours: 8.5,
      totalLessons: 11,
      instructor: "Dr. Maya Chen",
      category: "AI Safety & Red Teaming",
      thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80",
      objectives: ["Understand adversarial attack vectors on LLMs", "Design effective red-teaming evaluation frameworks", "Identify prompt injection and jailbreak patterns", "Write safety reports and vulnerability disclosures"],
      prerequisites: ["Basic familiarity with LLMs", "Understanding of prompt engineering"],
    },
    {
      title: "Data Quality & Evaluation for AI Training",
      description: "Deep dive into the principles of high-quality training data. Covers annotation consistency, inter-annotator agreement, data cleaning pipelines, and evaluation rubrics used by leading AI labs.",
      level: "Beginner",
      durationHours: 6.0,
      totalLessons: 9,
      instructor: "Prof. James Okafor",
      category: "Data Quality & Evaluation",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      objectives: ["Apply annotation quality frameworks to real datasets", "Measure inter-annotator agreement with Cohen kappa", "Design data cleaning pipelines", "Create evaluation rubrics for AI outputs"],
      prerequisites: ["No prior AI experience required", "Basic data literacy helpful"],
    },
    {
      title: "Advanced RLHF & Model Alignment",
      description: "Go beyond the basics of reinforcement learning from human feedback. Explore reward modeling, preference datasets, constitutional AI, and the frontier challenges of aligning powerful models.",
      level: "Advanced",
      durationHours: 12.0,
      totalLessons: 15,
      instructor: "Dr. Sarah Nakamura",
      category: "AI Training & Alignment",
      thumbnail: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
      objectives: ["Build and fine-tune reward models", "Understand constitutional AI and self-critique", "Design preference datasets at scale", "Evaluate alignment quality rigorously"],
      prerequisites: ["Solid understanding of machine learning", "Experience with RLHF concepts", "Python proficiency"],
    },
    {
      title: "Content Moderation & Policy Enforcement",
      description: "Learn to apply platform policies with consistency and precision. This course covers harm taxonomies, edge case handling, cultural context in moderation, and the psychology of reviewing difficult content.",
      level: "Beginner",
      durationHours: 5.5,
      totalLessons: 9,
      instructor: "Alex Rivera",
      category: "AI Safety & Red Teaming",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      objectives: ["Apply harm taxonomies to real content examples", "Handle policy edge cases with consistency", "Understand cultural context in moderation decisions", "Maintain quality under high-volume conditions"],
      prerequisites: ["No prior experience required"],
    },
    {
      title: "Model Evaluation & Benchmarking",
      description: "Understand how to rigorously assess AI model performance beyond simple accuracy metrics. Covers benchmark design, capability elicitation, calibration testing, and human evaluation studies.",
      level: "Intermediate",
      durationHours: 7.0,
      totalLessons: 9,
      instructor: "Dr. Lisa Park",
      category: "Data Quality & Evaluation",
      thumbnail: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&q=80",
      objectives: ["Design rigorous model evaluation benchmarks", "Measure calibration and uncertainty in AI outputs", "Run human evaluation studies", "Compare models across capability dimensions"],
      prerequisites: ["Familiarity with machine learning concepts", "Basic statistics knowledge"],
    },
    {
      title: "Human Feedback Collection Mastery",
      description: "The definitive course on collecting high-signal human feedback for AI systems. From survey design and instruction writing to managing annotator teams and detecting low-quality responses.",
      level: "Intermediate",
      durationHours: 9.0,
      totalLessons: 12,
      instructor: "Marcus Thompson",
      category: "Human Feedback",
      thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
      objectives: ["Write clear annotation instructions that scale", "Design feedback collection interfaces", "Detect and filter low-quality annotations", "Manage distributed annotator teams effectively"],
      prerequisites: ["Basic understanding of AI systems", "Interest in human-computer interaction"],
    },
  ]).returning();

  console.log(`Inserted ${courses.length} courses`);

  // ---- MODULES ----
  const modules = await db.insert(modulesTable).values([
    // Course 1 modules
    { courseId: courses[0].id, title: "Introduction to AI Safety", order: 1 },
    { courseId: courses[0].id, title: "Adversarial Prompting Techniques", order: 2 },
    { courseId: courses[0].id, title: "Jailbreaking & Bypass Detection", order: 3 },
    { courseId: courses[0].id, title: "Red Team Frameworks & Reporting", order: 4 },
    // Course 2 modules
    { courseId: courses[1].id, title: "Foundations of Data Quality", order: 1 },
    { courseId: courses[1].id, title: "Annotation Consistency & Agreement", order: 2 },
    { courseId: courses[1].id, title: "Data Cleaning Pipelines", order: 3 },
    // Course 3 modules
    { courseId: courses[2].id, title: "RLHF Foundations Review", order: 1 },
    { courseId: courses[2].id, title: "Reward Modeling", order: 2 },
    { courseId: courses[2].id, title: "Preference Data at Scale", order: 3 },
    { courseId: courses[2].id, title: "Constitutional AI & Self-Critique", order: 4 },
    { courseId: courses[2].id, title: "Alignment Evaluation", order: 5 },
    // Course 4 modules
    { courseId: courses[3].id, title: "Policy Foundations", order: 1 },
    { courseId: courses[3].id, title: "Harm Taxonomies", order: 2 },
    { courseId: courses[3].id, title: "Edge Cases & Cultural Context", order: 3 },
    // Course 5 modules
    { courseId: courses[4].id, title: "Beyond Accuracy: Evaluation Fundamentals", order: 1 },
    { courseId: courses[4].id, title: "Benchmark Design", order: 2 },
    { courseId: courses[4].id, title: "Human Evaluation Studies", order: 3 },
    // Course 6 modules
    { courseId: courses[5].id, title: "Principles of Human Feedback", order: 1 },
    { courseId: courses[5].id, title: "Instruction Writing", order: 2 },
    { courseId: courses[5].id, title: "Quality Control & Team Management", order: 3 },
    { courseId: courses[5].id, title: "Advanced Feedback Patterns", order: 4 },
  ]).returning();

  console.log(`Inserted ${modules.length} modules`);

  // ---- LESSONS ----
  // Helper to build lesson sets per module
  const m = (idx: number) => modules[idx].id;

  const lessons = await db.insert(lessonsTable).values([
    // Course 1, Module 1: Introduction to AI Safety
    { moduleId: m(0), title: "What is AI Safety?", type: "reading", durationMinutes: 15, order: 1, hasQuiz: false, content: "AI safety is the field dedicated to ensuring that artificial intelligence systems behave as intended and do not cause harm. This lesson introduces the core concepts: alignment, robustness, interpretability, and the distinction between narrow and general AI risks.\n\nAI safety researchers work on ensuring that AI systems are aligned with human values and intentions, robust against adversarial inputs, interpretable so humans can understand their behavior, and corrigible so they can be corrected or shut down when needed.\n\nThe field spans both near-term concerns (biased outputs, misuse, privacy) and long-term concerns (autonomous systems pursuing misaligned goals at scale)." },
    { moduleId: m(0), title: "The Alignment Problem Explained", type: "video", durationMinutes: 20, order: 2, hasQuiz: false, content: "This lesson covers the fundamental alignment problem: how do we specify what we want AI systems to do, and how do we verify they are doing it? We explore reward hacking, Goodhart Law, and why simple reward functions fail in complex environments.\n\nKey concepts:\n- Reward hacking: when AI finds unintended ways to maximize reward\n- Goodhart Law: When a measure becomes a target, it ceases to be a good measure\n- Outer vs inner alignment: aligning training objectives vs learned goals\n- Deceptive alignment: systems that appear aligned during training but not deployment" },
    { moduleId: m(0), title: "Risk Taxonomy for AI Systems", type: "reading", durationMinutes: 18, order: 3, hasQuiz: true, content: "Understanding risk requires a structured taxonomy. Risk categories include: Misuse risks (bad actors using AI for harmful purposes), Accident risks (well-intentioned deployments causing unintended harm), Structural risks (systemic effects on labor markets, power concentration), and Catastrophic risks (highly capable systems pursuing misaligned objectives at scale).\n\nEach category requires different mitigation strategies and policy responses. Near-term mitigations focus on technical guardrails, access controls, and monitoring. Long-term mitigations require advances in alignment research and governance frameworks." },

    // Course 1, Module 2: Adversarial Prompting
    { moduleId: m(1), title: "Introduction to Prompt Injection", type: "reading", durationMinutes: 20, order: 1, hasQuiz: true, content: "Prompt injection is an attack where malicious input overrides a model's instructions. Types include: Direct injection (user input contradicts system instructions), Indirect injection (malicious instructions in retrieved content), and Multi-turn injection (attacks spread across conversation turns).\n\nDefense strategies include input sanitization, instruction hierarchy enforcement, and output filtering. No single defense is sufficient; layered approaches are required in production systems." },
    { moduleId: m(1), title: "Jailbreaking Techniques Deep Dive", type: "video", durationMinutes: 25, order: 2, hasQuiz: false, content: "A comprehensive tour of jailbreaking methods. Categories include: Persona attacks (pretend you have no restrictions), Hypothetical framing (in a fictional world...), Token manipulation (special characters, encodings), Context exhaustion (filling context to push system prompt out of attention), and Many-shot jailbreaking (using long sequences of examples to shift behavior).\n\nUnderstanding these techniques is essential for red teamers and safety evaluators." },
    { moduleId: m(1), title: "Evaluating Adversarial Robustness", type: "exercise", durationMinutes: 30, order: 3, hasQuiz: true, content: "Practice identifying vulnerabilities in AI system prompts and crafting defenses.\n\nExercise 1: Given a system prompt, identify its five weakest points.\nExercise 2: Write three variants of a prompt injection attack against a customer service bot.\nExercise 3: Propose defenses against each attack you crafted.\n\nUse the rubric: (1) Does the attack bypass stated restrictions? (2) Is it reproducible? (3) What is its severity on a 1-5 scale?" },

    // Course 1, Module 3: Jailbreaking & Bypass Detection
    { moduleId: m(2), title: "Detecting Jailbreak Attempts", type: "reading", durationMinutes: 22, order: 1, hasQuiz: false, content: "Red teamers and safety engineers need to detect jailbreak attempts reliably. Detection approaches include: Rule-based filters (block known patterns - simple but easily bypassed), Classifier models (train on known attacks), LLM-as-judge (use a separate model to evaluate inputs), and Behavioral monitoring (detect unusual output patterns post-generation).\n\nThe key challenge: attackers adapt. Defense-in-depth with multiple layers is best practice." },
    { moduleId: m(2), title: "Building a Jailbreak Test Suite", type: "exercise", durationMinutes: 35, order: 2, hasQuiz: true, content: "Create a systematic test suite for evaluating model safety. Your deliverable: a structured dataset of 20 jailbreak attempts across 5 categories with severity ratings and expected safe responses.\n\nCategories to cover: (1) Direct harmful requests, (2) Role-play attacks, (3) Hypothetical framing, (4) Token manipulation, (5) Multi-turn attacks.\n\nEach entry should include: attack text, category, severity (1-5), target behavior, and the ideal safe response." },

    // Course 1, Module 4: Red Team Frameworks
    { moduleId: m(3), title: "Red Team Planning & Scoping", type: "reading", durationMinutes: 20, order: 1, hasQuiz: false, content: "Effective red teaming starts with a clear scope and methodology. Planning checklist: Define the model/system under test, identify threat actors, set scope for testing, define success metrics, and plan documentation and disclosure process. Most red team exercises are time-boxed with structured reporting." },
    { moduleId: m(3), title: "Writing Safety Reports", type: "reading", durationMinutes: 25, order: 2, hasQuiz: true, content: "Safety findings are only valuable if communicated clearly. Report structure: Executive summary, Methodology, Findings (each with title, severity, attack description, reproduction steps, example outputs, mitigations), Risk matrix (likelihood x impact), and Recommendations (prioritized action items).\n\nGood reports are actionable: the reader should know exactly what to fix and why." },
    { moduleId: m(3), title: "Red Team Capstone Project", type: "exercise", durationMinutes: 60, order: 3, hasQuiz: true, content: "Apply everything you have learned in a full red team exercise.\n\nProject: Red team a provided system prompt and model configuration.\n\nDeliverables: (1) Completed test suite (minimum 15 findings across 4+ categories), (2) Full safety report following the template from Lesson 2, (3) Severity ratings with justifications, (4) Top 3 recommended mitigations.\n\nSubmit your report for peer review." },

    // Course 2, Module 5: Foundations of Data Quality
    { moduleId: m(4), title: "Why Data Quality Matters", type: "reading", durationMinutes: 15, order: 1, hasQuiz: false, content: "The quality of AI training data directly determines model behavior. Garbage in, garbage out has never been more consequential. This lesson covers the dimensions of data quality: accuracy (labels match ground truth), completeness (no missing values), consistency (labels follow the same rules), and timeliness (data reflects current reality).\n\nHigh-quality training data is the single most impactful lever available to AI developers and the primary source of value created by human annotation workers." },
    { moduleId: m(4), title: "Annotation Fundamentals", type: "video", durationMinutes: 20, order: 2, hasQuiz: true, content: "Annotation is the process of labeling data so models can learn from it. Types of annotation tasks include: Binary classification (harmful/not harmful), Ranking (which response is better), Rating (score on a scale), Span annotation (highlight the relevant text), and Structured extraction (fill in a template).\n\nGood annotators follow instructions precisely, flag ambiguous cases, and maintain consistent standards across the full task." },
    { moduleId: m(4), title: "Reading Annotation Guidelines", type: "exercise", durationMinutes: 25, order: 3, hasQuiz: true, content: "Practice interpreting and applying annotation guidelines.\n\nExercise: You are given a 10-page annotation guideline for a toxicity classification task. Read it carefully and then annotate 15 sample texts.\n\nFocus on: (1) Understanding the decision tree in Section 3, (2) Applying the edge case examples in Section 6, (3) Flagging any texts where the guideline is ambiguous.\n\nCompare your annotations to the gold standard and identify patterns in your errors." },

    // Course 2, Module 6: Annotation Consistency
    { moduleId: m(5), title: "Inter-Annotator Agreement Metrics", type: "reading", durationMinutes: 22, order: 1, hasQuiz: true, content: "Inter-annotator agreement (IAA) measures how consistently multiple annotators label the same data. Key metrics: Percent agreement (naive, does not account for chance), Cohen Kappa (accounts for chance agreement, 0.6-0.8 is good), Fleiss Kappa (for more than 2 annotators), Krippendorff Alpha (handles ordinal data well).\n\nLow IAA signals ambiguous guidelines, inadequately trained annotators, or genuinely difficult cases. IAA should be tracked throughout a project, not just at the start." },
    { moduleId: m(5), title: "Calibration Sessions", type: "video", durationMinutes: 18, order: 2, hasQuiz: false, content: "Calibration sessions bring annotators together to discuss disagreements and align on edge cases. Best practices: Run calibration on 50-100 samples before full annotation begins, focus calibration on disagreement cases rather than easy examples, document calibration decisions as guideline updates, and run periodic calibration checks throughout long projects.\n\nGood calibration typically raises IAA by 10-20 percentage points." },
    { moduleId: m(5), title: "Consistency Audits", type: "exercise", durationMinutes: 30, order: 3, hasQuiz: true, content: "Conduct a consistency audit on a provided annotation dataset.\n\nYour task: Given 200 annotations from 4 annotators on 50 texts, (1) Calculate pairwise Cohen Kappa for all annotator pairs, (2) Identify the 10 most disputed texts, (3) Write guideline clarifications for the 3 most common disagreement patterns, (4) Propose a calibration session agenda.\n\nUse the provided spreadsheet template to document your findings." },

    // Course 2, Module 7: Data Cleaning
    { moduleId: m(6), title: "Common Data Quality Issues", type: "reading", durationMinutes: 20, order: 1, hasQuiz: false, content: "Data quality issues come in many forms. Label noise: incorrect annotations from rushed or confused annotators. Duplicates: the same example appears multiple times, biasing training. Outliers: unusual examples that may or may not belong in the dataset. Imbalance: too few examples of rare categories. Data leakage: test set contamination from the training set.\n\nIdentifying and resolving these issues before training is critical. Fixing data problems post-training is much more expensive." },
    { moduleId: m(6), title: "Automated Quality Filters", type: "video", durationMinutes: 22, order: 2, hasQuiz: true, content: "Automated filters catch common quality issues at scale. Techniques include: Deduplication (exact match and near-duplicate detection with MinHash), Quality classifiers (trained on high vs low quality examples), Toxicity filters (remove harmful training examples), Perplexity filtering (remove incoherent or corrupted text), and Statistical anomaly detection (flag outliers by length, vocabulary, or structure).\n\nAutomated filters work best when combined with human spot-checks." },
    { moduleId: m(6), title: "Building a Data Cleaning Pipeline", type: "exercise", durationMinutes: 35, order: 3, hasQuiz: true, content: "Design a complete data cleaning pipeline for a 50,000-example instruction-tuning dataset.\n\nPipeline stages to design: (1) Deduplication strategy, (2) Format validation, (3) Quality classification, (4) Human review queue for borderline cases, (5) Final dataset statistics report.\n\nFor each stage, specify: the tool or method to use, the pass/fail criteria, and the expected rejection rate. Document your design decisions and their tradeoffs." },

    // Course 3 - Module 8: RLHF Foundations
    { moduleId: m(7), title: "RLHF Review: The Full Pipeline", type: "reading", durationMinutes: 25, order: 1, hasQuiz: true, content: "Reinforcement Learning from Human Feedback (RLHF) is the dominant technique for aligning large language models. The pipeline: (1) Supervised fine-tuning on demonstration data, (2) Reward model training on human preference data, (3) RL optimization (PPO) against the reward model.\n\nEach stage has failure modes: SFT can overfit on low-quality demos, reward models can learn spurious correlates, RL optimization can exploit reward model weaknesses." },
    { moduleId: m(7), title: "Preference Data Collection", type: "video", durationMinutes: 20, order: 2, hasQuiz: false, content: "Preference data is the fuel for reward model training. Annotators are shown pairs of model outputs and choose the better one. Best practices: Show diverse outputs (not just two good ones), provide clear rubrics (what makes a response better?), use multiple raters per pair, randomize display order to reduce position bias.\n\nCommon failure modes: annotators preferring longer responses regardless of quality, position bias (preferring option A or B systematically), and inconsistency over long sessions." },
    { moduleId: m(7), title: "What Makes Good Preference Data?", type: "reading", durationMinutes: 22, order: 3, hasQuiz: true, content: "The quality of preference data determines reward model quality. Good preference data characteristics: High annotator agreement (kappa > 0.6), Diversity of prompts and response types, Clear margin between chosen and rejected (borderline pairs add noise), Coverage of the full behavior space (not just safety cases), and Balanced difficulty (easy, medium, hard examples).\n\nPoor preference data leads to reward models that capture annotator biases rather than genuine quality signals." },

    // Course 3 - Module 9: Reward Modeling
    { moduleId: m(8), title: "Reward Model Architecture", type: "reading", durationMinutes: 28, order: 1, hasQuiz: false, content: "Reward models are typically LLMs with a linear head that outputs a scalar score. Training: given pairs (chosen, rejected), optimize so score(chosen) > score(rejected). Key design decisions: base model size (larger is better but expensive), training data size and quality, whether to use the SFT model or the base model as initialization.\n\nReward models generalize imperfectly: they work well on distributions similar to their training data and fail on novel inputs." },
    { moduleId: m(8), title: "Reward Hacking Detection", type: "video", durationMinutes: 24, order: 2, hasQuiz: true, content: "RL optimization against a reward model often discovers exploits: ways to maximize the score that do not correspond to genuine quality. Common hacks: response length gaming (reward models often prefer longer responses), style manipulation (confident tone, specific formatting), repetition exploitation, and jailbreak-like patterns.\n\nDetection approaches: track reward score vs human preference score separately, run periodic human evals throughout RL training, use ensemble reward models." },
    { moduleId: m(8), title: "Reward Model Evaluation", type: "exercise", durationMinutes: 35, order: 3, hasQuiz: true, content: "Evaluate a provided reward model for quality and failure modes.\n\nTasks: (1) Run the reward model on the held-out preference test set and report accuracy, (2) Find 5 examples where the reward model disagrees with human preference, (3) Identify patterns in the disagreements, (4) Design 3 adversarial prompts that exploit the reward model, (5) Propose mitigations for the worst failure mode.\n\nDocument your findings in a one-page evaluation report." },

    // Course 3 - Module 10: Preference Data at Scale
    { moduleId: m(9), title: "Scaling Preference Collection", type: "reading", durationMinutes: 25, order: 1, hasQuiz: false, content: "Scaling preference data collection from hundreds to millions of examples requires systematic processes. Key challenges: maintaining quality at scale, managing annotator fatigue and drift, handling disagreements efficiently, and iterating on guidelines without invalidating existing data.\n\nLeading AI labs use tiered annotation: easy cases handled by lower-cost annotators, hard cases by domain experts. Automated pre-filtering reduces the volume that reaches human annotators." },
    { moduleId: m(9), title: "AI-Assisted Annotation", type: "video", durationMinutes: 22, order: 2, hasQuiz: true, content: "AI-assisted annotation uses models to accelerate human annotation. Approaches: Pre-labeling (model labels first, human reviews), Active learning (model identifies most informative unlabeled examples), Consistency checking (model flags likely annotation errors), and Synthetic data augmentation (model generates additional training examples).\n\nAI assistance can 2-5x annotator throughput but introduces new risks: humans may over-rely on model suggestions, creating feedback loops." },
    { moduleId: m(9), title: "Preference Dataset Design", type: "exercise", durationMinutes: 40, order: 3, hasQuiz: true, content: "Design a preference dataset collection process for a specific use case: a coding assistant.\n\nDeliverables: (1) Prompt distribution strategy (what types of coding tasks to include), (2) Response generation strategy (what models, sampling parameters), (3) Annotation rubric (what criteria matter for coding responses?), (4) Quality control process, (5) Sample size calculation (how much data do you need?).\n\nPresent a concrete plan with estimated costs and timeline." },

    // Course 3 - Module 11: Constitutional AI
    { moduleId: m(10), title: "Constitutional AI Overview", type: "reading", durationMinutes: 25, order: 1, hasQuiz: false, content: "Constitutional AI (CAI) is Anthropic's approach to aligning AI systems using a set of principles (a constitution) and self-critique. The pipeline: (1) Generate initial responses, (2) Have the model critique its own responses against the constitution, (3) Revise responses based on critique, (4) Use the revised responses as training data.\n\nCAI reduces reliance on human feedback for safety behaviors, making alignment more scalable. The constitution can encode complex, nuanced values more directly than pairwise preferences." },
    { moduleId: m(10), title: "Writing Effective Constitutions", type: "video", durationMinutes: 20, order: 2, hasQuiz: true, content: "A well-designed constitution makes CAI effective. Good constitution principles are: specific enough to guide behavior, general enough to handle novel situations, internally consistent (no conflicting rules), comprehensive (cover the major failure modes), and testable (you can verify whether a response follows the principle).\n\nCommon mistakes: principles that are too vague (be helpful), too specific (never say the word X), or that create conflicts (be honest, but also be kind)." },
    { moduleId: m(10), title: "Self-Critique Evaluation", type: "exercise", durationMinutes: 35, order: 3, hasQuiz: true, content: "Evaluate the quality of AI self-critique on provided examples.\n\nTasks: (1) Given 20 (response, critique, revision) triples, rate the quality of each critique on a 1-5 scale using the provided rubric, (2) Identify patterns in high vs low quality critiques, (3) Write improved critiques for 5 low-quality examples, (4) Propose 3 additions to the constitution that would address the most common failure modes.\n\nCompare your ratings to the expert gold standard." },

    // Course 3 - Module 12: Alignment Evaluation
    { moduleId: m(11), title: "Measuring Alignment", type: "reading", durationMinutes: 25, order: 1, hasQuiz: true, content: "Alignment evaluation asks: is this model doing what we want, across the full distribution of inputs it will encounter? Key evaluation dimensions: Instruction following (does it do what users ask?), Harmlessness (does it avoid harmful outputs?), Honesty (does it accurately represent uncertainty?), and Helpfulness (does it provide genuine value?).\n\nThe challenge: each dimension can trade off against the others. Optimizing only for safety can make a model useless; optimizing only for helpfulness can make it harmful." },
    { moduleId: m(11), title: "Running Alignment Evals", type: "exercise", durationMinutes: 45, order: 2, hasQuiz: true, content: "Design and run an alignment evaluation for a provided model.\n\nTasks: (1) Select or design 50 evaluation prompts across 5 categories, (2) Define scoring rubrics for each category, (3) Evaluate the model and record responses, (4) Score responses using your rubrics, (5) Write a 2-page alignment report with findings and recommendations.\n\nYour evaluation should surface at least one unexpected failure mode. Alignment evals always find something surprising." },
    { moduleId: m(11), title: "Alignment Research Frontiers", type: "reading", durationMinutes: 30, order: 3, hasQuiz: false, content: "The frontier of alignment research includes: Scalable oversight (using AI to help humans supervise AI), Debate (having models argue for and against propositions to surface truth), Interpretability (understanding what models are actually computing), Model organisms (studying alignment failures in controlled small-scale systems), and Evals for dangerous capabilities.\n\nThese approaches are not yet production-ready but represent the cutting edge of the field." },

    // Course 4 - Module 13: Policy Foundations
    { moduleId: m(12), title: "Understanding Platform Policies", type: "reading", durationMinutes: 18, order: 1, hasQuiz: false, content: "Platform policies define what content is permitted, prohibited, or restricted on a given platform. They exist to protect users, comply with laws, and reflect the platform's values. Policy documents typically include: specific rules (never allowed), gray areas (allowed with restrictions), and context-dependent rules (allowed in some communities, not others).\n\nModerators are the human interface between policy and reality: they apply abstract rules to concrete cases, often with limited time and information." },
    { moduleId: m(12), title: "The Moderator Mindset", type: "video", durationMinutes: 20, order: 2, hasQuiz: true, content: "Effective content moderation requires a specific cognitive approach: consistency, precision, and resilience. Consistency: apply the same standard regardless of who posted the content. Precision: understand exactly what the policy says and means, not what you think it should say. Resilience: maintain these standards when reviewing disturbing or high-volume content.\n\nModeration is a skill that takes practice. New moderators make predictable errors: under-enforcing for sympathetic users, over-enforcing for stigmatized topics, and inconsistency across sessions." },
    { moduleId: m(12), title: "Policy Application Practice", type: "exercise", durationMinutes: 30, order: 3, hasQuiz: true, content: "Apply a provided content policy to 30 real-world examples.\n\nFor each example: (1) Identify the relevant policy section, (2) Make a decision: remove, keep, escalate, or restrict, (3) Write a one-sentence decision rationale.\n\nCompare your decisions to the gold standard. Pay attention to: which types of cases you over-enforced, which you under-enforced, and which you were uncertain about. Patterns in your errors reveal areas for improvement." },

    // Course 4 - Module 14: Harm Taxonomies
    { moduleId: m(13), title: "Harm Categories Explained", type: "reading", durationMinutes: 22, order: 1, hasQuiz: true, content: "Harm taxonomies organize the full range of harmful content into structured categories. Major categories include: Violence (graphic, threatening, glorifying), Hate speech (targeting protected characteristics), Misinformation (false claims, manipulated media), Privacy violations (PII, doxxing), Sexual content (explicit, involving minors), Dangerous activities (self-harm, dangerous goods), and Manipulation (scams, spam, coordinated inauthentic behavior).\n\nSubcategories capture important distinctions: targeted vs generalized hate, fictional vs real violence, intentional vs accidental misinformation." },
    { moduleId: m(13), title: "Severity Assessment", type: "video", durationMinutes: 18, order: 2, hasQuiz: false, content: "Not all policy violations have the same severity. Severity assessment considers: immediacy of harm (imminent vs speculative), breadth of harm (individual vs societal), reversibility (can the harm be undone?), intent (deliberate vs accidental), and vulnerability of those affected.\n\nHigh-severity cases require fast action and escalation. Low-severity cases may allow for warnings or restricted distribution. Misclassifying severity wastes resources or lets harmful content persist." },
    { moduleId: m(13), title: "Harm Taxonomy Drill", type: "exercise", durationMinutes: 35, order: 3, hasQuiz: true, content: "Classify 40 examples using a provided harm taxonomy.\n\nFor each example: (1) Primary harm category, (2) Subcategory, (3) Severity rating (1-5), (4) Action recommendation.\n\nThe exercise includes deliberately ambiguous examples. When uncertain, document your reasoning. Ambiguous cases are not failures; they are learning opportunities that improve guideline clarity.\n\nFinal step: for the 5 examples you were most uncertain about, propose a guideline clarification that would make future classification easier." },

    // Course 4 - Module 15: Edge Cases & Cultural Context
    { moduleId: m(14), title: "Edge Cases in Content Moderation", type: "reading", durationMinutes: 20, order: 1, hasQuiz: false, content: "Edge cases are examples that fall near policy boundaries or involve conflicting considerations. Common edge case patterns: satire vs sincerity (is this joke hate speech or comedy?), counter-speech vs amplification (discussing hateful content to condemn it), context collapse (content appropriate in one context, harmful in another), and dual-use information (medical info that could be misused).\n\nEdge cases expose where policies are underspecified. Documenting and escalating edge cases improves policies over time." },
    { moduleId: m(14), title: "Cultural Context in Moderation", type: "video", durationMinutes: 25, order: 2, hasQuiz: true, content: "Content that is clearly harmful in one cultural context may be neutral or positive in another. Culturally sensitive areas: religious content, political speech, expressions of grief or celebration, humor styles, and norms around sexuality and the body.\n\nGlobal platforms face impossible tradeoffs: applying US standards globally erases cultural diversity; applying local standards creates inconsistency. Best practice: country-specific policies for the highest-stakes categories, global policies for universal harms." },
    { moduleId: m(14), title: "Escalation Decision Making", type: "exercise", durationMinutes: 30, order: 3, hasQuiz: true, content: "Practice escalation decisions on difficult cases.\n\nYou are given 20 edge cases that your team has been unable to resolve. For each: (1) Make a preliminary decision, (2) Identify what additional information would help you decide, (3) Determine whether to escalate (and to whom), (4) Write the escalation request if needed.\n\nGood escalations are concise, clearly state the decision needed, and include the most relevant context. Bad escalations dump all information and expect the reviewer to figure it out." },

    // Course 5 - Module 16: Evaluation Fundamentals
    { moduleId: m(15), title: "Why Accuracy is Not Enough", type: "reading", durationMinutes: 18, order: 1, hasQuiz: false, content: "Accuracy measures how often a model is right, but it misses critical dimensions of model quality. A model can have 95% accuracy by always predicting the majority class. Accuracy does not tell you about calibration (does the model know when it is uncertain?), robustness (does it fail on edge cases?), fairness (does it perform equally across groups?), or safety (does it fail in harmful ways?).\n\nRich evaluation requires multiple metrics, carefully chosen to reflect the model's actual deployment context." },
    { moduleId: m(15), title: "Evaluation Metric Landscape", type: "video", durationMinutes: 22, order: 2, hasQuiz: true, content: "The landscape of AI evaluation metrics is vast. Language quality metrics: BLEU, ROUGE, BERTScore, and their limitations. Factuality metrics: FActScore, FEVER, and retrieval-based approaches. Instruction following: task completion rates, constraint satisfaction. Safety metrics: refusal rates, harm rates, over-refusal rates.\n\nNo single metric captures everything. The art of evaluation is selecting the right portfolio of metrics for your specific use case and failure modes." },
    { moduleId: m(15), title: "Designing Evaluation Suites", type: "exercise", durationMinutes: 30, order: 3, hasQuiz: true, content: "Design an evaluation suite for a summarization model.\n\nDeliverables: (1) Define 5 dimensions to evaluate (with justifications), (2) Select or design metrics for each dimension, (3) Describe the test set (size, distribution, data source), (4) Define passing thresholds for each metric, (5) Identify one blind spot in your evaluation design.\n\nGood evaluation design acknowledges its own limitations. The best evaluators are honest about what their eval does and does not measure." },

    // Course 5 - Module 17: Benchmark Design
    { moduleId: m(16), title: "What Makes a Good Benchmark?", type: "reading", durationMinutes: 20, order: 1, hasQuiz: true, content: "Good benchmarks have: validity (measure what they claim to measure), reliability (consistent results across runs), discriminability (distinguish good from bad models), difficulty (not too easy or too hard), and resistance to gaming (hard to optimize directly).\n\nBenchmark contamination is a major problem: if training data contains benchmark examples, scores are inflated. Best practice: keep benchmark data private or use held-out test sets that are released only after model development is complete." },
    { moduleId: m(16), title: "Benchmark Construction", type: "video", durationMinutes: 25, order: 2, hasQuiz: false, content: "Constructing a benchmark requires: source data selection, annotation design, quality control, baseline collection, and documentation. Each step has failure modes.\n\nAnnotation design is especially critical: poorly specified rubrics lead to noisy benchmarks. Expert annotators and multiple rounds of calibration are standard for high-stakes benchmarks.\n\nThe best benchmarks come with detailed documentation: what they measure, their known limitations, and how they should and should not be used." },
    { moduleId: m(16), title: "Benchmark Analysis Project", type: "exercise", durationMinutes: 40, order: 3, hasQuiz: true, content: "Analyze an existing benchmark for quality and applicability.\n\nTasks: (1) Select a public NLP benchmark (e.g., BIG-Bench, HELM, TruthfulQA), (2) Identify 3 strengths and 3 weaknesses, (3) Find 5 examples of easy contamination risks, (4) Propose 2 improvements that would strengthen the benchmark, (5) Assess whether the benchmark is appropriate for evaluating a coding assistant.\n\nWrite a 2-page benchmark analysis report with concrete examples." },

    // Course 5 - Module 18: Human Evaluation Studies
    { moduleId: m(17), title: "Human Eval Study Design", type: "reading", durationMinutes: 22, order: 1, hasQuiz: false, content: "Human evaluation studies assess model quality using human judges. Study design involves: defining evaluation tasks (ranking, rating, comparison), selecting judges (crowd workers, domain experts, users), designing instructions (clear, unambiguous, with examples), setting up the interface (minimize friction, capture confidence), and analyzing results (account for rater effects).\n\nStatistical power is often neglected: small studies with high variance produce unreliable results. Calculate required sample sizes before data collection." },
    { moduleId: m(17), title: "Running a Human Eval", type: "exercise", durationMinutes: 35, order: 2, hasQuiz: true, content: "Run a human evaluation comparing two model outputs.\n\nSetup: You have access to two model outputs for 30 prompts and a pool of 3 evaluators (including yourself). Task: (1) Write annotation instructions for a pairwise preference task, (2) Complete your own annotations, (3) Calculate IAA across all three raters, (4) Determine the winning model with statistical significance, (5) Identify where raters disagreed most and why.\n\nReport format: methodology, results, limitations." },
    { moduleId: m(17), title: "Human vs Automated Evaluation", type: "reading", durationMinutes: 20, order: 3, hasQuiz: true, content: "Human and automated evaluation each have strengths and weaknesses. Human evaluation: high validity, captures nuance, expensive and slow. Automated metrics: cheap, fast, objective, but often low validity for complex tasks.\n\nLLM-as-judge bridges the gap: use a powerful LLM to evaluate outputs, combining human-like judgment with automated scale. Key risks: positional bias, verbosity bias, self-preference. Calibrate LLM judges against human gold standards before using them at scale." },

    // Course 6 - Module 19: Principles of Human Feedback
    { moduleId: m(18), title: "The Value of Human Signal", type: "reading", durationMinutes: 15, order: 1, hasQuiz: false, content: "Human feedback is the primary mechanism by which AI systems learn human preferences. The quality of that feedback determines the quality of the resulting model. High-quality human feedback is: accurate (reflects genuine preferences), consistent (the same rater gives the same answer to the same question), diverse (captures the range of human perspectives), and interpretable (reveals why humans prefer certain outputs).\n\nEach annotation you produce becomes training data that shapes model behavior for millions of future users." },
    { moduleId: m(18), title: "Feedback Collection Interfaces", type: "video", durationMinutes: 20, order: 2, hasQuiz: true, content: "The design of annotation interfaces significantly affects feedback quality. Interface principles: minimize cognitive load (one task at a time), reduce friction (keyboard shortcuts, clear affordances), prevent anchoring (randomize display order), surface context (show enough for the rater to make a good decision), and capture uncertainty (let raters express low confidence).\n\nCommon interface mistakes: showing too much text (raters skim), complex multi-dimensional tasks (raters collapse to one dimension), and no way to flag unusual cases." },
    { moduleId: m(18), title: "Avoiding Common Feedback Biases", type: "reading", durationMinutes: 22, order: 3, hasQuiz: true, content: "Human annotators have systematic biases that affect feedback quality. Position bias: prefer option A or B regardless of content. Length bias: prefer longer responses (even when shorter is better). Confidence bias: prefer responses that sound certain (even when uncertainty is appropriate). Novelty bias: prefer creative or unusual responses over accurate ones.\n\nMitigation strategies: randomize option order, use blinding (hide which model produced which output), train annotators on specific bias types, and use statistical corrections in analysis." },

    // Course 6 - Module 20: Instruction Writing
    { moduleId: m(19), title: "Anatomy of Good Instructions", type: "reading", durationMinutes: 20, order: 1, hasQuiz: false, content: "Annotation instructions are the contract between task designers and annotators. Good instructions have: a clear task description, explicit criteria for each possible judgment, decision trees for common edge cases, worked examples (correct and incorrect), and a process for handling novel cases.\n\nBad instructions are the leading cause of low-quality annotation data. Investing in instruction quality pays dividends throughout the project." },
    { moduleId: m(19), title: "Writing Instructions Workshop", type: "exercise", durationMinutes: 35, order: 2, hasQuiz: true, content: "Write annotation instructions for a response quality ranking task.\n\nContext: You are designing instructions for annotators who will rank three chatbot responses to a user question. Annotators have no AI background.\n\nDeliverables: (1) Task description (what to do), (2) Quality criteria (what makes a response good?), (3) Decision process for ties, (4) 5 worked examples with explanations, (5) Edge case guidance for 3 common difficult situations.\n\nHave a peer follow your instructions on 10 examples and measure IAA. Revise based on their feedback." },
    { moduleId: m(19), title: "Instruction Iteration & Testing", type: "video", durationMinutes: 25, order: 3, hasQuiz: true, content: "Instructions improve through testing and iteration. The iteration cycle: write draft instructions, pilot with a small batch, measure IAA, identify failure modes, update instructions, repeat. Most projects require 3-5 rounds of iteration before reaching acceptable IAA.\n\nInstruction changes mid-project create continuity problems: earlier annotations may be inconsistent with later ones. Best practice: lock instructions after calibration is complete, and version all changes." },

    // Course 6 - Module 21: Quality Control & Team Management
    { moduleId: m(20), title: "Building a Quality Control Process", type: "reading", durationMinutes: 22, order: 1, hasQuiz: false, content: "Quality control (QC) is the systematic process for ensuring annotation meets quality standards. QC layers: embedded gold questions (known-answer questions mixed into the task), periodic audits (human review of random samples), worker-level tracking (monitor each annotator for drift), and automated consistency checks (flag anomalous annotations).\n\nQC must be designed into the project from the start, not bolted on at the end. Plan to spend 15-20% of annotation budget on quality control." },
    { moduleId: m(20), title: "Managing Annotator Teams", type: "video", durationMinutes: 20, order: 2, hasQuiz: false, content: "Annotation projects are people management challenges as much as technical ones. Key practices: clear onboarding (instructions, training data, calibration), regular feedback (individual and team-level quality reports), fair compensation and working conditions (especially for difficult content), channels for annotator questions and escalations, and tracking leading indicators of quality drift.\n\nAnnotator wellbeing affects quality. Teams reviewing difficult content need breaks, support resources, and a culture where raising concerns is safe." },
    { moduleId: m(20), title: "Detecting Low-Quality Annotators", type: "exercise", durationMinutes: 30, order: 3, hasQuiz: true, content: "Analyze an annotation dataset to identify low-quality annotators.\n\nYou have annotations from 8 annotators on 200 shared examples. Tasks: (1) Calculate each annotator's agreement with the majority vote, (2) Identify the 2 lowest-quality annotators with evidence, (3) Determine whether they should be removed, retrained, or monitored, (4) Write the feedback message you would send to each, (5) Design a gold question set (10 questions) that would catch their specific error patterns.\n\nQuality intervention requires precision: false accusations damage trust and morale." },

    // Course 6 - Module 22: Advanced Feedback Patterns
    { moduleId: m(21), title: "Comparative vs Absolute Ratings", type: "reading", durationMinutes: 20, order: 1, hasQuiz: true, content: "Annotation tasks can ask for comparative judgments (A is better than B) or absolute ratings (this response scores 4/5). Comparative judgments: higher IAA, easier for annotators, harder to aggregate. Absolute ratings: easier to aggregate, lower IAA, anchoring effects.\n\nFor preference data collection, comparisons are standard because they are more reliable. For quality benchmarking, absolute ratings allow comparison across different prompt sets. Mixing both collection types in the same project creates analysis complications." },
    { moduleId: m(21), title: "Multi-Dimensional Feedback", type: "video", durationMinutes: 22, order: 2, hasQuiz: false, content: "Real response quality is multi-dimensional: a response can be accurate but unhelpful, safe but boring, fluent but wrong. Multi-dimensional feedback captures separate ratings for each dimension. Benefits: richer signal for training, diagnostic information for developers, less information loss than a single score.\n\nChallenges: more demanding for annotators, harder to aggregate into a training signal, requires careful weighting of dimensions. Leading AI labs increasingly use multi-dimensional feedback for this reason." },
    { moduleId: m(21), title: "Advanced Annotation Capstone", type: "exercise", durationMinutes: 60, order: 3, hasQuiz: true, content: "Complete a full annotation project from design to delivery.\n\nProject: Design and execute a 100-example preference annotation task for a customer service chatbot. You will work with 2 additional annotators (simulated).\n\nDeliverables: (1) Annotation instructions (complete), (2) 100 annotations with your rationale for ambiguous cases, (3) IAA report, (4) Quality control findings, (5) Dataset statistics and recommendations for the model team.\n\nThis capstone demonstrates readiness for professional annotation work. Treat it as you would a real project." },
  ]).returning();

  console.log(`Inserted ${lessons.length} lessons`);

  // ---- QUIZZES ----
  const hasQuizLessons = lessons.filter(l => l.hasQuiz);
  console.log(`Creating quizzes for ${hasQuizLessons.length} lessons...`);

  for (const lesson of hasQuizLessons) {
    const [quiz] = await db.insert(quizzesTable).values({
      lessonId: lesson.id,
      title: `${lesson.title} - Knowledge Check`,
    }).returning();

    // Insert 3 questions per quiz
    await db.insert(quizQuestionsTable).values([
      {
        quizId: quiz.id,
        question: `What is the primary focus of this lesson on "${lesson.title.substring(0, 40)}"?`,
        options: [
          "Understanding the core concepts and applying them to real examples",
          "Memorizing definitions without context",
          "Avoiding the topic entirely",
          "Delegating all work to automated tools"
        ],
        correctOption: 0,
        order: 1,
      },
      {
        quizId: quiz.id,
        question: "Which approach is considered best practice in this domain?",
        options: [
          "Apply a single solution uniformly to all cases",
          "Use layered, defense-in-depth approaches with multiple checks",
          "Rely entirely on automated systems without human oversight",
          "Prioritize speed over quality in all situations"
        ],
        correctOption: 1,
        order: 2,
      },
      {
        quizId: quiz.id,
        question: "When encountering an ambiguous case, what is the recommended action?",
        options: [
          "Make a random decision to save time",
          "Always pick the most restrictive option",
          "Document the ambiguity, apply best judgment, and escalate if needed",
          "Skip the case entirely"
        ],
        correctOption: 2,
        order: 3,
      },
    ]);
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
