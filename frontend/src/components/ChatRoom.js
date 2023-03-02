import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import Moment from 'react-moment'
import { io } from "socket.io-client"
import './style.css'
import { createContext } from "react";
import ReactSwitch from "react-switch";
 
export const ThemeContext = createContext(null);

const ChatRoom = () => {

    const [theme, setTheme] = useState("dark");

    const toggleTheme = () => {
      setTheme((curr) => (curr === "light" ? "dark" : "light"));
    };

    const location  = useLocation();
    const msgBoxRef = useRef()

    const [ data, setData ] = useState({})
    const [ msg, setMsg ]   = useState("")
    const [ loading, setLoading ] = useState(false)
    const [ allMessages, setMessages ] = useState([])
    const [ socket, setSocket ] = useState()

    useEffect(() => {
        const socket = io("http://localhost:9000")
        setSocket(socket)

        socket.on("connect", () => {
            console.log("socket Connected")
            socket.emit("joinRoom", location.state.room)
        })        
    }, [])

    useEffect(() => {
        if(socket){
            socket.on("getLatestMessage", (newMessage) => {
                console.log(allMessages)
                console.log(newMessage)
                setMessages([ ...allMessages,  newMessage ])
                msgBoxRef.current.scrollIntoView({behavior: "smooth"})
                setMsg("")
                setLoading(false)
            })
        }
    }, [socket, allMessages])   

    useEffect(() => {
        setData(location.state)
    }, [location])
    
    const handleChange = e => setMsg(e.target.value)
    const handleEnter = e => e.keyCode===13 ? onSubmit() : ""
    const onSubmit = () => {
        if(msg){
            setLoading(true)
            const newMessage = { time:new Date(), msg, name: data.username }
            socket.emit("newMessage", {newMessage, room: data.room})
        }
    }
    var n=allMessages.length;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
    <div className='App' id={theme}>
    <div className="switch">
      <label> {theme === "light" ? "Light Mode" : "Dark Mode"}</label>
      <ReactSwitch onChange={toggleTheme} checked={theme === "dark"} />
    </div>
    <div className='py-4 mb-5 w-50 bg-white text-dark border container main-container' style={{height:'80%'}}>
        <div className='text-capitalize text-center px-3 mb-4'>
            <h3 className='text-dark mb-4'>{data?.room} Chat Room</h3>
        </div>
        <div className='bg-light border rounded p-3 mb-4 chat-box' style={{height:'70%', overflowY:'scroll'}}>
            {
                
                
                allMessages.map((msg,index) => {
                    {/* n++; */}
                    return data.username === msg.name 
                    ?
                    <div className='row justify-content-end pl-5'>
                        <div className='d-flex flex-column align-items-end m-2 p-2 bg-info rounded w-auto right-msg'>
                                {/* <p>{msg.msg.length}</p> */}
                                    <strong className='m-1'>{msg.name}</strong>
                                    <small className='text-muted'><Moment fromNow>{msg.time}</Moment></small>
                               
                             <div className='m-1 msg-text'>{msg.msg}</div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="right-arrow" width="24" height="24" viewBox="0 0 24 24"><path d="M6 0l12 12-12 12z" /></svg>
                            </div>
                          { index+1==n? <div style={{marginBottom:"150px"}}></div>:<div></div>}
                        </div>
                    :
                    <div className='row justify-content-start'>
                        <div className='d-flex flex-column m-2 p-2 pb-20 bg-white rounded w-auto left-msg'>
                            <div>
                            <strong className='m-1'>{msg.name}</strong>
                            <small className='text-muted'><Moment fromNow>{msg.time}</Moment></small>
                            </div> 
                            <h4 className='m-1'>{msg.msg}</h4>
                            <svg xmlns="http://www.w3.org/2000/svg" className="left-arrow" width="24" height="24" viewBox="0 0 24 24"><path d="M3 12l18-12v24z"/></svg>
                        </div>
                        { index+1==n? <div style={{marginBottom:"150px"}}></div>:<div></div>}
                    </div>
                })
            }
            <div ref={msgBoxRef}></div>
        </div>

        <div className='form-group d-flex picker-container'>
            <textarea className='form-control bg-light' name='message' onKeyDown={handleEnter} placeholder='Type your message here' value={msg} onChange={handleChange} autoComplete='off'/>
            
            <button className='btn btn-primary mx-0' onClick={onSubmit} disabled={loading}>
            {
                loading
                ?
                <div class="spinner-border spinner-border-sm text-primary"></div>                            
                :
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"></path>
                </svg>
            }
            </button>
        </div>
    </div>
    </div>
    </ThemeContext.Provider>
  )
}



export default ChatRoom
