"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    MapPin,
    Star,
    MessageCircle,
    CheckCircle,
    Filter,
    Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LawyerPage() {
    const [lawyers, setLawyers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [locationQuery, setLocationQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [debouncedLocation, setDebouncedLocation] = useState("");

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setDebouncedLocation(locationQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, locationQuery]);

    // Fetch lawyers
    useEffect(() => {
        const fetchLawyers = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (debouncedSearch) params.append("query", debouncedSearch);
                if (debouncedLocation) params.append("location", debouncedLocation);

                const res = await fetch(`/api/lawyers/search?${params.toString()}`);
                const data = await res.json();
                if (data.ok) {
                    setLawyers(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch lawyers", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLawyers();
    }, [debouncedSearch, debouncedLocation]);

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-foreground font-playfair mb-2">Lawyer Network</h1>
                    <p className="text-muted-foreground">Connect with vetted legal professionals for expert consultation.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-background p-2 rounded-none border border-border shadow-sm flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, expertise, or keyword..."
                        className="w-full h-12 pl-12 pr-4 bg-transparent outline-none text-sm"
                    />
                </div>
                <div className="md:w-px h-8 bg-muted/50 self-center hidden md:block" />
                <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        placeholder="Location..."
                        className="w-full h-12 pl-12 pr-4 bg-transparent outline-none text-sm"
                    />
                </div>
                <Button className="h-12 px-8 rounded-none bg-emerald-600 font-bold">Search</Button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[300px] bg-muted/30 rounded-none animate-pulse border border-border" />
                    ))}
                </div>
            ) : lawyers.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lawyers.map((l) => (
                        <div key={l.id} className="bg-background rounded-none border border-border overflow-hidden group hover:border-legal-navy/20 transition-all hover:shadow-xl hover:shadow-slate-100">
                            <div className="relative h-48 bg-muted/50 overflow-hidden">
                                {l.avatarUrl ? (
                                    <img src={l.avatarUrl} alt={l.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-muted-foreground">
                                        <Users className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full flex items-center gap-1 shadow-sm">
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                    <span className="text-xs font-black text-foreground">{l.rating > 0 ? l.rating : "New"}</span>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <h4 className="text-lg font-black text-foreground font-playfair">{l.name}</h4>
                                    <p className="text-sm text-muted-foreground font-medium">{l.title}</p>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                        <MapPin className="w-3 h-3" />
                                        {l.city}, {l.state}, {l.country}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {l.specialties.slice(0, 3).map((t: string) => (
                                        <span key={t} className="px-2 py-0.5 bg-muted/30 border border-border rounded-md text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{t}</span>
                                    ))}
                                </div>
                                <div className="pt-4 border-t border-border flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Pricing</span>
                                        <span className="text-sm font-black text-foreground">${l.hourlyRate}/hr</span>
                                    </div>
                                    <Button size="sm" className="bg-emerald-600 rounded-none px-4 gap-2 font-bold group">
                                        Consult
                                        <MessageCircle className="w-4 h-4 group-hover:animate-bounce" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/30 rounded-[2.5rem] border border-dashed border-border">
                    <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Users className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground font-playfair mb-2">No lawyers available yet</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        We couldn't find any lawyers matching your filters. Check back soon or try widening your search.
                    </p>
                </div>
            )}

            {/* Trust Banner */}
            <div className="bg-emerald-50 rounded-[2.5rem] p-8 md:p-12 text-center space-y-4 border border-emerald-100">
                <div className="w-16 h-16 bg-emerald-500 rounded-none flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-emerald-900 font-playfair">Vetted & Verified Professionals</h2>
                <p className="text-emerald-700/70 max-w-xl mx-auto font-medium">
                    Every lawyer in our network undergoes a rigorous background check and verification process for your security and peace of mind.
                </p>
            </div>
        </div>
    );
}
