import { useState } from "react";
import TextInput from "./TextInput";
import ImageInput from "./ImageInput";
import VideoInput from "./VideoInput";

const TABS = [
  { id: "text",  label: "Message", emoji: "💬" },
  { id: "image", label: "Screenshot", emoji: "🖼️" },
  { id: "video", label: "Video", emoji: "🎥" },
];

export default function InputTabs({ onSubmit, loading }) {
  const [activeTab, setActiveTab] = useState("text");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-50 rounded-xl p-1 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active input */}
      {activeTab === "text"  && <TextInput  onSubmit={(val) => onSubmit("text", val)}  loading={loading} />}
      {activeTab === "image" && <ImageInput onSubmit={(val) => onSubmit("image", val)} loading={loading} />}
      {activeTab === "video" && <VideoInput onSubmit={(val) => onSubmit("video", val)} loading={loading} />}

    </div>
  );
}