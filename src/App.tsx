import React, { useState, useRef, useEffect } from "react";
import {
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  InfoButton,
  Avatar,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import axios, { AxiosError } from 'axios';
import JordanHiResIcon from './assets/JordanHiResIcon.jpeg';
import './App.css'
// import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

interface Turn {
  role: 'user' | 'assistant' | 'error',
  content: string
}

const claudeCall = async (
  query: string, 
  oldConversation: Turn[], 
  setClaudeResponse
  ) => {
  const config = {
    headers: {
      'jlong-authorization': 'PersonalSiteForJordanLong',
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  await axios.post(
    // import.meta.env.VITE_DEV_SERVER_URL, //bun dev server
    import.meta.env.VITE_SERVER_URL, //live lambda function
    {oldConversation, query}, 
    config)
  .then((value) => {
    setClaudeResponse(value.data.text);
    // console.log(`claude responds ${new Date().toLocaleTimeString()}`);
  }).catch((err: AxiosError) => {
    console.log(err.message)
    setClaudeResponse(err.message);
  });
}

function App() {
  const inputRef = useRef(null);
  const [msgInputValue, setMsgInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [claudeResponse, setClaudeResponse] = useState(undefined);
  const [claudeThinking, setClaudeThinking] = useState(false);
  const conversation = React.useRef<Turn[]>([
  ]);

  const handleSend = message => {
    setClaudeThinking(true);
    setMessages([...messages,{ 
      message, 
      position: 'single',
      sender: 'You',
      direction: 'outgoing' }]);
    setMsgInputValue("");
    inputRef.current?.focus();
    claudeCall(message, conversation.current, setClaudeResponse)
  };
  //on page load, make first, silent prompt to Claude
  useEffect(() => {
    // console.log(`page load silent call ${new Date().toLocaleTimeString()}`);
    claudeCall('Who and what are you?', conversation.current, setClaudeResponse)
  }, []);

  //handle claude response
  useEffect(() => {
    if(typeof claudeResponse !== 'undefined'){
      setMessages([...messages,{ 
        message: claudeResponse, 
        position: 'single',
        sender: 'Jordan AI',
        direction: 'incoming' }]);
    }
    setClaudeThinking(false);
    setClaudeResponse(undefined);
  }, [claudeResponse])

  return (
    <div style={{ position: "relative", height: "500px", width: "800px" }}>
      <ChatContainer>
        <ConversationHeader>
          <Avatar
            name="Jordan AI ChatBot"
            src={JordanHiResIcon}
          />
          <ConversationHeader.Content
            info="Generative AI ChatBot About Jordan Long"
            userName="Jordan AI"
          />
          <ConversationHeader.Actions>
            <InfoButton onClick={() => window.open('https://linkedin.com/in/jlongtlw', '_blank')}/>
          </ConversationHeader.Actions>
        </ConversationHeader>
        <MessageList 
          scrollBehavior="smooth" 
          typingIndicator={
            claudeThinking ?
            <TypingIndicator content="Jordan AI is typing" /> :
            <></>
          }
        >
          {messages.map( (m,i) => <Message key={i} model={m} /> )}

        </MessageList>
        <MessageInput 
          placeholder="Ask about Jordan..." 
          onSend={handleSend} 
          onChange={setMsgInputValue} 
          value={msgInputValue} 
          ref={inputRef}
          attachButton={false}
        />

      </ChatContainer>
    </div>
  )
}

export default App
