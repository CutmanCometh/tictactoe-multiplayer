import React, { useCallback, useState } from 'react';
import './App.css';
import { useAppContext } from './context/appContext';

function App() {
  const { clientId, isConnectedToServer, connectToServer, sendMessage, receivedMessages } = useAppContext();
  const [text, setText] = useState('');
  const send = useCallback(() => {
    sendMessage(text);
    setText('');
  }, [sendMessage, setText, text]);
  return (
    <main>
      {isConnectedToServer ?
        (
          <div className='container'>
            <h1>Simple chat client</h1>
            <h2>Client id: "{clientId?.substring(clientId.length-4)}"</h2>
            <form
              action="#"
              onSubmit={(evt) => {
                evt.preventDefault();
                send();
              }}
              className="chat"
            >
              <label>
                <input
                  type="text"
                  id="send-text"
                  size={20}
                  value={text}
                  onChange={(evt) => {setText(evt.target.value)}}
                  autoComplete="off"
                  style={{
                    marginTop: '20px'
                  }}
                />
              </label>
              <button type='submit'>Send</button>
              <dl
                style={{
                  listStyleType: 'none',
                  paddingLeft: 0
                }}
              >
                {receivedMessages.map((message) => (
                  <>
                    <dt>{message.senderId.substring(message.senderId.length - 4)}:</dt>
                    <dd>"{message.text}"</dd>
                  </>
                ))}
              </dl>
            </form>
          </div>
        ) :
        (
          <>
            <span>Not connected to server</span> <button onClick={() => {connectToServer()}}>Connect</button>
          </>
        )
      }
    </main>
  );
}

export default App;
