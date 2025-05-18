import Typesense from "typesense";

if (
  !process.env.NEXT_PUBLIC_TYPESENSE_HOST ||
  !process.env.NEXT_PUBLIC_TYPESENSE_PORT ||
  !process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL ||
  !process.env.NEXT_PUBLIC_TYPESENSE_API_SEARCH_KEY ||
  !process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
) {
  throw new Error("Missing Typesense configuration environment variables");
}

const client = new Typesense.Client({
  nodes: [
    {
      host: process.env.NEXT_PUBLIC_TYPESENSE_HOST,
      port: parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT),
      protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: process.env.NEXT_PUBLIC_TYPESENSE_API_SEARCH_KEY,
  connectionTimeoutSeconds: 2,
  retryIntervalSeconds: 1,
  numRetries: 3,
});

const clientForCreate = new Typesense.Client({
  nodes: [
    {
      host: process.env.NEXT_PUBLIC_TYPESENSE_HOST,
      port: parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT),
      protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY,
  connectionTimeoutSeconds: 5,
});

export const subjects = [
  { id: "costs", name: "Costs" },
  { id: "zakat", name: "Zakat" },
  { id: "issues", name: "Issues" },
  { id: "administrative", name: "Administrative" },
  { id: "systems", name: "Systems" },
] as const;

export type Subject = (typeof subjects)[number]["id"];

const collectionSchema = (collectionName: string) => ({
  name: collectionName,
  fields: [
    { name: "id", type: "string" as "string" },
    { name: "question", type: "string" as "string" },
    { name: "answer", type: "string" as "string" },
    { name: "subject", type: "string" as "string" },
  ],
});

export const initializeCollections = async () => {
  for (const subject of subjects) {
    const collectionName = `${subject.id}_questions`;
    try {
      // Check if collection exists
      await clientForCreate.collections(collectionName).retrieve();
      console.log(`Collection ${collectionName} already exists`);
    } catch (error) {
      // Collection doesn't exist, create it
      try {
        await clientForCreate.collections().create({
          name: collectionName,
          ...collectionSchema,
        });
        console.log(`Created collection ${collectionName}`);
      } catch (error) {
        console.error(`Error creating collection ${collectionName}:`, error);
      }
    }
  }
};

export const searchQuestions = async (query: string, subject: Subject) => {
  try {
    // First check if we can connect to Typesense
    try {
      await client.health.retrieve();
    } catch (error) {
      throw new Error(
        "Unable to connect to Typesense server. Please ensure the server is running and accessible."
      );
    }

    const searchParameters = {
      q: query,
      query_by: "question",
      per_page: 5,
    };

    const searchResults = await client
      .collections(`${subject}_questions`)
      .documents()
      .search(searchParameters);
    return (searchResults.hits ?? []).map((hit) => hit.document);
  } catch (error) {
    console.error("Error searching questions:", error);
    throw error; // Re-throw the error to handle it in the UI
  }
};

export const addQuestion = async (
  subject: Subject,
  question: string,
  answer: string
) => {
  const collectionName = `${subject}_questions`;

  try {
    const document = {
      id: crypto.randomUUID(),
      question,
      answer,
      subject,
    };
    console.log("Adding question:", document);

    await clientForCreate
      .collections(collectionName)
      .documents()
      .create(document);

    return document;
  } catch (error) {
    console.error("Error adding question:", error);
    throw error;
  }
};

export const deleteQuestion = async (subject: Subject, id: string) => {
  try {
    await client.collections(`${subject}_questions`).documents(id).delete();
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};
