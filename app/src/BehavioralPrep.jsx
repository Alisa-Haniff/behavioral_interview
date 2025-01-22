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

function BehavioralPrep() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Think of a time you achieved something. Please include as much details as possible.",
      sender: "ChatGPT",
      direction: "incoming",
    },
  ]);
  const [randomQuestions, setRandomQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [userSituation, setUserSituation] = useState("");
  const API_Key = import.meta.env.VITE_OPENAI_API_KEY;

  useEffect(() => {
    setRandomQuestions(generateRandomQuestions());
  }, []);

  const generateRandomQuestions = () => [
    { level: 1, question: getRandomQuestion(level1Questions) },
    { level: 2, question: getRandomQuestion(level2Questions) },
    { level: 3, question: getRandomQuestion(level3Questions) },
  ];

  const getRandomQuestion = (questions) =>
    questions[Math.floor(Math.random() * questions.length)];

  const refreshQuestion = async (index, level) => {
    const newQuestion = getRandomQuestion(
      level === 1
        ? level1Questions
        : level === 2
        ? level2Questions
        : level3Questions
    );

    setRandomQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[index] = { level, question: newQuestion };
      return updatedQuestions;
    });

    // Regenerate answer for the refreshed question
    await generateAnswerForSingleQuestion(newQuestion);
  };

  const handleSend = async (message) => {
    const newMessage = { message, sender: "user", direction: "outgoing" };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    if (!userSituation) {
      setUserSituation(message);
      await generateStarSolution(message, newMessages);
    }
  };

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

    // Generate answers for the common questions
    await generateAnswersForQuestions(situation);
  };

  const generateAnswersForQuestions = async (situation) => {
    setTyping(true);

    // Create prompts for each question
    const questionPrompts = randomQuestions.map((q) => `
      Question: "${q.question}"
      User's situation: "${situation}"
      If the situation aligns, provide a STAR-based answer. 
      If it doesn't align, suggest: "Looks like your situation doesn't match the question. However, you could say something like this: <example response>".
    `);

    const prompt = questionPrompts.join("\n\n");
    const response = await getChatGptResponse(prompt);

    // Split responses and map them to questions
    const answersArray = response.split("\n\n");
    const updatedAnswers = {};
    randomQuestions.forEach((q, i) => {
      updatedAnswers[q.question] = answersArray[i] || "No response generated.";
    });

    setAnswers(updatedAnswers);
    setTyping(false);
  };

  const generateAnswerForSingleQuestion = async (question) => {
    setTyping(true);

    const prompt = `
      Question: "${question}"
      User's situation: "${userSituation}"
      If the situation aligns, provide a STAR-based answer. 
      If it doesn't align, suggest: "Looks like your situation doesn't match the question. However, you could say something like this: <example response>".
    `;
    const response = await getChatGptResponse(prompt);

    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [question]: response || "No response generated.",
    }));

    setTyping(false);
  };

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

  return (
    <div className="App">
      <div className="category-title">Prepare for Your Behavioral Interview</div>
      <div className="content-container">
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
        alignItems: "flex-start",
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
      <button
        onClick={() => refreshQuestion(index, item.level)}
        className="refresh-button"
        style={{
          marginLeft: "10px",
          cursor: "pointer",
          background: "none",
          border: "1px solid #ddd",
          padding: "5px 10px",
          color: "#007BFF",
          borderRadius: "5px",
        }}
      >
        🔄
      </button>
    </div>
  ))}
</div>

</div>

      </div>
    
  );
}

export default BehavioralPrep;


