import { ShieldCheck, Lock, MessageCircle, Sparkles } from "lucide-react";

const ChatSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 select-none">
      {/* Floating gradient ring */}
      <div className="relative w-28 h-28 mb-6">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute inset-[6px] bg-base-200 rounded-full flex items-center justify-center shadow-inner">
          <Lock className="size-10 text-primary animate-bounce-slow" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold mb-2">End-to-End Encrypted Chat</h2>
      <p className="text-sm opacity-70 max-w-md">
        Messages you send and receive here are encrypted using your private keys —
        only you and your chat partner can decrypt them.
      </p>

      {/* Decorative highlights */}
      <div className="flex gap-6 mt-8 text-primary/80">
        <div className="flex flex-col items-center">
          <ShieldCheck className="size-6 mb-1" />
          <span className="text-xs font-semibold">Private</span>
        </div>
        <div className="flex flex-col items-center">
          <MessageCircle className="size-6 mb-1" />
          <span className="text-xs font-semibold">Secure</span>
        </div>
        <div className="flex flex-col items-center">
          <Sparkles className="size-6 mb-1" />
          <span className="text-xs font-semibold">Instant</span>
        </div>
      </div>

      {/* Fake placeholder chat preview */}
      <div className="w-full max-w-md mt-10 space-y-3">
        <div className="flex justify-start">
          <div className="bg-base-300 w-2/3 h-6 rounded-md animate-pulse"></div>
        </div>
        <div className="flex justify-end">
          <div className="bg-primary/40 w-1/2 h-6 rounded-md animate-pulse"></div>
        </div>
        <div className="flex justify-start">
          <div className="bg-base-300 w-1/3 h-6 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ChatSkeleton;
