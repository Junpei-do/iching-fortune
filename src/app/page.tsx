import { IChingDivination } from "@/components/iching-divination";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <IChingDivination />
    </main>
  );
}