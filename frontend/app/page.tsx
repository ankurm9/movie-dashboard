"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Film, ScrollText, Filter, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from "recharts";
import Sidebar from "../components/Sidebar";

interface Movie {
    title?: string;
    name?: string;
    genre?: string;
    rating?: number;
    year?: number;
    revenue?: number;
    director?: string;
    description?: string;
}

const COLORS = ["#F5C518", "#E50914", "#5799EF", "#66CC33", "#FF9900", "#9933CC"];

const MOCK_MOVIES: Movie[] = [
    { title: "The Dark Knight", genre: "Action,Crime,Drama", rating: 9.0, year: 2008, revenue: 1004558444, director: "Christopher Nolan" },
    { title: "Inception", genre: "Action,Adventure,Sci-Fi", rating: 8.8, year: 2010, revenue: 829895144, director: "Christopher Nolan" },
    { title: "The Matrix", genre: "Action,Sci-Fi", rating: 8.7, year: 1999, revenue: 463517383, director: "Lana Wachowski" },
    { title: "Interstellar", genre: "Adventure,Drama,Sci-Fi", rating: 8.6, year: 2014, revenue: 675120017, director: "Christopher Nolan" },
    { title: "Parasite", genre: "Comedy,Drama,Thriller", rating: 8.6, year: 2019, revenue: 258773635, director: "Bong Joon Ho" },
    { title: "Avengers: Endgame", genre: "Action,Adventure,Drama", rating: 8.4, year: 2019, revenue: 2797501328, director: "Anthony Russo" },
    { title: "Joker", genre: "Crime,Drama,Thriller", rating: 8.4, year: 2019, revenue: 1074251311, director: "Todd Phillips" },
    { title: "Spider-Man: Into the Spider-Verse", genre: "Animation,Action,Adventure", rating: 8.4, year: 2018, revenue: 375540831, director: "Bob Persichetti" },
];

