"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, Star, Film, ScrollText, Filter, TrendingUp, Users, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Movie {
  title: string;
  genre: string;
  rating: number;
  year: number;
  revenue?: number;
  director?: string;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"];

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filtered, setFiltered] = useState<Movie[]>([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [year, setYear] = useState("All");
  const [director, setDirector] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/movies")
      .then(res => {
        setMovies(res.data);
        setFiltered(res.data);
      })
      .catch(err => console.error("Error fetching movies:", err));
  }, []);

  const genres = useMemo(() => Array.from(new Set(movies.flatMap(m => m.genre?.split(",") || []))).sort(), [movies]);
  const years = useMemo(() => Array.from(new Set(movies.map(m => m.year))).sort((a, b) => b - a), [movies]);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const lowerDirector = director.toLowerCase();

    const result = movies.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(lowerSearch);
      const matchesGenre = genre === "All" || (m.genre && m.genre.includes(genre));
      const matchesYear = year === "All" || m.year.toString() === year;
      const matchesDirector = !director || (m.director && m.director.toLowerCase().includes(lowerDirector));
      return matchesSearch && matchesGenre && matchesYear && matchesDirector;
    });

    setFiltered(result);
  }, [search, genre, year, director, movies]);

  const stats = useMemo(() => {
    const totalMovies = filtered.length;
    const avgRating = totalMovies > 0 ? (filtered.reduce((acc, m) => acc + m.rating, 0) / totalMovies).toFixed(1) : "0";
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
      if (!data[m.year]) data[m.year] = { year: m.year, revenue: 0, count: 0 };
      data[m.year].revenue += m.revenue || 0;
      data[m.year].count += 1;
    });
    return Object.values(data).sort((a, b) => a.year - b.year);
  }, [filtered]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white px-6 py-8 font-sans">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Movie Analytics Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<Film className="text-blue-400" />} title="Total Movies" value={stats.totalMovies} />
        <StatCard icon={<Star className="text-yellow-400" />} title="Avg Rating" value={stats.avgRating} />
        <StatCard icon={<DollarSign className="text-green-400" />} title="Total Revenue" value={`$${(stats.totalRevenue / 1000000).toFixed(1)}M`} />
      </div>

      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm mb-8">
        <div className="flex items-center gap-2 mb-4 text-purple-300">
          <Filter className="w-5 h-5" />
          <h2 className="font-semibold text-lg">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 text-white rounded-xl pl-10 pr-4 py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          <div className="relative">
            <Users className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Filter by Director..."
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              className="w-full bg-gray-900 text-white rounded-xl pl-10 pr-4 py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          <select
            className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          >
            <option value="All">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <ChartCard title="Movies by Genre">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#E5E7EB' }} />
              <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                {genreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Trend (Yearly)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" tickFormatter={(val) => `$${val / 1000000}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#E5E7EB' }}
                formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, "Revenue"]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-purple-300 flex items-center gap-2">
          <ScrollText className="w-6 h-6" />
          Movie List <span className="text-sm font-normal text-gray-500">({filtered.length} results)</span>
        </h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {filtered.map((movie, i) => (
            <motion.div
              key={i}
              className="bg-gray-800 rounded-2xl p-5 hover:scale-105 hover:shadow-purple-500/20 shadow-lg transition-all border border-gray-700/50 group"
              whileHover={{ y: -5 }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1" title={movie.title}>
                  {movie.title}
                </h3>
                <span className="bg-gray-700 text-xs px-2 py-1 rounded-full text-gray-300">{movie.year}</span>
              </div>

              <p className="text-sm text-gray-400 mb-3 line-clamp-1">{movie.genre}</p>

              {movie.director && (
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {movie.director}
                </p>
              )}

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-700">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  <span className="font-medium">{movie.rating}</span>
                </div>
                <div className="text-sm text-green-400 font-medium">
                  {movie.revenue ? `$${(movie.revenue / 1000000).toFixed(0)}M` : "N/A"}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Film className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl">No movies found matching your filters.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string | number }) {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex items-center gap-4">
      <div className="p-3 bg-gray-700/50 rounded-xl">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        {title}
      </h3>
      {children}
    </div>
  );
}
