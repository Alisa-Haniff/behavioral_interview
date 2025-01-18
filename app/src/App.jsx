import { useState } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react";

const API_Key = import.meta.env.VITE_OPENAI_API_KEY;

function App() {
  const [typing, setTyping] = useState(false);
  // Message array in state
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGpt!",
      sender: "ChatGpt",
      direction: "incoming" //ChatGpt on the left
    }
  ]);

  // "typing" state to show the TypingIndicator
  

  // Handle sending a message
  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",  //sender on the right
    };

    // Merge new message into existing array
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    // Show "ChatGpt is typing" indicator
    setTyping(true);

    //process message to chatGpt
    await processMessageToChatGpt(newMessages);
  }

  async function processMessageToChatGpt(chatMessages) {

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role="assistant"
      } else {
        role = "user"
      }
      return { role: role, content: messageObject.message }
      
    });

    //role: "user -> a message from the user, "assisant" -> a response from chatGpt
    //******"system" -> message defining how we want chatGpt to talk ************
    const systemMessage = {
      role: "system",
      content:"Explain all concepts like I am a freshman in college going on my first job interview. I want the answer to use the STAR interview method."
    }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages //[message1, meesgae2, message3]
      ]
    }
    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_Key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {         //json format
      return data.json();
    }).then((data) => {         //grabs the json data
      console.log(data);
      console.log(data.choices[0].message.content);
      setMessages(
        [...chatMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT",
          direction: "incoming"
        }]
      );
      setTyping(false);
    });
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList 
              typingIndicator={
                typing ? <TypingIndicator content="ChatGpt is typing" /> : null
              }
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />;
              })}
            </MessageList>
            <MessageInput 
              placeholder="Type message here" 
              onSend={handleSend} 
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;

