import React, { useState, useEffect } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { level1Questions, level2Questions, level3Questions } from "./QuestionsData";
import "./App.css";

// The main component for the behavioral preparation app
function BehavioralPrep() {
  // State to manage typing indicator
  const [typing, setTyping] = useState(false);
  
  // State to store chat messages
  const [messages, setMessages] = useState([
    {
      message: "Think of a time you achieved something. Please include as much details as possible.",
      sender: "ChatGPT",
      direction: "incoming",
    },
  ]);

  // State to store random questions for behavioral interview practice
  const [randomQuestions, setRandomQuestions] = useState([]);
  
  // State to store user-provided answers for the questions
  const [answers, setAnswers] = useState({});
  
  // State to store the user's input situation
  const [userSituation, setUserSituation] = useState("");
  
  // API key for OpenAI (loaded from environment variables)
  const API_Key = import.meta.env.VITE_OPENAI_API_KEY;

  // Generate random questions when the component first loads
  useEffect(() => {
    setRandomQuestions(generateRandomQuestions());
  }, []);

  // Generates random questions for all levels
  const generateRandomQuestions = () => [
    { level: 1, question: getRandomQuestion(level1Questions) },
    { level: 2, question: getRandomQuestion(level2Questions) },
    { level: 3, question: getRandomQuestion(level3Questions) },
  ];

  // Selects a random question from a given list
  const getRandomQuestion = (questions) =>
    questions[Math.floor(Math.random() * questions.length)];

  // Refreshes a question at a specific index and regenerates the associated answer
  const refreshQuestion = async (index, level) => {
    const newQuestion = getRandomQuestion(
      level === 1
        ? level1Questions
        : level === 2
        ? level2Questions
        : level3Questions
    );

    // Update the question list with the new question
    setRandomQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[index] = { level, question: newQuestion };
      return updatedQuestions;
    });

    // Regenerate the answer for the refreshed question
    await generateAnswerForSingleQuestion(newQuestion);
  };

  // Handles sending a message and processes the user's situation
  const handleSend = async (message) => {
    const newMessage = { message, sender: "user", direction: "outgoing" };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    if (!userSituation) {
      setUserSituation(message); // Store the user's situation
      await generateStarSolution(message, newMessages); // Generate a STAR-based response
    }
  };

  // Generates a STAR-based response for the user's situation
  const generateStarSolution = async (situation, chatMessages) => {
    setTyping(true);
    const prompt = `
      The user provided the following situation: "${situation}". 
      Please provide a STAR-based response structure (Situation, Task, Action, Result) for this situation.
    `;
    const response = await getChatGptResponse(prompt);
    const botResponse = { message: response, sender: "ChatGPT", direction: "incoming" };
    setMessages([...chatMessages, botResponse]);
    setTyping(false);

    // Generate answers for the common behavioral questions
    await generateAnswersForQuestions(situation);
  };

  // Generates STAR-based answers for the random questions
  const generateAnswersForQuestions = async (situation) => {
    setTyping(true);

    // Create a prompt for each question
    const questionPrompts = randomQuestions.map((q) => `
      Question: "${q.question}"
      User's situation: "${situation}"
      If the situation aligns, provide a STAR-based answer. 
      If it doesn't align, suggest: "Looks like your situation doesn't match the question. However, you could say something like this: <example response>".
    `);

    const prompt = questionPrompts.join("\n\n");
    const response = await getChatGptResponse(prompt);

    // Map the responses to the respective questions
    const answersArray = response.split("\n\n");
    const updatedAnswers = {};
    randomQuestions.forEach((q, i) => {
      updatedAnswers[q.question] = answersArray[i] || "No response generated.";
    });

    setAnswers(updatedAnswers);
    setTyping(false);
  };

  // Generates an answer for a single question
  const generateAnswerForSingleQuestion = async (question) => {
    setTyping(true);

    const prompt = `
      Question: "${question}"
      User's situation: "${userSituation}"
      If the situation aligns, provide a STAR-based answer. 
      If it doesn't align, suggest: "Looks like your situation doesn't match the question. However, you could say something like this: <example response>".
    `;
    const response = await getChatGptResponse(prompt);

    // Update the answers with the new response
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [question]: response || "No response generated.",
    }));

    setTyping(false);
  };

  // Communicates with ChatGPT API to get a response for the given prompt
  const getChatGptResponse = async (prompt) => {
    try {
      const apiRequestBody = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: "Provide detailed but simple answers." }, { role: "user", content: prompt }],
      };

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_Key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequestBody),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error communicating with ChatGPT:", error);
      return "Sorry, something went wrong while communicating with ChatGPT.";
    }
  };

  // Component UI rendering
  return (
    <div className="App">
      <div className="category-title">Prepare for Your Behavioral Interview</div>
      <div className="content-container">
        {/* STAR Method Overview Section */}
        <div className="star-intro">
          <h2>STAR Method Overview</h2>
          <p>
            The STAR method helps structure your answers to behavioral questions.
            If you’re unfamiliar, here’s a video explanation:
          </p>
          <p>
            <a href="https://www.youtube.com/watch?v=WRLF8ULhZmw" target="_blank" rel="noopener noreferrer">
              STAR Method Video
            </a>
          </p>
        </div>

        {/* Chat Section */}
        <h2>Brainstorming Collaboration For An Interview</h2>
        <div style={{ position: "relative", height: "400px", width: "100%" }}>
          <MainContainer>
            <ChatContainer>
              <MessageList typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing" /> : null}>
                {messages.map((msg, i) => (
                  <Message key={i} model={msg} />
                ))}
              </MessageList>
              <MessageInput placeholder="Type your situation here" onSend={handleSend} />
            </ChatContainer>
          </MainContainer>
        </div>

        {/* Common Behavioral Questions Section */}
        <h2>Common Behavioral Questions</h2>
        <div>
  {randomQuestions.map((item, index) => (
    <div
      key={index}
      className="question-container"
      style={{
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div className="question-card" style={{ flex: 1 }}>
        <p>
          <strong>Level {item.level}:</strong> {item.question}
        </p>
        {answers[item.question] && (
          <div style={{ marginTop: "10px", color: "#666", fontStyle: "italic" }}>
            {answers[item.question]}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          onClick={() => refreshQuestion(index, item.level)}
          className="refresh-button"
          style={{
            marginLeft: "10px",
            cursor: "pointer",
            background: "linear-gradient(90deg, #007BFF, #0056b3)",
            border: "none",
            padding: "7px 15px",
            color: "white",
            borderRadius: "5px",
            fontWeight: "bold",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          🔄 Refresh to generate a new question
        </button>
        <span
          style={{
            marginLeft: "15px",
            fontSize: "14px",
            color: "#444",
            fontStyle: "italic",
            background: "#f8f9fa",
            padding: "5px 10px",
            borderRadius: "5px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
        </span>
      </div>
    </div>
  ))}
</div>


      </div>
    </div>
  );
}

export default BehavioralPrep;
