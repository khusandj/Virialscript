/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Video, 
  Sparkles, 
  Plus, 
  Trash2, 
  ChevronRight, 
  FileText, 
  CheckCircle2,
  Loader2,
  Instagram,
  Zap,
  Search,
  Target,
  BarChart3,
  TrendingUp,
  Lightbulb,
  Globe,
  Calendar,
  Magnet,
  Users,
  Filter,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  ExternalLink,
  PenTool,
  Smartphone,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  analyzeVideoContent, 
  generateViralScript, 
  analyzeCompetitors, 
  getRealTimeTrends,
  findCompetitors,
  generateContentPlan,
  generateHooks,
  generateAudiencePersona,
  generateContentFunnel,
  analyzeInstagramProfile,
  generatePostCaption,
  generateStoriesStrategy,
  generateAdCampaign
} from './services/geminiService';
import { ViralPattern, CompetitorAnalysis } from './types';

export default function App() {
  const [patterns, setPatterns] = useState<ViralPattern[]>(() => {
    const saved = localStorage.getItem('viral_patterns');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoInput, setVideoInput] = useState('');
  const [companyProfile, setCompanyProfile] = useState(() => localStorage.getItem('company_profile') || '');
  const [productInfo, setProductInfo] = useState(() => localStorage.getItem('product_info') || '');
  const [productImage, setProductImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [generatedScript, setGeneratedScript] = useState('');
  const [competitorNames, setCompetitorNames] = useState('');
  const [competitorInstagramLink, setCompetitorInstagramLink] = useState('');
  const [competitorAnalysis, setCompetitorAnalysis] = useState('');
  const [isAnalyzingCompetitors, setIsAnalyzingCompetitors] = useState(false);
  const [competitorAnalyses, setCompetitorAnalyses] = useState<CompetitorAnalysis[]>(() => {
    const saved = localStorage.getItem('competitorAnalyses');
    return saved ? JSON.parse(saved) : [];
  });
  const [trendsCategory, setTrendsCategory] = useState('');
  const [trendsResult, setTrendsResult] = useState('');
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);
  
  const [myInstagramLink, setMyInstagramLink] = useState('');
  const [foundCompetitorsResult, setFoundCompetitorsResult] = useState('');
  const [isFindingCompetitors, setIsFindingCompetitors] = useState(false);

  const [contentPlanResult, setContentPlanResult] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planDays, setPlanDays] = useState<7 | 15>(7);

  const [hooksResult, setHooksResult] = useState('');
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);

  const [personaResult, setPersonaResult] = useState('');
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);

  const [funnelResult, setFunnelResult] = useState('');
  const [isGeneratingFunnel, setIsGeneratingFunnel] = useState(false);

  const [postTopic, setPostTopic] = useState('');
  const [postResult, setPostResult] = useState('');
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);

  const [storiesResult, setStoriesResult] = useState('');
  const [isGeneratingStories, setIsGeneratingStories] = useState(false);

  const [adResult, setAdResult] = useState('');
  const [isGeneratingAd, setIsGeneratingAd] = useState(false);

  const [profileLink, setProfileLink] = useState('');
  const [isAnalyzingProfile, setIsAnalyzingProfile] = useState(false);

  const [activeTab, setActiveTab] = useState<'learn' | 'create' | 'competitors' | 'trends' | 'find_competitors' | 'plan' | 'strategy' | 'copywriting' | 'stories' | 'ads'>('learn');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const productImageRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('viral_patterns', JSON.stringify(patterns));
  }, [patterns]);

  useEffect(() => {
    localStorage.setItem('company_profile', companyProfile);
  }, [companyProfile]);

  useEffect(() => {
    localStorage.setItem('product_info', productInfo);
  }, [productInfo]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const pattern = await analyzeVideoContent({ 
          videoBase64: base64, 
          mimeType: file.type 
        });
        setPatterns(prev => [pattern, ...prev]);
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Analysis failed:", error);
      setIsAnalyzing(false);
    }
  };

  const handleTextAnalysis = async () => {
    if (!videoInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const pattern = await analyzeVideoContent({ text: videoInput });
      setPatterns(prev => [pattern, ...prev]);
      setVideoInput('');
      setIsAnalyzing(false);
    } catch (error) {
      console.error("Analysis failed:", error);
      setIsAnalyzing(false);
    }
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setProductImage({ data: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (patterns.length === 0 || !companyProfile || !productInfo) return;
    setIsGenerating(true);
    try {
      const script = await generateViralScript(
        patterns, 
        companyProfile, 
        productInfo, 
        productImage || undefined
      );
      setGeneratedScript(script);
      setIsGenerating(false);
    } catch (error) {
      console.error("Generation failed:", error);
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('competitorAnalyses', JSON.stringify(competitorAnalyses));
  }, [competitorAnalyses]);

  const handleAnalyzeCompetitors = async () => {
    if (!competitorNames || !productInfo) return;
    setIsAnalyzingCompetitors(true);
    try {
      const result = await analyzeCompetitors(competitorNames, productInfo, competitorAnalyses, competitorInstagramLink);
      setCompetitorAnalysis(result);
      
      const newAnalysis: CompetitorAnalysis = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleString('uz-UZ'),
        competitorNames,
        instagramLink: competitorInstagramLink,
        productInfo,
        analysis: result
      };
      
      setCompetitorAnalyses(prev => [newAnalysis, ...prev]);
      setIsAnalyzingCompetitors(false);
    } catch (error) {
      console.error("Competitor analysis failed:", error);
      setIsAnalyzingCompetitors(false);
    }
  };

  const handleFetchTrends = async () => {
    if (!trendsCategory) return;
    setIsFetchingTrends(true);
    try {
      const result = await getRealTimeTrends(trendsCategory);
      setTrendsResult(result);
      setIsFetchingTrends(false);
    } catch (error) {
      console.error("Trends fetch failed:", error);
      setIsFetchingTrends(false);
    }
  };

  const handleFindCompetitors = async () => {
    if (!myInstagramLink || !productInfo) return;
    setIsFindingCompetitors(true);
    try {
      const result = await findCompetitors(myInstagramLink, productInfo);
      setFoundCompetitorsResult(result);
    } catch (error) {
      console.error("Error finding competitors:", error);
      setFoundCompetitorsResult("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsFindingCompetitors(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!productInfo) return;
    setIsGeneratingPlan(true);
    try {
      const result = await generateContentPlan(productInfo, planDays);
      setContentPlanResult(result);
    } catch (error) {
      console.error("Error generating plan:", error);
      setContentPlanResult("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleGenerateHooks = async () => {
    if (!productInfo) return;
    setIsGeneratingHooks(true);
    try {
      const result = await generateHooks(productInfo);
      setHooksResult(result);
    } catch (error) {
      console.error("Error generating hooks:", error);
      setHooksResult("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsGeneratingHooks(false);
    }
  };

  const handleGeneratePersona = async () => {
    if (!productInfo) return;
    setIsGeneratingPersona(true);
    try {
      const result = await generateAudiencePersona(productInfo);
      setPersonaResult(result);
    } catch (error) {
      console.error("Error generating persona:", error);
      setPersonaResult("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsGeneratingPersona(false);
    }
  };

  const handleGenerateFunnel = async () => {
    if (!productInfo) return;
    setIsGeneratingFunnel(true);
    try {
      const result = await generateContentFunnel(productInfo);
      setFunnelResult(result);
    } catch (error) {
      console.error("Error generating funnel:", error);
      setFunnelResult("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsGeneratingFunnel(false);
    }
  };

  const handleGeneratePost = async () => {
    if (!productInfo || !postTopic) return;
    setIsGeneratingPost(true);
    try {
      const result = await generatePostCaption(productInfo, postTopic);
      setPostResult(result);
    } catch (error) {
      console.error("Error generating post:", error);
      setPostResult("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const handleGenerateStories = async () => {
    if (!productInfo) return;
    setIsGeneratingStories(true);
    try {
      const result = await generateStoriesStrategy(productInfo);
      setStoriesResult(result);
    } catch (error) {
      console.error("Error generating stories:", error);
      setStoriesResult("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsGeneratingStories(false);
    }
  };

  const handleGenerateAd = async () => {
    if (!productInfo) return;
    setIsGeneratingAd(true);
    try {
      const result = await generateAdCampaign(productInfo);
      setAdResult(result);
    } catch (error) {
      console.error("Error generating ad:", error);
      setAdResult("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsGeneratingAd(false);
    }
  };

  const handleAnalyzeProfile = async () => {
    if (!profileLink) return;
    setIsAnalyzingProfile(true);
    try {
      const newPatterns = await analyzeInstagramProfile(profileLink);
      if (newPatterns && newPatterns.length > 0) {
        setPatterns(prev => [...prev, ...newPatterns]);
        setProfileLink('');
      } else {
        alert("Profil tahlil qilindi, lekin yangi pattern topilmadi.");
      }
    } catch (error) {
      console.error("Error analyzing profile:", error);
      alert("Profilni tahlil qilishda xatolik yuz berdi.");
    } finally {
      setIsAnalyzingProfile(false);
    }
  };

  const removePattern = (id: string) => {
    setPatterns(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-orange-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ViralScript <span className="text-orange-500">AI</span></h1>
          </div>
          <nav className="flex gap-1 bg-white/5 p-1 rounded-full border border-white/10">
            <button 
              onClick={() => setActiveTab('learn')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'learn' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              O'rganish
            </button>
            <button 
              onClick={() => setActiveTab('create')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'create' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              Yaratish
            </button>
            <button 
              onClick={() => setActiveTab('competitors')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'competitors' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              Raqobatchilar
            </button>
            <button 
              onClick={() => setActiveTab('trends')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'trends' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              Trendlar
            </button>
            <button 
              onClick={() => setActiveTab('find_competitors')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'find_competitors' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              Izlash
            </button>
            <button 
              onClick={() => setActiveTab('plan')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'plan' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              Reja
            </button>
            <button 
              onClick={() => setActiveTab('strategy')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'strategy' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              Strategiya
            </button>
            <button 
              onClick={() => setActiveTab('copywriting')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'copywriting' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              Kopirayting
            </button>
            <button 
              onClick={() => setActiveTab('stories')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'stories' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              Stories
            </button>
            <button 
              onClick={() => setActiveTab('ads')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'ads' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              Targeting
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'learn' ? (
            <motion.div 
              key="learn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <section className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                  Trendlarni tahlil qiling
                </h2>
                <p className="text-white/60 text-lg">
                  Instagramda viral bo'lgan videolarni yuklang yoki tavsiflang. AI ularning muvaffaqiyat sirlarini o'rganadi.
                </p>
              </section>

              {/* Input Section */}
              <section className="grid md:grid-cols-2 gap-8">
                {/* Single Video Analysis */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 hover:border-orange-500/30 transition-colors group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Video className="w-5 h-5 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-semibold">Yakka videoni tahlil qilish</h3>
                  </div>
                  <textarea 
                    value={videoInput}
                    onChange={(e) => setVideoInput(e.target.value)}
                    placeholder="Videoda nimalar sodir bo'lishini yozing (masalan: 'Birinchi 3 soniyada qiziqarli savol beriladi...')"
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                  />
                  <button 
                    onClick={handleTextAnalysis}
                    disabled={isAnalyzing || !videoInput.trim()}
                    className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50"
                  >
                    {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Tahlil qilish
                  </button>
                </div>

                {/* Profile Analysis */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 hover:border-pink-500/30 transition-colors group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-pink-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Butun profilni tahlil qilish</h3>
                      <p className="text-xs text-white/40 mt-1">Eng zo'r videolardan pattern yig'ish</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <input 
                      type="text"
                      value={profileLink}
                      onChange={(e) => setProfileLink(e.target.value)}
                      placeholder="Instagram profil havolasi (masalan: https://instagram.com/username)"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-pink-500/50 transition-colors"
                    />
                    <button 
                      onClick={handleAnalyzeProfile}
                      disabled={isAnalyzingProfile || !profileLink.trim()}
                      className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isAnalyzingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                      Profilni tahlil qilish
                    </button>
                  </div>
                </div>
              </section>

              {/* Patterns List */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    O'rganilgan patternlar
                    <span className="text-sm font-normal bg-white/10 px-2 py-0.5 rounded-full text-white/60">{patterns.length}</span>
                  </h3>
                </div>

                {patterns.length === 0 ? (
                  <div className="py-20 text-center border border-white/5 rounded-3xl bg-white/[0.02]">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Instagram className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-white/40">Hali hech qanday pattern o'rganilmadi.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patterns.map((pattern) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={pattern.id}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 relative group overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-lg leading-tight">{pattern.title || (pattern as any).name || 'Nomsiz pattern'}</h4>
                          <button 
                            onClick={() => removePattern(pattern.id)}
                            className="text-white/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-white/40 uppercase text-[10px] font-bold tracking-widest mb-1">Hook</p>
                            <p className="text-orange-400 font-medium italic">"{pattern.hook || (pattern as any).structure?.hook || 'Noma\'lum hook'}"</p>
                          </div>
                          <div>
                            <p className="text-white/40 uppercase text-[10px] font-bold tracking-widest mb-1">Struktura</p>
                            <p className="">{typeof pattern.structure === 'string' ? pattern.structure : (pattern as any).structure?.body || 'Noma\'lum struktura'}</p>
                          </div>

                          {(pattern.format || pattern.audioStrategy || pattern.cta) && (
                            <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-3">
                              {pattern.format && (
                                <div>
                                  <p className="text-white/40 uppercase text-[10px] font-bold tracking-widest mb-1">Format</p>
                                  <p className="text-white/80 text-xs">{pattern.format}</p>
                                </div>
                              )}
                              {pattern.audioStrategy && (
                                <div>
                                  <p className="text-white/40 uppercase text-[10px] font-bold tracking-widest mb-1">Audio</p>
                                  <p className="text-white/80 text-xs">{pattern.audioStrategy}</p>
                                </div>
                              )}
                              {pattern.cta && (
                                <div className="col-span-2">
                                  <p className="text-white/40 uppercase text-[10px] font-bold tracking-widest mb-1">Call to Action</p>
                                  <p className="text-white/80 text-xs">{pattern.cta}</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {pattern.metrics && (
                            <div className="pt-2 border-t border-white/10">
                              <p className="text-white/40 uppercase text-[10px] font-bold tracking-widest mb-2">Statistika</p>
                              <div className="grid grid-cols-3 gap-2">
                                {pattern.metrics.views && (
                                  <div className="flex items-center gap-1.5 text-white/60 text-xs">
                                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                                    <span>{pattern.metrics.views}</span>
                                  </div>
                                )}
                                {pattern.metrics.likes && (
                                  <div className="flex items-center gap-1.5 text-white/60 text-xs">
                                    <Heart className="w-3.5 h-3.5 text-pink-400" />
                                    <span>{pattern.metrics.likes}</span>
                                  </div>
                                )}
                                {pattern.metrics.comments && (
                                  <div className="flex items-center gap-1.5 text-white/60 text-xs">
                                    <MessageCircle className="w-3.5 h-3.5 text-green-400" />
                                    <span>{pattern.metrics.comments}</span>
                                  </div>
                                )}
                                {pattern.metrics.shares && (
                                  <div className="flex items-center gap-1.5 text-white/60 text-xs">
                                    <Share2 className="w-3.5 h-3.5 text-purple-400" />
                                    <span>{pattern.metrics.shares}</span>
                                  </div>
                                )}
                                {pattern.metrics.saves && (
                                  <div className="flex items-center gap-1.5 text-white/60 text-xs">
                                    <Bookmark className="w-3.5 h-3.5 text-yellow-400" />
                                    <span>{pattern.metrics.saves}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {pattern.whyItWorked && (
                            <div className="pt-2 border-t border-white/10">
                              <p className="text-white/40 uppercase text-[10px] font-bold tracking-widest mb-1">Nega topga chiqqan?</p>
                              <p className="text-white/80 text-xs leading-relaxed">{pattern.whyItWorked}</p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                            {(pattern.keyTakeaways || []).slice(0, 3).map((t, i) => (
                              <span key={i} className="bg-white/5 border border-white/10 px-2 py-1 rounded-md text-[10px] text-white/60">
                                {t}
                              </span>
                            ))}
                          </div>

                          {pattern.videoUrl && pattern.videoUrl.match(/\/(reel|p|tv|shorts|watch|video)\/|\.be\//) && (
                            <div className="pt-2 border-t border-white/10">
                              <a 
                                href={pattern.videoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Videoni ko'rish
                              </a>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            </motion.div>
          ) : activeTab === 'create' ? (
            <motion.div 
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-12 gap-12"
            >
              <div className="md:col-span-5 space-y-8">
                <section className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">Ssenariy yaratish</h2>
                  <p className="text-white/60">Kompaniyangiz va mahsulotingiz haqida ma'lumot bering.</p>
                </section>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/40 uppercase tracking-widest">Kompaniya Profili</label>
                    <textarea 
                      value={companyProfile}
                      onChange={(e) => setCompanyProfile(e.target.value)}
                      placeholder="Kompaniya nomi, qadriyatlari va maqsadli auditoriyasi..."
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/40 uppercase tracking-widest">Mahsulot Ma'lumotlari</label>
                    <textarea 
                      value={productInfo}
                      onChange={(e) => setProductInfo(e.target.value)}
                      placeholder="Mahsulot nomi, asosiy foydasi va narxi..."
                      className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/40 uppercase tracking-widest">Mahsulot Rasmi (Ixtiyoriy)</label>
                    <div 
                      onClick={() => productImageRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${productImage ? 'border-orange-500 bg-orange-500/5' : 'border-white/10 hover:border-white/20'}`}
                    >
                      {productImage ? (
                        <div className="flex items-center gap-2 text-orange-500">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm font-medium">Rasm yuklandi</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductImage(null);
                            }}
                            className="ml-2 text-white/40 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-white/40" />
                          <span className="text-xs text-white/40">Ma'lumot kam bo'lsa rasm yuklang</span>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={productImageRef} 
                      onChange={handleProductImageUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleGenerate}
                      disabled={isGenerating || patterns.length === 0 || !companyProfile || !productInfo}
                      className="w-full py-5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-orange-500/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                    >
                      {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                      Barcha patternlar bo'yicha ssenariy yaratish
                    </button>

                    <button 
                      onClick={handleGenerateHooks}
                      disabled={isGeneratingHooks || !productInfo}
                      className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 active:scale-[0.98]"
                    >
                      {isGeneratingHooks ? <Loader2 className="w-5 h-5 animate-spin" /> : <Magnet className="w-5 h-5 text-orange-400" />}
                      Faqat ilgaklar (Hooks) yaratish
                    </button>
                  </div>

                  {patterns.length === 0 && (
                    <p className="text-xs text-red-400 text-center">
                      Ssenariy yaratish uchun avval kamida bitta viral pattern o'rganishingiz kerak!
                    </p>
                  )}
                </div>
              </div>

              <div className="md:col-span-7">
                <div className="bg-white/5 border border-white/10 rounded-[32px] h-full min-h-[600px] flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      <span className="text-sm font-bold uppercase tracking-widest text-white/60">Natija</span>
                    </div>
                    {generatedScript && (
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedScript);
                          alert("Nusxa olindi!");
                        }}
                        className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                      >
                        Nusxa olish
                      </button>
                    )}
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto prose prose-invert prose-orange max-w-none">
                    {isGenerating || isGeneratingHooks ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 text-white/40">
                        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
                        <p className="animate-pulse">AI ishlamoqda...</p>
                      </div>
                    ) : generatedScript ? (
                      <div className="prose prose-invert prose-orange max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {generatedScript}
                        </ReactMarkdown>
                      </div>
                    ) : hooksResult ? (
                      <div className="prose prose-invert prose-orange max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {hooksResult}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 text-white/20 text-center">
                        <Sparkles className="w-16 h-16 mb-2" />
                        <p className="max-w-xs">Chap tarafdagi ma'lumotlarni to'ldiring va "Ssenariy yaratish" yoki "Ilgaklar yaratish" tugmasini bosing.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'competitors' ? (
            <motion.div 
              key="competitors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-12 gap-12"
            >
              <div className="md:col-span-5 space-y-8">
                <section className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">Raqobatchilar Tahlili</h2>
                  <p className="text-white/60">Raqobatchilaringizni o'rganing va ulardan ajralib turish strategiyasini tuzing.</p>
                </section>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/40 uppercase tracking-widest">Raqobatchilar Nomlari</label>
                    <textarea 
                      value={competitorNames}
                      onChange={(e) => setCompetitorNames(e.target.value)}
                      placeholder="Masalan: Artel, Samsung, LG (Instagram profillari yoki nomlari)..."
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/40 uppercase tracking-widest">Instagram Havolasi (Ixtiyoriy)</label>
                    <input 
                      type="text"
                      value={competitorInstagramLink}
                      onChange={(e) => setCompetitorInstagramLink(e.target.value)}
                      placeholder="https://instagram.com/raqobatchi"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-3">
                    <Target className="w-5 h-5 text-blue-400 shrink-0" />
                    <p className="text-xs text-blue-200/70 leading-relaxed">
                      AI Google Search orqali raqobatchilaringizning so'nggi trendlarini va mijozlar fikrlarini tahlil qiladi.
                    </p>
                  </div>

                  {!productInfo && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3">
                      <p className="text-xs text-red-400 leading-relaxed">
                        ⚠️ Tahlil qilish uchun avval "Kompaniya va Mahsulot" bo'limida o'z mahsulotingiz haqida ma'lumot kiritishingiz kerak.
                      </p>
                    </div>
                  )}

                  <button 
                    onClick={handleAnalyzeCompetitors}
                    disabled={isAnalyzingCompetitors || !competitorNames || !productInfo}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-500 transition-all disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isAnalyzingCompetitors ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                    Raqobatchilarni tahlil qilish
                  </button>
                </div>

                {competitorAnalyses.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">Tarix (Bilimlar bazasi)</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {competitorAnalyses.map((analysis) => (
                        <button
                          key={analysis.id}
                          onClick={() => setCompetitorAnalysis(analysis.analysis)}
                          className="w-full text-left p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-blue-400">{analysis.date}</span>
                            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                          </div>
                          <p className="text-sm font-medium text-white/80 line-clamp-1">{analysis.competitorNames}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-7">
                <div className="bg-white/5 border border-white/10 rounded-[32px] h-full min-h-[600px] flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-bold uppercase tracking-widest text-white/60">Strategik Tahlil</span>
                    </div>
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto prose prose-invert prose-blue max-w-none">
                    {isAnalyzingCompetitors ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 text-white/40">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                        <p className="animate-pulse">Raqobatchilar o'rganilmoqda...</p>
                      </div>
                    ) : competitorAnalysis ? (
                      <div className="prose prose-invert prose-blue max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {competitorAnalysis}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 text-white/20 text-center">
                        <Search className="w-16 h-16 mb-2" />
                        <p className="max-w-xs">Raqobatchilar nomini kiriting va tahlilni boshlang.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'trends' ? (
            <motion.div 
              key="trends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-12 gap-12"
            >
              <div className="md:col-span-5 space-y-8">
                <section className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">Haqiqiy Trendlar</h2>
                  <p className="text-white/60">Ijtimoiy tarmoqlardagi eng so'nggi trendlarni qidirib toping.</p>
                </section>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/40 uppercase tracking-widest">Soha yoki Mavzu</label>
                    <input 
                      type="text"
                      value={trendsCategory}
                      onChange={(e) => setTrendsCategory(e.target.value)}
                      placeholder="Masalan: Texnologiya, Qurilish, Moda..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                  </div>
                  
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex gap-3">
                    <Zap className="w-5 h-5 text-orange-400 shrink-0" />
                    <p className="text-xs text-orange-200/70 leading-relaxed">
                      AI Google Search orqali hozirgi vaqtda viral bo'layotgan audio va vizual trendlarni tahlil qiladi.
                    </p>
                  </div>

                  <button 
                    onClick={handleFetchTrends}
                    disabled={isFetchingTrends || !trendsCategory}
                    className="w-full py-5 bg-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-orange-500 transition-all disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isFetchingTrends ? <Loader2 className="w-6 h-6 animate-spin" /> : <Instagram className="w-6 h-6" />}
                    Trendlarni qidirish
                  </button>
                </div>
              </div>

              <div className="md:col-span-7">
                <div className="bg-white/5 border border-white/10 rounded-[32px] h-full min-h-[600px] flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-bold uppercase tracking-widest text-white/60">Top Trendlar</span>
                    </div>
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto prose prose-invert prose-orange max-w-none">
                    {isFetchingTrends ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 text-white/40">
                        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
                        <p className="animate-pulse">Trendlar qidirilmoqda...</p>
                      </div>
                    ) : trendsResult ? (
                      <div className="prose prose-invert prose-orange max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {trendsResult}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 text-white/20 text-center">
                        <Instagram className="w-16 h-16 mb-2" />
                        <p className="max-w-xs">Sohani kiriting va trendlarni o'rganing.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'find_competitors' ? (
            <motion.div 
              key="find_competitors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-12 gap-12"
            >
              {/* Input Section */}
              <div className="md:col-span-5 space-y-8">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Globe className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Raqobatchi izlash</h3>
                      <p className="text-sm text-white/40">Yangi raqobatchilarni kashf qiling</p>
                    </div>
                  </div>

                  {!productInfo && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-sm text-orange-200/80">
                      <span className="font-bold text-orange-400">Diqqat:</span> Raqobatchilarni aniq topish uchun avval "Yaratish" bo'limida mahsulot/xizmat haqida ma'lumot kiriting.
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">
                        Mening Instagram profilim
                      </label>
                      <input 
                        type="text"
                        value={myInstagramLink}
                        onChange={(e) => setMyInstagramLink(e.target.value)}
                        placeholder="Masalan: @mening_biznesim yoki link"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleFindCompetitors}
                    disabled={isFindingCompetitors || !myInstagramLink || !productInfo}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg shadow-purple-500/20"
                  >
                    {isFindingCompetitors ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Izlashni boshlash
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Output Section */}
              <div className="md:col-span-7">
                <div className="bg-white/5 border border-white/10 rounded-3xl h-[600px] flex flex-col overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                  
                  <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                      <span className="text-sm font-bold uppercase tracking-widest text-white/60">Natija</span>
                    </div>
                  </div>

                  <div className="flex-1 p-8 overflow-y-auto">
                    {isFindingCompetitors ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 text-white/40">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                        <p className="animate-pulse">Raqobatchilar qidirilmoqda...</p>
                      </div>
                    ) : foundCompetitorsResult ? (
                      <div className="prose prose-invert prose-purple max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {foundCompetitorsResult}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 text-white/20 text-center">
                        <Globe className="w-16 h-16 mb-2" />
                        <p className="max-w-xs">Instagram profilingizni kiriting va O'zbekiston hamda chet eldagi raqobatchilarni toping.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'plan' ? (
            <motion.div 
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-12 gap-12"
            >
              {/* Input Section */}
              <div className="md:col-span-5 space-y-8">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Kontent Reja</h3>
                      <p className="text-sm text-white/40">7 yoki 15 kunlik reja tuzing</p>
                    </div>
                  </div>

                  {!productInfo && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-sm text-orange-200/80">
                      <span className="font-bold text-orange-400">Diqqat:</span> Kontent reja tuzish uchun avval "Yaratish" bo'limida mahsulot/xizmat haqida ma'lumot kiriting.
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">
                        Necha kunlik reja kerak?
                      </label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setPlanDays(7)}
                          className={`flex-1 py-3 rounded-xl border transition-all ${planDays === 7 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-black/50 border-white/10 text-white/60 hover:border-white/20'}`}
                        >
                          7 kunlik
                        </button>
                        <button
                          onClick={() => setPlanDays(15)}
                          className={`flex-1 py-3 rounded-xl border transition-all ${planDays === 15 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-black/50 border-white/10 text-white/60 hover:border-white/20'}`}
                        >
                          15 kunlik
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleGeneratePlan}
                    disabled={isGeneratingPlan || !productInfo}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg shadow-emerald-500/20"
                  >
                    {isGeneratingPlan ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Reja tuzish
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Output Section */}
              <div className="md:col-span-7">
                <div className="bg-white/5 border border-white/10 rounded-3xl h-[600px] flex flex-col overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                  
                  <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-bold uppercase tracking-widest text-white/60">Kontent Reja</span>
                    </div>
                  </div>

                  <div className="flex-1 p-8 overflow-y-auto">
                    {isGeneratingPlan ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 text-white/40">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                        <p className="animate-pulse">Reja tuzilmoqda...</p>
                      </div>
                    ) : contentPlanResult ? (
                      <div className="prose prose-invert prose-emerald max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {contentPlanResult}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 text-white/20 text-center">
                        <Calendar className="w-16 h-16 mb-2" />
                        <p className="max-w-xs">Mahsulotingiz uchun strategik kontent reja yarating.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="strategy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-12 gap-12"
            >
              {/* Input Section */}
              <div className="md:col-span-5 space-y-8">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">SMM Strategiya</h3>
                      <p className="text-sm text-white/40">Sotuvni oshirish va auditoriyani tushunish</p>
                    </div>
                  </div>

                  {!productInfo && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-sm text-orange-200/80">
                      <span className="font-bold text-orange-400">Diqqat:</span> Strategiya tuzish uchun avval "Yaratish" bo'limida mahsulot/xizmat haqida ma'lumot kiriting.
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={handleGeneratePersona}
                      disabled={isGeneratingPersona || !productInfo}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20"
                    >
                      {isGeneratingPersona ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          Xaridor Portretini (Persona) yaratish
                        </>
                      )}
                    </button>

                    <button 
                      onClick={handleGenerateFunnel}
                      disabled={isGeneratingFunnel || !productInfo}
                      className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                      {isGeneratingFunnel ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Filter className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                          Sotuv Voronkasini (Funnel) tuzish
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Output Section */}
              <div className="md:col-span-7">
                <div className="bg-white/5 border border-white/10 rounded-3xl h-[600px] flex flex-col overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                  
                  <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-sm font-bold uppercase tracking-widest text-white/60">Strategiya Natijasi</span>
                    </div>
                  </div>

                  <div className="flex-1 p-8 overflow-y-auto">
                    {isGeneratingPersona || isGeneratingFunnel ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 text-white/40">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                        <p className="animate-pulse">AI strategiya ustida ishlamoqda...</p>
                      </div>
                    ) : personaResult ? (
                      <div className="prose prose-invert prose-blue max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {personaResult}
                        </ReactMarkdown>
                      </div>
                    ) : funnelResult ? (
                      <div className="prose prose-invert prose-blue max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {funnelResult}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 text-white/20 text-center">
                        <Target className="w-16 h-16 mb-2" />
                        <p className="max-w-xs">Auditoriyangizni chuqur tushuning va ularni xaridorga aylantiruvchi strategiya tuzing.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {activeTab === 'copywriting' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#1A1A1A] rounded-3xl p-8 border border-white/5 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <PenTool className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Post Matni (Copywriting)</h2>
                  <p className="text-white/60">Sotuvchi va jalb qiluvchi post matnlarini yarating</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Mahsulot/Xizmat haqida ma'lumot</label>
                  <textarea
                    value={productInfo}
                    onChange={(e) => setProductInfo(e.target.value)}
                    placeholder="Masalan: Bizning kompaniya IT kurslari sotadi. Asosiy ustunligimiz - amaliyot va ishga joylashishda yordam."
                    className="w-full h-32 bg-black/50 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Post mavzusi</label>
                  <input
                    type="text"
                    value={postTopic}
                    onChange={(e) => setPostTopic(e.target.value)}
                    placeholder="Masalan: Yangi Python kursiga qabul boshlandi"
                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                  />
                </div>

                <button
                  onClick={handleGeneratePost}
                  disabled={isGeneratingPost || !productInfo || !postTopic}
                  className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGeneratingPost ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Matn yaratilmoqda...
                    </>
                  ) : (
                    <>
                      <PenTool className="w-5 h-5" />
                      Post Matnini Yaratish
                    </>
                  )}
                </button>
              </div>
            </div>

            {postResult && (
              <div className="bg-[#1A1A1A] rounded-3xl p-8 border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Tayyor Post Matni
                  </h3>
                  <button 
                    onClick={() => navigator.clipboard.writeText(postResult)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Nusxa olish"
                  >
                    <Copy className="w-5 h-5 text-white/60 hover:text-white" />
                  </button>
                </div>
                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                  <ReactMarkdown>{postResult}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stories' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#1A1A1A] rounded-3xl p-8 border border-white/5 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Stories Strategiyasi</h2>
                  <p className="text-white/60">5 kunlik interaktiv va sotuvchi Stories rejasi</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Mahsulot/Xizmat haqida ma'lumot</label>
                  <textarea
                    value={productInfo}
                    onChange={(e) => setProductInfo(e.target.value)}
                    placeholder="Masalan: Bizning kompaniya IT kurslari sotadi. Asosiy ustunligimiz - amaliyot va ishga joylashishda yordam."
                    className="w-full h-32 bg-black/50 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all resize-none"
                  />
                </div>

                <button
                  onClick={handleGenerateStories}
                  disabled={isGeneratingStories || !productInfo}
                  className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGeneratingStories ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Strategiya tuzilmoqda...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-5 h-5" />
                      Stories Rejasini Tuzish
                    </>
                  )}
                </button>
              </div>
            </div>

            {storiesResult && (
              <div className="bg-[#1A1A1A] rounded-3xl p-8 border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    5 Kunlik Stories Strategiyasi
                  </h3>
                  <button 
                    onClick={() => navigator.clipboard.writeText(storiesResult)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Nusxa olish"
                  >
                    <Copy className="w-5 h-5 text-white/60 hover:text-white" />
                  </button>
                </div>
                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                  <ReactMarkdown>{storiesResult}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ads' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#1A1A1A] rounded-3xl p-8 border border-white/5 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Targeting & Reklama</h2>
                  <p className="text-white/60">Facebook va Instagram Ads uchun to'liq kampaniya strategiyasi</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Mahsulot/Xizmat haqida ma'lumot</label>
                  <textarea
                    value={productInfo}
                    onChange={(e) => setProductInfo(e.target.value)}
                    placeholder="Masalan: Bizning kompaniya IT kurslari sotadi. Asosiy ustunligimiz - amaliyot va ishga joylashishda yordam."
                    className="w-full h-32 bg-black/50 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                  />
                </div>

                <button
                  onClick={handleGenerateAd}
                  disabled={isGeneratingAd || !productInfo}
                  className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGeneratingAd ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Kampaniya tuzilmoqda...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      Reklama Kampaniyasini Yaratish
                    </>
                  )}
                </button>
              </div>
            </div>

            {adResult && (
              <div className="bg-[#1A1A1A] rounded-3xl p-8 border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Reklama Kampaniyasi Strategiyasi
                  </h3>
                  <button 
                    onClick={() => navigator.clipboard.writeText(adResult)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Nusxa olish"
                  >
                    <Copy className="w-5 h-5 text-white/60 hover:text-white" />
                  </button>
                </div>
                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                  <ReactMarkdown>{adResult}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-40">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-bold">ViralScript AI © 2026</span>
          </div>
          <div className="flex gap-8 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Yo'riqnoma</a>
            <a href="#" className="hover:text-white transition-colors">Maxfiylik</a>
            <a href="#" className="hover:text-white transition-colors">Bog'lanish</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
