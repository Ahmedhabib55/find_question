"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Plus } from "lucide-react";
import { useDebounce } from "use-debounce";
import {
  searchQuestions,
  addQuestion,
  subjects,
  type Subject,
} from "@/lib/typesense";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import FakeCall from "@/components/fakeCall";

interface Question {
  id: string;
  question: string;
  answer: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject>("systems");
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const { toast } = useToast();

  // Click tracking
  useEffect(() => {
    if (clickCount === 3) {
      console.log("User clicked 3 times");
      setClickCount(0); // Reset counter after logging
    }
  }, [clickCount]);

  const handleClick = useCallback(() => {
    setClickCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (debouncedQuery.length > 0) {
        try {
          const results = await searchQuestions(
            debouncedQuery,
            selectedSubject
          );
          const typedResults: Question[] = results.map((result: any) => ({
            id: result.id,
            question: result.question,
            answer: result.answer,
          }));
          setQuestions(typedResults);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to fetch questions",
            variant: "destructive",
          });
          setQuestions([]);
        }
      } else {
        setQuestions([]);
      }
    };

    fetchQuestions();
  }, [debouncedQuery, selectedSubject, toast]);

  const handleAddQuestion = async () => {
    console.log(
      "Adding question form page:",
      selectedSubject,
      newQuestion,
      newAnswer
    );
    try {
      const result = await addQuestion(selectedSubject, newQuestion, newAnswer);
      setQuestions((prev) => [result, ...prev]);
      setNewQuestion("");
      setNewAnswer("");
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Question added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 dark:bg-yellow-800">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <main
      className="min-h-screen bg-background p-4 md:p-8"
      onClick={handleClick}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-6">
          <h1 className="sm:text-xl text-4xl font-bold tracking-tight">
            Question Search
          </h1>

          <ToggleGroup
            type="single"
            value={selectedSubject}
            onValueChange={(value) => {
              if (value) setSelectedSubject(value as Subject);
            }}
            className="justify-center overflow-hidden overflow-x-auto"
          >
            {subjects.map((subject) => (
              <ToggleGroupItem
                key={subject.id}
                value={subject.id}
                aria-label={`Toggle ${subject.name}`}
                className="px-4 py-2"
              >
                {subject.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={`Search ${selectedSubject} questions...`}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog
            open={isDialogOpen}
            // open={true}
            onOpenChange={setIsDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="hidden lg:flex">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question</label>
                  <Textarea
                    placeholder="Enter your question"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Answer</label>
                  <Textarea
                    placeholder="Enter the answer"
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleAddQuestion}
                  disabled={!newQuestion.trim() || !newAnswer.trim()}
                >
                  Submit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg bg-card">
          <div className="h-[calc(100vh-400px)] overflow-y-auto p-4 space-y-4">
            {questions.map((question) => (
              <Card
                key={question.id}
                className="p-6 hover:bg-muted/50 transition-colors"
              >
                <h2 className="text-xl font-semibold mb-4">
                  {highlightText(question.question, searchQuery)}
                </h2>
                <div className="pl-4 border-l-4 border-primary/20">
                  <p className="text-muted-foreground">
                    {highlightText(question.answer, searchQuery)}
                  </p>
                </div>
              </Card>
            ))}
            {searchQuery && questions.length === 0 && (
              <p className="text-center text-muted-foreground">
                No {selectedSubject} questions found
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="">
        <FakeCall />
      </div>
    </main>
  );
}
