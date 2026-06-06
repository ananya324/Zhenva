import { t } from "../utils/translations";

export default function Loader({
  language,
  messageKey = "loaderText",
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-500 text-sm">
        {t(language, messageKey)}
      </p>
    </div>
  );
}