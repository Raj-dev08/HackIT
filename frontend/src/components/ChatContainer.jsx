import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { Loader2, CheckCheck, RefreshCcw  } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import EditMessage from "./EditMessage";
import { Popover } from "@headlessui/react";
import { decryptMessage } from "../lib/messageEncryption";

const SCROLL_THRESHOLD = 100;

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    hasMoreMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessageEvents,
    refreshMessages,
    setTypingIndicator,
    typingUsers,
    deleteMessage,
  } = useChatStore();

  const { socket, authUser, checkAuth } = useAuthStore();
  const containerRef = useRef(null);
  const limit = 10;

  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(null);
  const [decryptedMessages, setDecryptedMessages] = useState([]);
  const [ repliedTo , setRepliedTo ] = useState(null)


  useEffect(() => {
    const decryptAll = async () => {
        if (!messages.length || !selectedUser) return;

        const results = await Promise.all(
        messages.map(async (msg) => {
        let encrypted, receiverId, senderPublicB64;
        let repliedText = null ;
        

        if (msg.senderId === authUser._id) {
            encrypted = msg.textForSender;
            receiverId = authUser._id;
            senderPublicB64 =  localStorage.getItem(`${authUser._id}:publicKey`) ;
        } else {
            encrypted = msg.text;
            receiverId = authUser._id;
            senderPublicB64 = selectedUser.publicToken ;
        }

        if (msg.repliedTo){
          let encrypted, receiverId, senderPublicB64;
          
          if (msg.repliedTo.senderId === authUser._id) {
              encrypted = msg.repliedTo.textForSender;
              receiverId = authUser._id;
              senderPublicB64 =  localStorage.getItem(`${authUser._id}:publicKey`) ;
          } else {
              encrypted = msg.repliedTo.text;
              receiverId = authUser._id;
              senderPublicB64 = selectedUser.publicToken ;
          }
          try {
            repliedText = await decryptMessage({ encrypted, senderPublicB64, receiverId })
          } catch (error) {
            repliedText = "[Could Not decrypt]"
          }
        }

        try {
            const text = await decryptMessage({ encrypted, senderPublicB64, receiverId });
            return { ...msg, displayText: text , repliedText};
        } catch {
            return { ...msg, displayText: "[Could not decrypt]" };
        }
    })
    );


      setDecryptedMessages(results);
    };

    decryptAll();
    
  }, [messages, authUser._id, selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;
    checkAuth();
    refreshMessages();
    getMessages(selectedUser._id, limit, Date.now());
    subscribeToMessageEvents();
    setTypingIndicator();
  }, [selectedUser]);

  useEffect(() => {
    if (!socket || !selectedUser) return;
    const unseen = messages.filter((msg) => !msg.isSeen && msg.senderId === selectedUser._id);
    unseen.forEach((msg) => {
      socket.emit("message_seen", { message: msg });
    });
  }, [messages.length]);

  const handleScroll = async () => {
    if (!containerRef.current || isMessagesLoading) return;
    const scrollTop = containerRef.current.scrollTop;
    if (scrollTop < SCROLL_THRESHOLD && hasMoreMessages) {
      const oldest = messages[0];
      const before = oldest?.createdAt;
      const oldHeight = containerRef.current.scrollHeight;
      await getMessages(selectedUser._id, limit, before);
      const newHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTop = newHeight - oldHeight + scrollTop;
    }
  };

 useEffect(() => {
  if (!containerRef.current || isMessagesLoading) return;
  containerRef.current.scrollTop = containerRef.current.scrollHeight;
}, [decryptedMessages.length, typingUsers.length ]);


  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChatHeader />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollbarWidth: "thin" }}
      >
        {isMessagesLoading && (
          <div className="text-center py-2 text-sm opacity-70">
            <Loader2 className="animate-spin mx-auto" />
          </div>
        )}

        {decryptedMessages.map((msg) => {
          const isMine = msg.senderId === authUser._id;
          return (
            <div key={msg._id} className={`chat ${isMine ? "chat-end" : "chat-start"} ${editedMessage?._id == msg?._id ? "border border-primary/25 rounded" : ""}`}>
              <div className="chat-bubble relative ">
                <div className="flex justify-between mb-1 relative">

                 


                   { msg.repliedTo && (
                    <div className="bg-base-200 rounded px-2 p-1 text-xs md:text-sm border-l-4 border-primary w-full ">
                      <p className="truncate opacity-80 text-red-600 underline">
                        {msg.repliedTo.senderId === authUser._id ? authUser.name : selectedUser.name} 
                      </p>
                      <p className="truncate opacity-80">
                        {msg.repliedText} 
                      </p>
                    </div>
                  )}

                  { !msg.repliedTo && ( 
                    <div className="flex justify-between mt-1 gap-3 flex-col md:flex-row">
                      <div>
                        <p className="text-sm md:text-base font-semibold">{msg.displayText}</p>
                      </div>

                      <div className="flex justify-center items-center">
                        {msg.isEdited && <p className="text-xs text-gray-500 mx-2">(Edited)</p>}
                        <p className="text-xs opacity-50">{new Date(msg.createdAt).toLocaleTimeString().slice(0, 5)}</p>
                        <p>
                          { msg?.status === "queued" ? <RefreshCcw className={`size-4 ${isMine ? "" : "hidden"} `}/> :
                              <CheckCheck className={`size-4 ${isMine ? "" : "hidden"} ${msg.isSeen ? "text-blue-500" : "text-gray-400"}`} />

                          }
                          
                        </p>
                    </div>
                    </div>
                  )}

                  {( isMine && !msg.isTemp ) && (
                    <Popover className="relative">
                      <Popover.Button className="p-1 hover:bg-base-200 rounded">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </Popover.Button>

                      <Popover.Panel className="absolute right-0 mt-1 w-28 z-50 bg-base-100 border rounded-md shadow-md p-1 text-sm">
                         <button
                          onClick={() => {
                            setRepliedTo(msg)
                          }}
                          className="block w-full text-left px-2 py-1 hover:bg-base-300 rounded"
                        >
                          ◀ Reply
                        </button>

                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setEditedMessage(msg);
                          }}
                          className="block w-full text-left px-2 py-1 hover:bg-base-300 rounded"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() => deleteMessage(msg._id)}
                          className="block w-full text-left px-2 py-1 hover:bg-base-300 text-red-500 rounded"
                        >
                          🗑 Delete
                        </button>
                      </Popover.Panel>
                    </Popover>
                  )}
                  { ! isMine   && (
                    <Popover className="relative">
                      <Popover.Button className="p-1 hover:bg-base-200 rounded">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </Popover.Button>

                      <Popover.Panel className="absolute left-0 mt-1 w-28 z-50 bg-base-100 border rounded-md shadow-md p-1 text-sm">
                        <button
                          onClick={() => {
                            setRepliedTo(msg)
                          }}
                          className="block w-full text-left px-2 py-1 hover:bg-base-300 rounded"
                        >
                          ◀ Reply
                        </button>
                      </Popover.Panel>
                    </Popover>
                  )}

                </div>
               

                

                {msg.image && (
                  <img src={msg.image} alt="Attachment" className="max-w-[100px] rounded-md mt-2" />
                )}

                { msg.repliedTo && (
                  <div className="flex justify-between mt-1 gap-3 flex-col md:flex-row">
                  <div>
                    <p className="text-sm md:text-base font-semibold">{msg.displayText}</p>
                  </div>

                  <div className="flex justify-center items-center">
                    {msg.isEdited && <p className="text-xs text-gray-500 mx-2">(Edited)</p>}
                    <p className="text-xs opacity-50">{new Date(msg.createdAt).toLocaleTimeString().slice(0, 5)}</p>
                    <p>
                      { msg?.status === "queued" ? <RefreshCcw className={`size-4 ${isMine ? "" : "hidden"} `}/> :
                          <CheckCheck className={`size-4 ${isMine ? "" : "hidden"} ${msg.isSeen ? "text-blue-500" : "text-gray-400"}`} />

                      }
                      
                    </p>
                 </div>
                </div>
                )}
              </div>
            </div>
          );
        })}

        {typingUsers.length > 0 && selectedUser && (
          <div key={selectedUser._id} className="chat chat-start">
            <div className="chat-bubble">
              <div className="flex items-center gap-1 mt-2">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="w-2 h-2 bg-current rounded-full animate-bounce"
                    style={{ animationDelay: `${index * 0.2}s`, animationDuration: "1.4s" }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {isEditing ?
      <EditMessage 
      msg={editedMessage} 
      setEditedMessage={setEditedMessage} 
      setIsEditing={setIsEditing} 
      authUser={authUser} 
      selectedUser={selectedUser}/> : 
      repliedTo ? (         
        <MessageInput repliedTo={repliedTo} clearReply={() => setRepliedTo(null) }/>
      ):(
        <MessageInput/>
      )   
      }
    </div>
  );
};

export default ChatContainer;
