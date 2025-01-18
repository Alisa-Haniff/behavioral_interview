import React, { useState, useEffect } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react";
import { level1Questions, level2Questions, level3Questions } from './QuestionsData';
import './App.css';

function BehavioralPrep() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    { message: "Hello, Let's get started on practing for your interview. Can you think of a situation from school, work, or your personal life that can be asked on an interview? (hints: group project, conflict with another person, or having a tight deadline) ", sender: "ChatGPT", direction: "incoming" }
  ]);
  const [randomQuestions, setRandomQuestions] = useState([]);
  const [showAnswer, setShowAnswer] = useState({});

  const API_Key = import.meta.env.VITE_OPENAI_API_KEY; // Load from .env

  const handleSend = async (message) => {
    const newMessage = { message, sender: "user", direction: "outgoing" };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);
    await processMessageToChatGpt(newMessages);
  };

  const processMessageToChatGpt = async (chatMessages) => {
    const apiMessages = chatMessages.map((msg) => ({
      role: msg.sender === "ChatGPT" ? "assistant" : "user",
      content: msg.message,
    }));

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Explain all concepts like I am 10 years old." },
        ...apiMessages,
      ],
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
    setMessages([
      ...chatMessages,
      { message: data.choices[0].message.content, sender: "ChatGPT", direction: "incoming" },
    ]);
    setTyping(false);
  };

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

  const toggleAnswer = (index) => {
    setShowAnswer((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleMorePractice = () => {
    setRandomQuestions(getRandomQuestionsByLevel());
    setShowAnswer({});
  };

  return (
    <div className="App">
      <div className="category-title">Prepare for Your Behavioral Interview</div>
      <div className="content-container">
        <div className="star-intro">
          <h2>STAR Method Overview</h2>
          <p>
            Most companies prefer you to use the STAR Method when answering interview questions.
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
              <MessageInput placeholder="Type your brainstorming ideas here" onSend={handleSend} />
            </ChatContainer>
          </MainContainer>
        </div>

        <div>
          <h2>Common Behavioral Questions by Level</h2>
          <p>Click a card to view a sample answer.</p>
          {randomQuestions.map((item, index) => (
            <div
              key={index}
              className="question-card"
              style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '10px', background: '#f9f9f9' }}
              onClick={() => toggleAnswer(index)}
            >
              <p><strong>Level {item.level}:</strong> {item.question}</p>
              {showAnswer[index] && (
                <p className="answer-text">
                  <strong>Sample Answer:</strong> Answer placeholder for Level {item.level}.
                </p>
              )}
            </div>
          ))}
          <button onClick={handleMorePractice} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px' }}>
            Click here for more practice
          </button>
        </div>
      </div>
    </div>
  );
}

export default BehavioralPrep;
