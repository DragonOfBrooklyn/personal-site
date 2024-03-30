import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios, { AxiosError } from 'axios'

interface Turn {
  role: 'user' | 'assistant',
  content: string
}

const claudeCall = async (
  newQuery: string, 
  oldConversation: Turn[], 
  setError,
  setClaudeResponse
  ) => {
  const conversation: Turn[] = [
    ...oldConversation,
    { role: 'user', content: newQuery }
  ];
  const config = {
    headers: {
      'jlong-authorization': 'PersonalSiteForJordanLong',
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    // method: 'POST',
    // body: JSON.stringify(conversation),
  };

  // await fetch(import.meta.env.VITE_SERVER_URL, config)
  await axios.post(
    import.meta.env.VITE_SERVER_URL, 
    {conversation}, 
    config)
  // .then((value) => value.data)
  .then((value) => {
    console.log('conversation data');
    // console.log(blobData.data);
    // console.log('convo ', value.data[0].text);
    setClaudeResponse(value.data.text);
  }
  ).catch((err: AxiosError) => {
    console.log(err.message)
    setError(err.message);
  });
}
function App() {
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [claudeResponse, setClaudeResponse] = useState('');
  const [loaded, setLoaded] = useState(false);
  // setClaudeResponse(claudeCall());
  const priorConvo: Turn[] = [
    {role: 'user', content:'Who made you?'},
    {role: 'assistant', content:'Jordan Long made me'},
  ];
  useEffect(() => {
    if(!loaded && !claudeResponse){
      claudeCall(
        "What are Jordan Long's hobbies?", 
        priorConvo, 
        setError, 
        setClaudeResponse
      );
      setLoaded(true);
    }
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Me</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Output from call {error ?? claudeResponse}
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
