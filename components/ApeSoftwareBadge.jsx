export default function ApeSoftwareBadge({ size = "md" }) {
  const isLarge = size === "lg";
  const circleSize = isLarge ? "w-10 h-10 text-xs" : "w-8 h-8 text-[10px]";

  return (
    <div className="flex -space-x-2" aria-hidden="true">
      <div
        className={`${circleSize} rounded-full border-2 border-white bg-[#e7ecfb] flex items-center justify-center font-bold text-[#2f66e8]`}
      >
        A
      </div>
      <div
        className={`${circleSize} rounded-full border-2 border-white bg-[#eaf5fb] flex items-center justify-center font-bold text-[#58bfe7]`}
      >
        P
      </div>
      <div
        className={`${circleSize} rounded-full border-2 border-white bg-[#06133d] flex items-center justify-center font-bold text-white`}
      >
        E
      </div>
    </div>
  );
}
