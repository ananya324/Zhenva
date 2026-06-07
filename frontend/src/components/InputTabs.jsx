import { useState } from "react";
import { MessageSquare, Image, Video } from "lucide-react";
import TextInput from "./TextInput";
import ImageInput from "./ImageInput";
import VideoInput from "./VideoInput";

const TABS = [
  { id: "text",  label: "Message",    Icon: MessageSquare },
  { id: "image", label: "Screenshot", Icon: Image },
  { id: "video", label: "Video",      Icon: Video },
];

export default function InputTabs({ onSubmit, loading, language }) {
  const [activeTab, setActiveTab] = useState("text");

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">

      {/* Tabs */}
      <div className="flex border-b border-orange-100">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
              activeTab === id
                ? "text-[#FF6B00] border-b-2 border-[#FF6B00] bg-orange-50"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Active input */}
      <div className="p-5">
        {activeTab === "text" && (
          <TextInput onSubmit={(val) => onSubmit("text", val)} loading={loading} language={language} />
        )}
        {activeTab === "image" && (
          <ImageInput onSubmit={(val) => onSubmit("image", val)} loading={loading} language={language} />
        )}
        {activeTab === "video" && (
          <VideoInput onSubmit={(val) => onSubmit("video", val)} loading={loading} language={language} />
        )}
      </div>

    </div>
  );
}