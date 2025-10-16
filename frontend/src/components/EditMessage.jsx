import { useState, useRef , useEffect} from 'react'
import { Image, Check, X } from 'lucide-react'
import { useChatStore } from '../store/useChatStore'
import toast from 'react-hot-toast'
import { encryptMessage , decryptMessage} from '../lib/messageEncryption'

const EditMessage = ({ msg, setEditedMessage, setIsEditing ,authUser ,selectedUser }) => {
  const [text, setText] = useState('')
  const [imagePreview, setImagePreview] = useState(msg?.image || '')
  const fileInputRef = useRef(null)

  const { editMessage, isEditing } = useChatStore()

  useEffect(()=>{
    const decrypt = async () => {
        const text = await decryptMessage({
            encrypted: msg.textForSender,
            receiverId: authUser._id,
            senderPublicB64: localStorage.getItem(`${authUser._id}:publicKey`)
        })
        setText(text)
    }
    decrypt()
  },[msg])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!text.trim() && !imagePreview) return

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

    await editMessage(msg._id, { text:encryptedText , senderMessage:encryptedTextForUser , image: imagePreview })
    setEditedMessage(null)
    setIsEditing(false)
  }

  return (
    <div className="p-4 w-full bg-base-200 rounded-lg">
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

      <form onSubmit={handleEdit} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Edit your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
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
            className={`flex btn btn-circle ${imagePreview ? 'text-emerald-500' : 'text-zinc-400'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="btn btn-sm btn-circle text-green-500 bg-base-100 border"
            disabled={
              (isEditing && (!text.trim() && !imagePreview)) ||
              isEditing
            }
          >
            <Check size={22} />
          </button>

          <button
            type="button"
            className="btn btn-sm btn-circle text-red-500 bg-base-100 border"
            onClick={() => {
              setEditedMessage(null)
              setIsEditing(false)
            }}
          >
            <X size={22} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditMessage
