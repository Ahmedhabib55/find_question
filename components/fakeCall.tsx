import { useState, useEffect } from "react";
import { Phone, PhoneOff, User } from "lucide-react";

export default function FakeCall() {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showCall, setShowCall] = useState(false);
  const [callStatus, setCallStatus] = useState("incoming");
  const [callTime, setCallTime] = useState(0);
  const [pulseAnimation, setPulseAnimation] = useState(true);

  const callerName = "Mama";

  // Handle click to detect 4 rapid clicks
  const handleClick = () => {
    const currentTime = new Date().getTime();

    // If click is within 500ms of last click, count it as a rapid click
    if (currentTime - lastClickTime < 500) {
      setClickCount((prevCount) => prevCount + 1);
    } else {
      // Reset if too much time passed
      setClickCount(1);
    }

    setLastClickTime(currentTime);
  };

  // Effect to trigger call when 4 rapid clicks detected
  useEffect(() => {
    if (clickCount >= 4) {
      setShowCall(true);
      setCallStatus("incoming");
      setCallTime(0);
      setPulseAnimation(true);
      setClickCount(0);
    }
  }, [clickCount]);

  // Effect to handle the call timer
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (callStatus === "connected") {
      timer = setInterval(() => {
        setCallTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  // Format call time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Reject call handler
  const handleReject = () => {
    setCallStatus("rejected");
    setTimeout(() => {
      setShowCall(false);
    }, 1000);
  };

  // Accept call handler
  const handleAccept = () => {
    setCallStatus("connected");
    setPulseAnimation(false);
  };

  // If call is not active, just render a transparent div that captures clicks
  if (!showCall) {
    return (
      <div
        className="fixed mt-1 z-50 w-full h-[130px] opacity-0"
        onClick={handleClick}
      ></div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 ">
      <div className="bg-gray-900 w-full h-full flex flex-col justify-between">
        {/* Status bar - typical for Huawei phones */}
        {/* <div className="bg-black bg-opacity-50 p-2 flex justify-between items-center">
          <div className="text-white text-xs">12:30</div>
          <div className="flex space-x-2">
            <div className="text-white text-xs">4G</div>
            <div className="text-white text-xs">100%</div>
          </div>
        </div> */}

        {/* Caller Info */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div
            className={`rounded-full bg-gray-800 h-24 w-24 flex items-center justify-center mb-6 ${
              pulseAnimation ? "animate-pulse" : ""
            }`}
          >
            <User size={48} className="text-gray-300" />
          </div>

          <h2 className="text-white text-3xl font-bold mb-2">{callerName}</h2>

          {callStatus === "incoming" && (
            <p className="text-gray-300 text-lg">Incoming call...</p>
          )}

          {callStatus === "connected" && (
            <p className="text-gray-300 text-lg">{formatTime(callTime)}</p>
          )}

          {callStatus === "rejected" && (
            <p className="text-gray-300 text-lg">Call ended</p>
          )}
        </div>

        {/* Call Actions */}
        {callStatus === "incoming" && (
          <div className="flex justify-between px-8 pb-16 pt-4">
            <button
              onClick={handleReject}
              className="rounded-full bg-red-600 h-16 w-16 flex items-center justify-center transform transition hover:scale-110"
            >
              <PhoneOff size={28} className="text-white" />
            </button>

            <button
              onClick={handleAccept}
              className="rounded-full bg-green-600 h-16 w-16 flex items-center justify-center transform transition hover:scale-110"
            >
              <Phone size={28} className="text-white" />
            </button>
          </div>
        )}

        {callStatus === "connected" && (
          <div className="flex justify-center px-8 pb-16 pt-4">
            <button
              onClick={handleReject}
              className="rounded-full bg-red-600 h-16 w-16 flex items-center justify-center transform transition hover:scale-110"
            >
              <PhoneOff size={28} className="text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
