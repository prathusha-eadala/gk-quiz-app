"use client";

import { useState } from "react";

const categoryImages = {
  "History": "https://images.unsplash.com/photo-1599733589046-10c005739ef9?auto=format&fit=crop&w=800&q=80",
  "Science": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  "Geography": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
  "Pop Culture": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80"
};

export default function Home() {
  const [category, setCategory] = useState("History");
  const [quizLength, setQuizLength] = useState(10); // Default quiz size configuration
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user] = useState({ name: "Maya", level: 5, rank: "Explorer" });

  const startNewQuiz = () => {
    setScore(0);
    setCurrentQuestionNumber(1);
    setIsGameActive(true);
    fetchQuestion();
  };

  const fetchQuestion = async () => {
    setLoading(true);
    setQuiz(null);
    setSelectedAnswer(null);
    setPointsEarned(null);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuiz(data);
    } catch (err) {
      alert(err.message || "Error generating question. Let's try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleNextAction = () => {
    if (currentQuestionNumber >= quizLength) {
      setIsGameActive(false); // Trigger Game Over view state
      setQuiz(null);
    } else {
      setCurrentQuestionNumber(prev => prev + 1);
      fetchQuestion();
    }
  };

  const handleAnswerClick = (option) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    
    // Set explicit question base weight configuration
    const questionValue = 250; 
    
    if (option === quiz.answer) {
      setScore(prev => prev + questionValue);
      setPointsEarned(questionValue);
    } else {
      setPointsEarned(0);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-black text-white flex flex-col items-center justify-center p-4 antialiased">
      <header className="w-full max-w-6xl flex justify-between items-center mb-8 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-tr from-cyan-400 to-indigo-600 rounded-xl flex items-center justify-center font-black tracking-tighter shadow-indigo-500/20 shadow-lg">
            WΩ
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">WONDRGK</h1>
            <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase -mt-1">AI Trivia Framework</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            HF Serverless: <span className="text-emerald-400 font-mono">Active</span>
          </div>
          
          <button 
            onClick={() => setIsLoggedIn(!isLoggedIn)}
            className={`text-xs px-4 py-2 rounded-lg font-semibold transition border ${
              isLoggedIn 
                ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300" 
                : "bg-indigo-600 hover:bg-indigo-500 border-indigo-500 shadow-md shadow-indigo-600/20"
            }`}
          >
            {isLoggedIn ? "🔒 Log Out" : "🔑 Interactive Logon"}
          </button>
        </div>
      </header>

      <main className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-1 bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 text-center flex flex-col items-center">
          {isLoggedIn ? (
            <>
              <div className="relative mb-3">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full border-2 border-indigo-500/60 p-1 object-cover"
                />
                <span className="absolute bottom-0 right-0 bg-indigo-500 text-[10px] font-bold px-2 py-0.5 rounded-full">Lv.{user.level}</span>
              </div>
              <h3 className="font-bold text-lg text-slate-200">Welcome, {user.name}!</h3>
              <p className="text-xs text-indigo-400 font-mono mb-4">{user.rank}</p>
              
              <div className="w-full bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Quiz Run Score:</span>
                  <span className="font-mono text-cyan-400 font-bold">{score} pts</span>
                </div>
                {isGameActive && (
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                    <span>Progress:</span>
                    <span>{currentQuestionNumber} / {quizLength}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-6 space-y-3">
              <p className="text-sm text-slate-400">Log in to sync your score metrics with the framework.</p>
              <button onClick={() => setIsLoggedIn(true)} className="text-xs text-indigo-400 underline hover:text-indigo-300">Quick Anonymous Guest Access</button>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          <div className="p-6 md:col-span-7 flex flex-col justify-between min-h-[490px]">
            <div>
              <span className="text-[10px] tracking-widest uppercase text-cyan-400 font-mono font-bold block mb-1">Knowledge Objective</span>
              <h2 className="text-2xl font-black text-white tracking-tight mb-6">Explore Wonderful Knowledge</h2>

              {/* Settings Configuration View (Shown only if game hasn't started or is over) */}
              {!isGameActive ? (
                <div className="space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 animate-fadeIn">
                  <h3 className="text-sm font-bold text-slate-300">Setup Active Parameters</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Track Focus</label>
                      <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-950 text-slate-200 text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="History">📜 History & Antiquities</option>
                        <option value="Science">🧪 Science & Cosmos</option>
                        <option value="Geography">🌍 Geography & Frontiers</option>
                        <option value="Pop Culture">🎬 Pop Culture & Cinema</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">Matrix Length</label>
                      <select 
                        value={quizLength} 
                        onChange={(e) => setQuizLength(Number(e.target.value))}
                        className="w-full bg-slate-950 text-slate-200 text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value={10}>10 Objectives</option>
                        <option value={20}>20 Objectives</option>
                        <option value={50}>50 Objectives</option>
                        <option value={100}>100 Objectives</option>
                      </select>
                    </div>
                  </div>

                  {currentQuestionNumber > 0 && (
                    <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-900/40 text-center text-xs text-indigo-300">
                      🏆 Final Track Results: <strong>{score}</strong> Points accumulated.
                    </div>
                  )}

                  <button 
                    onClick={startNewQuiz} 
                    disabled={loading || !isLoggedIn}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-xs font-bold py-3 rounded-xl tracking-wider uppercase transition shadow-lg shadow-indigo-600/10"
                  >
                    Initialize Simulation
                  </button>
                </div>
              ) : quiz ? (
                /* Main Interactive Question Card view block */
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                      Objective {currentQuestionNumber} of {quizLength}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-1 rounded-md border border-indigo-900/60">
                      Value: +250 PTS
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-300 font-medium leading-relaxed bg-slate-950/20 p-3 rounded-xl border border-slate-900">{quiz.question}</p>
                  
                  <div className="space-y-2">
                    {quiz.options.map((option, idx) => {
                      let buttonStyle = "w-full text-left p-3 rounded-xl border text-xs transition duration-200 ";
                      
                      if (selectedAnswer) {
                        if (option === quiz.answer) {
                          buttonStyle += "bg-emerald-950/40 border-emerald-500 text-emerald-300 font-semibold";
                        } else if (option === selectedAnswer) {
                          buttonStyle += "bg-rose-950/40 border-rose-500 text-rose-300";
                        } else {
                          buttonStyle += "bg-slate-950/20 border-slate-900/60 text-slate-600 cursor-not-allowed";
                        }
                      } else {
                        buttonStyle += "bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300";
                      }

                      return (
                        <button 
                          key={idx}
                          onClick={() => handleAnswerClick(option)}
                          disabled={!!selectedAnswer}
                          className={buttonStyle}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Mid-round Loading Interface Spinner layout */
                <div className="border border-dashed border-slate-800 rounded-2xl h-48 flex items-center justify-center text-slate-500 text-xs text-center p-4">
                  <div className="flex flex-col items-center gap-2">
                    <span className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></span>
                    <span>Synthesizing Objective via Hugging Face API...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Combined Context Box & NEXT QUESTION Trigger Button */}
            {selectedAnswer && (
              <div className="mt-6 p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider mb-0.5">Contextual Verdict</span>
                    <p className="text-xs text-slate-400 leading-relaxed">{quiz.explanation}</p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${pointsEarned > 0 ? "bg-emerald-950 text-emerald-400" : "bg-rose-950 text-rose-400"}`}>
                    +{pointsEarned} PTS
                  </span>
                </div>
                
                <button
                  onClick={handleNextAction}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 font-bold py-2.5 px-4 rounded-xl text-xs tracking-wider uppercase transition text-center shadow-lg shadow-indigo-950"
                >
                  {currentQuestionNumber >= quizLength ? "Complete Simulation ➔" : "Next Objective ➔"}
                </button>
              </div>
            )}
          </div>

          <div className="hidden md:block md:col-span-5 relative min-h-full bg-slate-950">
            <img 
              src={categoryImages[category] || categoryImages["History"]} 
              alt={category} 
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-800">
              <p className="text-[10px] font-mono uppercase text-cyan-400">Active Sector Matrix</p>
              <h4 className="text-xs font-bold text-slate-200 mt-0.5">{category} Track initialized</h4>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}