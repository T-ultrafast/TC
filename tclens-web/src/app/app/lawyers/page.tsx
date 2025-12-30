"use client";

import { useState } from "react";
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

const mockLawyers = [
    {
        id: 1,
        name: "Sarah Jenkins",
        title: "Corporate & Tech Specialist",
        location: "Silicon Valley, CA",
        rating: 4.9,
        reviews: 124,
        price: "$250/hr",
        tags: ["Intellectual Property", "SaaS Contracts"],
        image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=400&fit=crop"
    },
    {
        id: 2,
        name: "Michael Chen",
        title: "Employment Law Expert",
        location: "New York, NY",
        rating: 4.8,
        reviews: 89,
        price: "$300/hr",
        tags: ["Litigation", "Disputes"],
        image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=400&fit=crop"
    },
    {
        id: 3,
        name: "Emma Rodriguez",
        title: "Consumer Rights Advocate",
        location: "Austin, TX",
        rating: 5.0,
        reviews: 212,
        price: "$180/hr",
        tags: ["T&Cs", "Privacy Law"],
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop"
    }
];

export default function LawyerPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-legal-navy font-outfit mb-2">Lawyer Network</h1>
                    <p className="text-slate-500">Connect with vetted legal professionals for expert consultation.</p>
                </div>
                <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 font-bold gap-2">
                    Lawyer Signup
                </Button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="Search by name, expertise, or keyword..." className="w-full h-12 pl-12 pr-4 bg-transparent outline-none text-sm" />
                </div>
                <div className="md:w-px h-8 bg-slate-100 self-center hidden md:block" />
                <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="Location..." className="w-full h-12 pl-12 pr-4 bg-transparent outline-none text-sm" />
                </div>
                <Button className="h-12 px-8 rounded-xl bg-legal-navy font-bold">Search</Button>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockLawyers.map((l) => (
                    <div key={l.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden group hover:border-legal-navy/20 transition-all hover:shadow-xl hover:shadow-slate-100">
                        <div className="relative h-48 bg-slate-100 overflow-hidden">
                            <img src={l.image} alt={l.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1 shadow-sm">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span className="text-xs font-black text-legal-navy">{l.rating}</span>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h4 className="text-lg font-black text-legal-navy font-outfit">{l.name}</h4>
                                <p className="text-sm text-slate-500 font-medium">{l.title}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {l.tags.map(t => (
                                    <span key={t} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{t}</span>
                                ))}
                            </div>
                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pricing</span>
                                    <span className="text-sm font-black text-legal-navy">{l.price}</span>
                                </div>
                                <Button size="sm" className="bg-legal-navy rounded-xl px-4 gap-2 font-bold group">
                                    Consult
                                    <MessageCircle className="w-4 h-4 group-hover:animate-bounce" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trust Banner */}
            <div className="bg-emerald-50 rounded-[2.5rem] p-8 md:p-12 text-center space-y-4 border border-emerald-100">
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-emerald-900 font-outfit">Vetted & Verified Professionals</h2>
                <p className="text-emerald-700/70 max-w-xl mx-auto font-medium">
                    Every lawyer in our network undergoes a rigorous background check and verification process for your security and peace of mind.
                </p>
            </div>
        </div>
    );
}
