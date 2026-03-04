import Image from "next/image";

export default function Icon() {
  return (
    <Image
      src="/logo.png"
      alt="StudyPlannerHub"
      width={32}
      height={32}
      className="object-contain"
      priority
    />
  );
}
