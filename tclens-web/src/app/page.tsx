import { Navbar } from "@/components/Navbar";
import MarketingPage from "./(marketing)/page";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <MarketingPage />
            </main>
        </div>
    );
}
