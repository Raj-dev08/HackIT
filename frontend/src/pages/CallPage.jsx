import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [isConnecting, setIsConnecting] = useState(true);
  const [ready, setReady] = useState(false);

  const { authUser, callHandler } = useAuthStore();

  const clientRef = useRef(null);
  const callRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initCall = async () => {
      try {
        const callToken = await callHandler();
        if (!callToken?.token || !authUser || !callId) return;

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: callToken.token,
        });

        const callInstance = videoClient.call("default", callId);

        // Avoid duplicate joins
        try {
          await callInstance.leave();
        } catch {
          // ignore if not joined
        }

        await callInstance.join({ create: true, audio: false, video: false, publish: false });

        if (!isMounted) return;

        clientRef.current = videoClient;
        callRef.current = callInstance;
        setReady(true);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        if (isMounted) setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      isMounted = false;
      (async () => {
        try {
          await callRef.current?.leave();
          await clientRef.current?.disconnectUser();
        } catch (err) {
          console.warn("Cleanup error:", err);
        }
      })();
    };
  }, [authUser, callId, callHandler]);

  if (isConnecting)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader className="animate-spin" />
      </div>
    );

  if (!ready)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Could not initialize call. Please refresh or try again later.</p>
      </div>
    );

  return (
    <div className="h-screen flex flex-col items-center justify-center min-h-screen">
      <div className="max-w-4xl w-full bg-base-100 shadow-lg rounded-lg overflow-hidden p-10">
        <StreamVideo client={clientRef.current}>
          <StreamCall call={callRef.current}>
            <CallContent />
          </StreamCall>
        </StreamVideo>
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) navigate(-1);
  }, [callingState, navigate]);

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;
