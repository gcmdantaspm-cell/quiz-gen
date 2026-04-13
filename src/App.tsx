import React, { useState, useRef } from "react";
import { Upload, FileText, Send, Loader2, CheckCircle2, XCircle, ChevronRight, BookOpen, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Question {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string;
  explanation?: string;
}

export default function App() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setText(""); // Clear text if file is selected
    }
  };

  const handleGenerate = async () => {
    if (!text && !file) {
      setError("Por favor, cole um texto ou selecione um arquivo PDF.");
      return;
    }

    setLoading(true);
    setError(null);
    setQuestions([]);
    setUserAnswers({});
    setShowResults(false);

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    } else {
      formData.append("text", text);
    }

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao gerar questões. Tente novamente.");
      }

      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, option: string) => {
    if (showResults) return;
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Sparkles size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">QuizGen AI</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">Como funciona</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Preços</a>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-sm">
              Entrar
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-gray-900"
          >
            Transforme conteúdo em <span className="text-indigo-600">conhecimento</span>.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Cole seu texto ou suba um PDF e deixe nossa IA gerar questões personalizadas para você estudar de forma mais eficiente.
          </motion.p>
        </div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 mb-12"
        >
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-indigo-500" />
                  Cole seu texto aqui
                </label>
                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setFile(null);
                  }}
                  placeholder="Insira o texto que você deseja transformar em questões..."
                  className="w-full h-40 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none bg-gray-50/50"
                />
              </div>
              
              <div className="md:w-64 flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Upload size={16} className="text-indigo-500" />
                  Ou suba um PDF
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${
                    file ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".pdf" 
                    className="hidden" 
                  />
                  {file ? (
                    <div className="text-center">
                      <BookOpen size={32} className="text-indigo-600 mx-auto mb-2" />
                      <p className="text-xs font-medium text-indigo-700 truncate max-w-[150px]">
                        {file.name}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Clique para selecionar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Gerando questões...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Gerar Questões
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                <XCircle size={18} />
                {error}
              </div>
            )}
          </div>
        </motion.div>

        {/* Questions Section */}
        <AnimatePresence>
          {questions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="text-green-500" />
                  Questões Geradas
                </h3>
                {showResults && (
                  <div className="bg-indigo-600 text-white px-4 py-2 rounded-full font-bold shadow-md">
                    Pontuação: {calculateScore()} / {questions.length}
                  </div>
                )}
              </div>

              {questions.map((q, qIdx) => (
                <motion.div 
                  key={qIdx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: qIdx * 0.1 }}
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-lg font-bold mb-6 text-gray-800">
                    <span className="text-indigo-600 mr-2">{qIdx + 1}.</span>
                    {q.question}
                  </p>
                  
                  <div className="grid gap-3">
                    {Object.entries(q.options).map(([key, value]) => {
                      const isSelected = userAnswers[qIdx] === key;
                      const isCorrect = key === q.answer;
                      const showCorrect = showResults && isCorrect;
                      const showWrong = showResults && isSelected && !isCorrect;

                      return (
                        <button
                          key={key}
                          onClick={() => handleAnswerSelect(qIdx, key)}
                          className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                            showCorrect 
                              ? 'bg-green-50 border-green-500 text-green-800' 
                              : showWrong 
                                ? 'bg-red-50 border-red-500 text-red-800'
                                : isSelected 
                                  ? 'bg-indigo-50 border-indigo-500 text-indigo-800' 
                                  : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                              isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {key}
                            </span>
                            {value}
                          </span>
                          {showCorrect && <CheckCircle2 size={20} className="text-green-600" />}
                          {showWrong && <XCircle size={20} className="text-red-600" />}
                        </button>
                      );
                    })}
                  </div>

                  {showResults && q.explanation && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 p-4 bg-indigo-50 rounded-xl text-sm text-indigo-800 border border-indigo-100"
                    >
                      <p className="font-bold mb-1 flex items-center gap-2">
                        <Sparkles size={14} />
                        Explicação:
                      </p>
                      {q.explanation}
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {!showResults && (
                <button
                  onClick={() => setShowResults(true)}
                  className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-xl active:scale-[0.98]"
                >
                  Verificar Respostas
                </button>
              )}

              {showResults && (
                <button
                  onClick={handleGenerate}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Gerar Novas Questões
                  <ChevronRight size={20} />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 mt-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <Sparkles size={20} />
            <span className="font-bold">QuizGen AI</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2024 QuizGen AI. Desenvolvido com Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
}
