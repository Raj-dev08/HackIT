import { useChatStore } from "../store/useChatStore";
import SideBar from "../components/SideBar";
import MessageBar from "../components/MessageBar";
import ChatContainer from "../components/ChatContainer";
import ChatSkeleton from "../components/ChatSkeleton";

const MessagePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center xl:pt-3 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl xl:h-[calc(100vh-(0.75rem+80px))] h-[calc(100vh-100px)]">
          <div className="flex h-full rounded-lg overflow-hidden relative">
            
          
            <div className="hidden lg:block">
              <SideBar />
            </div>

            <div className="lg:hidden block">
               <MessageBar />
            </div>
           

              {selectedUser ?  (
                <ChatContainer/>
            ) : (
                <div className="hidden lg:flex justify-center items-center w-full">
                  <ChatSkeleton/>
                </div>
                )

                }
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
