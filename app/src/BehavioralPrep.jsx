import React, { useState, useEffect } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react";
import { level1Questions, level2Questions, level3Questions } from './QuestionsData';
import './App.css';

function BehavioralPrep() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    { message: "Hello! Please describe a situation you experienced that I can help structure using the STAR method.", sender: "ChatGPT", direction: "incoming" }
  ]);
  const [randomQuestions, setRandomQuestions] = useState([]);
  const [userSituation, setUserSituation] = useState("");
  const [answers, setAnswers] = useState({});
  const API_Key = import.meta.env.VITE_OPENAI_API_KEY;

  const getRandomQuestionsByLevel = () => {
    const level1 = level1Questions[Math.floor(Math.random() * level1Questions.length)];
    const level2 = level2Questions[Math.floor(Math.random() * level2Questions.length)];
    const level3 = level3Questions[Math.floor(Math.random() * level3Questions.length)];
    return [
      { level: 1, question: level1 },
      { level: 2, question: level2 },
      { level: 3, question: level3 }
    ];
  };

  useEffect(() => {
    setRandomQuestions(getRandomQuestionsByLevel());
  }, []);

  const handleSend = async (message) => {
    const newMessage = { message, sender: "user", direction: "outgoing" };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    if (!userSituation) {
      // Save user's input as the situation
      setUserSituation(message);
      generateStarSolution(message, newMessages);
    } else {
      // Generate answers for the random questions
      generateAnswersForQuestions(message, newMessages);
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

    // Prompt user to generate answers for the random questions
    setTyping(false);
    setTimeout(() => {
      const nextMessage = {
        message: "Now let me help you answer some random interview questions based on your situation. Click on the cards below for suggestions!",
        sender: "ChatGPT",
        direction: "incoming"
      };
      setMessages((prev) => [...prev, nextMessage]);
    }, 1000);
  };

  const generateAnswersForQuestions = async (situation, chatMessages) => {
    setTyping(true);
    const questionPrompts = randomQuestions.map((q) => `Question: ${q.question}\nAnswer based on the situation: "${situation}"`);
    const prompt = questionPrompts.join("\n\n");
    const response = await getChatGptResponse(prompt);
    const answers = response.split("\n\n"); // Assuming GPT returns separate answers for each question

    // Save the answers for each question
    const updatedAnswers = {};
    randomQuestions.forEach((q, i) => {
      updatedAnswers[q.question] = answers[i] || "No response generated.";
    });
    setAnswers(updatedAnswers);

    const botResponse = { message: "Here are suggestions for your random questions!", sender: "ChatGPT", direction: "incoming" };
    setMessages([...chatMessages, botResponse]);
    setTyping(false);
  };

  const getChatGptResponse = async (prompt) => {
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: "Provide detailed but simple answers." }, { role: "user", content: prompt }]
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
  };

  const handleMorePractice = () => {
    setRandomQuestions(getRandomQuestionsByLevel());
    setAnswers({});
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
        <p>Click on a card to view a suggested answer based on your situation.</p>
        <div>
          {randomQuestions.map((item, index) => (
            <div
              key={index}
              className="question-card"
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '10px',
                background: '#f9f9f9',
              }}
              onClick={() => {
                alert(`Suggested Answer: ${answers[item.question] || "Answer will appear after generating responses."}`);
              }}
            >
              <p><strong>Level {item.level}:</strong> {item.question}</p>
            </div>
          ))}
          <button
            onClick={handleMorePractice}
            className="more-practice-button"
          >
            Additional Practice
          </button>
        </div>
      </div>
    </div>
  );
}

export default BehavioralPrep;