export default function Home() {
    const [movies, setMovies] = useState<Movie[]>(MOCK_MOVIES);
    const [filtered, setFiltered] = useState<Movie[]>(MOCK_MOVIES);

    const [activeView, setActiveView] = useState("movies");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [search, setSearch] = useState("");
    const [genre, setGenre] = useState("All");
    const [year, setYear] = useState("All");
    const [director, setDirector] = useState("");

    useEffect(() => {
        axios.get("http://localhost:5000/movies")
            .then(res => {
                console.log("Fetched movies:", res.data);
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setMovies(res.data);
                    setFiltered(res.data);
                } else {
                    console.warn("API returned empty or invalid data, keeping mock data.");
                }
            })
            .catch(err => {
                console.error("Error fetching movies:", err);
            });
    }, []);

    const genres = useMemo(() => Array.from(new Set(movies.flatMap(m => m.genre?.split(",") || []))).sort(), [movies]);
    const years = useMemo(() => Array.from(new Set(movies.map(m => m.year))).filter(y => y !== undefined).sort((a, b) => (b || 0) - (a || 0)), [movies]);

    useEffect(() => {
        try {
            const lowerSearch = search.toLowerCase();
            const lowerDirector = director.toLowerCase();

            const result = movies.filter(m => {
                const title = m.title || m.name || "Untitled";
                const matchesSearch = title.toLowerCase().includes(lowerSearch);
                const matchesGenre = genre === "All" || (m.genre && m.genre.includes(genre));
                const matchesYear = year === "All" || (m.year && m.year.toString() === year);
                const matchesDirector = !director || (m.director && m.director.toLowerCase().includes(lowerDirector));

                return matchesSearch && matchesGenre && matchesYear && matchesDirector;
            });

            setFiltered(result);
        } catch (error) {
            console.error("Error filtering movies:", error);
        }
    }, [search, genre, year, director, movies]);

    const stats = useMemo(() => {
        const totalMovies = filtered.length;
        const avgRating = totalMovies > 0 ? (filtered.reduce((acc, m) => acc + (m.rating || 0), 0) / totalMovies).toFixed(1) : "0";
        const totalRevenue = filtered.reduce((acc, m) => acc + (m.revenue || 0), 0);
        return { totalMovies, avgRating, totalRevenue };
    }, [filtered]);

    const genreData = useMemo(() => {
        const counts: Record<string, number> = {};
        filtered.forEach(m => {
            const gList = m.genre?.split(",") || ["Unknown"];
            gList.forEach(g => {
                counts[g] = (counts[g] || 0) + 1;
            });
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); 
    }, [filtered]);

    const yearData = useMemo(() => {
        const data: Record<number, { year: number; revenue: number; count: number }> = {};
        filtered.forEach(m => {
            if (m.year) {
                if (!data[m.year]) data[m.year] = { year: m.year, revenue: 0, count: 0 };
                data[m.year].revenue += m.revenue || 0;
                data[m.year].count += 1;
            }
        });
        return Object.values(data).sort((a, b) => a.year - b.year);
    }, [filtered]);

    const ratingDistData = useMemo(() => {
        const ranges = ["0-2", "2-4", "4-6", "6-8", "8-10"];
        const counts = [0, 0, 0, 0, 0];
        filtered.forEach(m => {
            const r = Math.floor((m.rating || 0) / 2);
            if (r >= 0 && r < 5) counts[r]++;
            else if (r === 5) counts[4]++; // 10 rating
        });
        return ranges.map((range, i) => ({ name: range, value: counts[i] }));
    }, [filtered]);

    const topDirectors = useMemo(() => {
        const counts: Record<string, number> = {};
        filtered.forEach(m => {
            if (m.director) {
                counts[m.director] = (counts[m.director] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [filtered]);

    return (
        <div className="min-h-screen bg-[#121212] text-white font-sans flex">
            <Sidebar
                activeView={activeView}
                setActiveView={setActiveView}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            <main
                className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"} p-8`}
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#F5C518] tracking-tight">
                            {activeView === "movies" && "All Movies"}
                            {activeView === "charts" && "Analytics & Charts"}
                            {activeView === "trends" && "Market Trends"}
                            {activeView === "insights" && "Key Insights"}
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {filtered.length} movies in current view
                        </p>
                    </div>

                    <div className="flex gap-6 bg-[#1F1F1F] px-6 py-3 rounded-xl border border-gray-800">
                        <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Rating</p>
                            <p className="text-xl font-bold text-[#F5C518] flex items-center justify-center gap-1">
                                {stats.avgRating} <Star size={14} fill="#F5C518" />
                            </p>
                        </div>
                        <div className="w-px bg-gray-700"></div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Revenue</p>
                            <p className="text-xl font-bold text-green-500">
                                ${(stats.totalRevenue / 1000000).toFixed(0)}M
                            </p>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeView === "movies" && (
                        <motion.div
                            key="movies"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="bg-[#1F1F1F] p-6 rounded-xl border border-gray-800 mb-8 shadow-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search title..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full bg-[#121212] text-white rounded-lg pl-10 pr-4 py-3 border border-gray-700 focus:border-[#F5C518] focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Filter by Director..."
                                            value={director}
                                            onChange={(e) => setDirector(e.target.value)}
                                            className="w-full bg-[#121212] text-white rounded-lg pl-10 pr-4 py-3 border border-gray-700 focus:border-[#F5C518] focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <select
                                        className="bg-[#121212] border border-gray-700 text-white rounded-lg px-4 py-3 focus:border-[#F5C518] outline-none"
                                        value={genre}
                                        onChange={(e) => setGenre(e.target.value)}
                                    >
                                        <option value="All">All Genres</option>
                                        {genres.map((g) => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="bg-[#121212] border border-gray-700 text-white rounded-lg px-4 py-3 focus:border-[#F5C518] outline-none"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                    >
                                        <option value="All">All Years</option>
                                        {years.map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filtered.map((movie, i) => (
                                    <motion.div
                                        key={i}
                                        className="bg-[#1F1F1F] rounded-xl overflow-hidden hover:shadow-xl hover:shadow-[#F5C518]/10 transition-all group border border-gray-800 hover:border-[#F5C518]/50"
                                        whileHover={{ y: -5 }}
                                    >
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-white group-hover:text-[#F5C518] transition-colors line-clamp-1" title={movie.title || movie.name}>
                                                    {movie.title || movie.name || "Untitled"}
                                                </h3>
                                                <span className="bg-gray-800 text-xs px-2 py-1 rounded text-gray-400 font-mono">{movie.year}</span>
                                            </div>

                                            <p className="text-sm text-gray-400 mb-4 line-clamp-1">{movie.genre}</p>

                                            <div className="space-y-2">
                                                {movie.director && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Users className="w-4 h-4" />
                                                        <span>{movie.director}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                                                    <div className="flex items-center gap-1 text-[#F5C518]">
                                                        <Star className="w-4 h-4 fill-[#F5C518]" />
                                                        <span className="font-bold">{movie.rating}</span>
                                                    </div>
                                                    <div className="text-sm text-green-500 font-mono">
                                                        {movie.revenue ? `$${(movie.revenue / 1000000).toFixed(0)}M` : "N/A"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeView === "charts" && (
                        <motion.div
                            key="charts"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            <ChartCard title="Genre Distribution">
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={genreData} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                        <XAxis type="number" stroke="#666" />
                                        <YAxis dataKey="name" type="category" stroke="#999" width={100} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1F1F1F', border: '1px solid #333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#F5C518' }}
                                            cursor={{ fill: '#333', opacity: 0.4 }}
                                        />
                                        <Bar dataKey="value" fill="#F5C518" radius={[0, 4, 4, 0]}>
                                            {genreData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="Rating Distribution">
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie
                                            data={ratingDistData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        >
                                            {ratingDistData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#1F1F1F', border: '1px solid #333' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </motion.div>
                    )}

                    {activeView === "trends" && (
                        <motion.div
                            key="trends"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChartCard title="Revenue Trend Over Years">
                                <ResponsiveContainer width="100%" height={400}>
                                    <AreaChart data={yearData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#F5C518" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#F5C518" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="year" stroke="#666" />
                                        <YAxis stroke="#666" tickFormatter={(val) => `$${val / 1000000}M`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1F1F1F', border: '1px solid #333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#F5C518' }}
                                            formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, "Revenue"]}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#F5C518" fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </motion.div>
                    )}

                    {activeView === "insights" && (
                        <motion.div
                            key="insights"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            <div className="bg-[#1F1F1F] p-6 rounded-xl border border-gray-800">
                                <h3 className="text-xl font-bold text-[#F5C518] mb-6 flex items-center gap-2">
                                    <Star className="w-5 h-5" /> Top 10 Rated Movies
                                </h3>
                                <div className="space-y-4">
                                    {filtered
                                        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                                        .slice(0, 10)
                                        .map((movie, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-[#121212] rounded-lg hover:bg-gray-900 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-2xl font-bold text-gray-700 w-8">#{i + 1}</span>
                                                    <div>
                                                        <p className="font-bold text-white">{movie.title || movie.name || "Untitled"}</p>
                                                        <p className="text-xs text-gray-500">{movie.year} • {movie.genre}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-[#F5C518]">
                                                    <Star className="w-4 h-4 fill-[#F5C518]" />
                                                    <span className="font-bold">{movie.rating}</span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <div className="bg-[#1F1F1F] p-6 rounded-xl border border-gray-800">
                                <h3 className="text-xl font-bold text-[#F5C518] mb-6 flex items-center gap-2">
                                    <Users className="w-5 h-5" /> Top Directors (by Movie Count)
                                </h3>
                                <div className="space-y-4">
                                    {topDirectors.map((d, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-[#121212] rounded-lg hover:bg-gray-900 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl font-bold text-gray-700 w-8">#{i + 1}</span>
                                                <p className="font-bold text-white">{d.name}</p>
                                            </div>
                                            <div className="bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-300">
                                                {d.value} movies
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-[#1F1F1F] p-6 rounded-xl border border-gray-800 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#F5C518]" />
                {title}
            </h3>
            {children}
        </div>
    );
}
