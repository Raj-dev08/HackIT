import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X , CornerUpLeft } from "lucide-react";
import { encryptMessage } from "../lib/messageEncryption";
import toast from "react-hot-toast";

const MessageInput = ({ repliedTo , clearReply }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null)

  const { sendMessage, isSendingMessages, selectedUser } = useChatStore();
  const { socket, authUser, checkAuth } = useAuthStore();

  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(()=>{
    if(repliedTo){
      inputRef.current.focus()
    }
  },[repliedTo])

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      const userPublicKey = localStorage.getItem(`${authUser._id}:publicKey`)
     
      const encryptedText = await encryptMessage({
        text,
        senderId:authUser._id,
        receiverPublicB64:selectedUser.publicToken
      })
      const encryptedTextForUser = await encryptMessage({
        text,
        senderId:authUser._id,
        receiverPublicB64:userPublicKey
      })
      if(repliedTo){
        await sendMessage({ text:encryptedText, senderText: encryptedTextForUser , image: imagePreview ,repliedTo: repliedTo._id });
        clearReply();
      }
      else{
        await sendMessage({ text:encryptedText, senderText: encryptedTextForUser , image: imagePreview });
      }
     
      setText("");
      removeImage();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const sendToggle = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typingToUser", { from: authUser._id, to: selectedUser._id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stopTypingToUser", { to: selectedUser._id });
    }, 800);
  };

  return (
    <div className="p-4 w-full">
      {repliedTo  && (
        <div className="mb-3 flex items-center justify-between bg-base-200 border-l-4 border-primary px-3 py-2 rounded-md">
          <div className="flex items-center gap-2 overflow-hidden">
            <CornerUpLeft size={16} className="text-primary" />
            <div className="flex flex-col">
              <p className="text-xs text-gray-500">Replying to</p>
              <p className="text-sm font-medium truncate max-w-[220px]">
                {repliedTo.displayText || "[Encrypted message]"}
              </p>
            </div>
          </div>
          <button
            onClick={clearReply}
            className="hover:bg-base-300 p-1 rounded-full transition"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            ref={inputRef}
            onChange={(e) => {
              setText(e.target.value);
              sendToggle();
            }}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`flex btn btn-circle ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={
            isSendingMessages || (!text.trim() && !imagePreview)
          }
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
