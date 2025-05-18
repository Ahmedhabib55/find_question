import { addQuestion, initializeCollections, subjects } from "../lib/typesense";

const sampleQuestions = {
  systems: [
    {
      question: "What is the Pythagorean theorem?",
      answer:
        "The square of the hypotenuse is equal to the sum of squares of the other two sides (a² + b² = c²)",
    },
    {
      question: "What is the quadratic formula?",
      answer: "For ax² + bx + c = 0, x = (-b ± √(b² - 4ac)) / (2a)",
    },
  ],
  zakat: [
    {
      question: "What is Newton's First Law?",
      answer:
        "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.",
    },
    {
      question: "What is Einstein's famous equation?",
      answer:
        "E = mc², where E is energy, m is mass, and c is the speed of light in vacuum.",
    },
  ],
  issues: [
    {
      question: "When did World War II end?",
      answer:
        "World War II ended in 1945, with Germany surrendering in May and Japan surrendering in August following the atomic bombings.",
    },
    {
      question: "Who was the first President of the United States?",
      answer: "George Washington, who served from 1789 to 1797.",
    },
  ],
  administrative: [
    {
      question: "What is the atomic number of Carbon?",
      answer:
        "The atomic number of Carbon is 6, meaning it has 6 protons in its nucleus.",
    },
    {
      question: "What is the pH scale?",
      answer:
        "The pH scale measures how acidic or basic a substance is, ranging from 0 (very acidic) to 14 (very basic), with 7 being neutral.",
    },
  ],
  costs: [
    {
      question: "What is the capital of France?",
      answer: "The capital of France is Paris.",
    },
    {
      question: "What is the largest planet in our solar system?",
      answer: "The largest planet in our solar system is Jupiter.",
    },
  ],
};

async function seedDatabase() {
  console.log("Initializing collections...");
  await initializeCollections();

  console.log("Seeding questions...");
  for (const subject of subjects) {
    const questions =
      sampleQuestions[subject.id as keyof typeof sampleQuestions];
    for (const { question, answer } of questions) {
      try {
        await addQuestion(subject.id, question, answer);
        console.log(`Added question to ${subject.id}_questions:`, question);
      } catch (error) {
        console.error(
          `Error adding question to ${subject.id}_questions:`,
          error
        );
      }
    }
  }

  console.log("Seeding complete!");
}
seedDatabase().catch(console.error);
