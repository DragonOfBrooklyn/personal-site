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
import { 
  Backdrop,
  // Box, 
  CircularProgress, 
  Modal, 
  // Typography,
} from '@mui/material';
import JordanHiResIcon from './assets/JordanHiResIcon.jpeg';
import './App.css'
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

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
    import.meta.env.DEV
      ? import.meta.env.VITE_DEV_SERVER_URL
      : import.meta.env.VITE_SERVER_URL,
    {oldConversation, query}, 
    config)
  .then((value) => {
    setClaudeResponse(value.data.text);
  }).catch((err: AxiosError) => {
    console.log(err.message)
    setClaudeResponse(err.message);
  });
}

// const modalBoxStyle = {
//   position: 'absolute' as 'absolute',
//   top: '55vh',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   width: '40vw',
//   minWidth: '200px',
//   bgcolor: '#c6e3fa',
//   border: '2px solid #000',
//   borderRaduis: '.7em',
//   boxShadow: 24,
//   p: 4,
// };

function GradientCircularProgress() {
  return (
    <React.Fragment>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e01cd5" />
            <stop offset="100%" stopColor="#1CB5E0" />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress 
        size={'10vw'}
        sx={{ 
          'svg circle': { stroke: 'url(#my_gradient)' },
          position: 'absolute',
          top: '45vh',
          left: '45vw',
           }} />
    </React.Fragment>
  );
}

function App() {
  const inputRef = useRef(null);
  const [msgInputValue, setMsgInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [claudeResponse, setClaudeResponse] = useState(undefined);
  const [claudeThinking, setClaudeThinking] = useState(false);
  const [loading, setLoading] = useState(true);
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
    claudeCall(message, conversation.current, setClaudeResponse);
    conversation.current.push({role: 'user', content: message});
  };
  //on page load, make first, silent prompt to Claude
  useEffect(() => {
    claudeCall('What are you?', conversation.current, setClaudeResponse);
  }, []);
  //handle claude response
  useEffect(() => {
    if(typeof claudeResponse !== 'undefined'){
      if(loading) setLoading(false);
      setMessages([...messages,{ 
        message: claudeResponse, 
        position: 'single',
        sender: 'Jordan AI',
        direction: 'incoming' }]);
      conversation.current.push({role: 'assistant', content: claudeResponse});
    }
    setClaudeThinking(false);
    setClaudeResponse(undefined);
  }, [claudeResponse]);
  return (
    <>
      <Modal 
        open={loading}
        closeAfterTransition
        slots={{backdrop: Backdrop}}
        slotProps={{backdrop: {timeout: 500}}}
      >
        <>
          {/* <Box sx={modalBoxStyle}>

          </Box> */}
          <GradientCircularProgress />
        </>
      </Modal>
      <div 
        className="wrapper" 
      >
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
    </>
  )
}

export default App
