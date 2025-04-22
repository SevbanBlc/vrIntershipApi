import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from "./hooks/use-auth";
import { IntroSection } from "./components/IntroSection";
import { UserInfoForm } from "./components/UserInfoForm";
import { PsychologistStory } from "./components/PsychologistStory";
import { QuestionSection } from "./components/QuestionSection";
import { AnalysisSection } from "./components/AnalysisSection";
import { StorySection } from "./components/StorySection";
import { ResultSection } from "./components/ResultSection";
import { Navbar } from "./components/Navbar";
import { questions } from "./questions";
import { Step, Answer, StoryChoice, StoryPart, UserData, Scores, CareerSuggestion } from "./types";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import AuthPage from "./pages/auth-page";
import { Loader2 } from "lucide-react";
import supabase from './supabaseClient';
import { firstDayStoryParts } from './stories/firstDayStory';

function HomePage() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('intro');
  const [userData, setUserData] = useState<UserData>({ name: '', age: 0 });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Scores>({
    communication: 0,
    analysis: 0,
    teamwork: 0,
    creativity: 0,
    technical: 0
  });
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [currentStoryPart, setCurrentStoryPart] = useState<number>(0);
  const [storySuccess, setStorySuccess] = useState<boolean>(true);
  const [careerSuggestions, setCareerSuggestions] = useState<CareerSuggestion[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

          if (!progressError && progressData && progressData.length > 0) {
            const latestProgress = progressData[0];
            setScores(latestProgress.scores);
            setSelectedCareer(latestProgress.selected_career);
            setCurrentStoryPart(latestProgress.current_story_part || 0);
            if (latestProgress.current_step) {
              setStep(latestProgress.current_step as Step);
            }
          }

          setUserData({
            name: user.name || '',
            age: user.age || 0
          });
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [user]);

  const generateCareerSuggestions = (scores: Scores): CareerSuggestion[] => {
    const suggestions: CareerSuggestion[] = [];
    
    // Calculate base scores using weighted averages
    const calculateBaseScore = (weights: Record<string, number>) => {
      let totalWeight = 0;
      let weightedSum = 0;
      
      Object.entries(weights).forEach(([skill, weight]) => {
        if (scores[skill] !== undefined) {
          weightedSum += scores[skill] * weight;
          totalWeight += weight;
        }
      });
      
      return (weightedSum / totalWeight) * 2; // Multiply by 2 to get a higher base score
    };

    // Frontend Developer
    const frontendScore = calculateBaseScore({
      creativity: 0.35,
      technical: 0.25,
      communication: 0.2,
      teamwork: 0.2
    });

    // Backend Developer
    const backendScore = calculateBaseScore({
      technical: 0.4,
      analysis: 0.3,
      teamwork: 0.2,
      communication: 0.1
    });

    // Security Specialist
    const securityScore = calculateBaseScore({
      analysis: 0.4,
      technical: 0.35,
      teamwork: 0.15,
      communication: 0.1
    });

    // DevOps Engineer
    const devopsScore = calculateBaseScore({
      technical: 0.35,
      analysis: 0.3,
      teamwork: 0.2,
      communication: 0.15
    });

    // Data Scientist
    const dataScore = calculateBaseScore({
      analysis: 0.45,
      technical: 0.25,
      creativity: 0.2,
      communication: 0.1
    });

    // Add normalized scores to ensure they're more distinct
    const addCareer = (score: number, career: CareerSuggestion) => {
      // Normalize score to be between 45 and 95
      const normalizedScore = Math.min(95, Math.max(45, Math.round(score)));
      suggestions.push({
        ...career,
        matchPercentage: normalizedScore
      });
    };

    // Only add careers if they meet minimum threshold
    if (frontendScore > 30) {
      addCareer(frontendScore, {
        title: "Frontend Geliştirici",
        description: "Kullanıcı arayüzleri ve etkileşimleri tasarlayıp geliştiren, web sitelerinin görsel ve kullanıcı deneyimi kısmında uzmanlaşan teknoloji uzmanı.",
        matchPercentage: 0, // Will be set by addCareer
        requiredSkills: ["HTML/CSS", "JavaScript", "React", "UI/UX Tasarım", "Responsive Tasarım"],
        growthAreas: ["Backend Entegrasyonu", "Performans Optimizasyonu", "Erişilebilirlik"]
      });
    }

    if (backendScore > 30) {
      addCareer(backendScore, {
        title: "Backend Geliştirici",
        description: "Web uygulamalarının sunucu tarafı mantığını, veritabanı etkileşimlerini ve API'lerini geliştiren, sistemlerin arka planında çalışan teknoloji uzmanı.",
        matchPercentage: 0,
        requiredSkills: ["Node.js", "Veritabanları", "API Tasarımı", "Sunucu Yönetimi", "Güvenlik"],
        growthAreas: ["Ölçeklendirme", "Mikroservisler", "Cloud Platformları"]
      });
    }

    if (securityScore > 30) {
      addCareer(securityScore, {
        title: "Güvenlik Uzmanı",
        description: "Sistemlerin ve uygulamaların güvenliğini sağlayan, güvenlik açıklarını tespit eden ve önleyen uzman.",
        matchPercentage: 0,
        requiredSkills: ["Ağ Güvenliği", "Penetrasyon Testi", "Güvenlik Araçları", "Risk Analizi"],
        growthAreas: ["Cloud Güvenliği", "Zararlı Yazılım Analizi", "Güvenlik Otomasyonu"]
      });
    }

    if (devopsScore > 30) {
      addCareer(devopsScore, {
        title: "DevOps Mühendisi",
        description: "Yazılım geliştirme ve operasyon süreçlerini otomatikleştiren, sürekli entegrasyon ve dağıtım pipeline'ları kuran uzman.",
        matchPercentage: 0,
        requiredSkills: ["Linux", "Docker", "CI/CD", "Cloud Platformları", "Otomasyon"],
        growthAreas: ["Kubernetes", "Güvenlik Otomasyonu", "SRE Pratikleri"]
      });
    }

    if (dataScore > 30) {
      addCareer(dataScore, {
        title: "Veri Bilimci",
        description: "Büyük veri setlerini analiz eden, makine öğrenimi modelleri geliştiren ve veri tabanlı içgörüler sunan uzman.",
        matchPercentage: 0,
        requiredSkills: ["Python", "Makine Öğrenimi", "İstatistik", "Veri Analizi", "SQL"],
        growthAreas: ["Derin Öğrenme", "Büyük Veri Teknolojileri", "Veri Görselleştirme"]
      });
    }

    // Ensure scores are more distinct by adjusting them relative to each other
    return suggestions
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 3)
      .map((suggestion, index) => ({
        ...suggestion,
        matchPercentage: Math.max(45, suggestion.matchPercentage - (index * 15)) // Create bigger gaps between scores
      }));
  };

  const handleStart = () => {
    setStep('name');
  };

  const handleUpdateUserData = (newData: UserData) => {
    setUserData(newData);
  };

  const handleAnswerSelect = async (answer: Answer) => {
    const newScores = { ...scores };
    
    Object.keys(answer.score).forEach(key => {
      if (newScores[key] !== undefined) {
        newScores[key] += answer.score[key];
      } else {
        newScores[key] = answer.score[key];
      }
    });
    
    setScores(newScores);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const suggestions = generateCareerSuggestions(newScores);
      setCareerSuggestions(suggestions);
      setStep('analysis');

      if (user) {
        try {
          await supabase
            .from('user_progress')
            .upsert({
              user_id: user.id,
              scores: newScores,
              current_step: 'analysis',
              career_suggestions: suggestions.map(s => s.title)
            });
        } catch (error) {
          console.error('Error saving progress:', error);
        }
      }
    }
  };

  const handleCareerSelect = async (career: string) => {
    setSelectedCareer(career);
    setStep('story');

    if (user) {
      try {
        await supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            selected_career: career,
            current_step: 'story',
            current_story_part: 0
          });
      } catch (error) {
        console.error('Error saving career selection:', error);
      }
    }
  };

  const handleStoryChoice = async (choice: StoryChoice) => {
    if (choice.score) {
      const newScores = { ...scores };
      
      if (choice.score.analysis) {
        newScores.analysis += choice.score.analysis;
      }
      
      if (choice.score.communication) {
        newScores.communication += choice.score.communication;
      }
      
      setScores(newScores);

      if (user) {
        try {
          await supabase
            .from('user_progress')
            .upsert({
              user_id: user.id,
              scores: newScores,
              current_story_part: currentStoryPart + 1,
              current_step: 'story' // Ensure current_step is set
            });
        } catch (error) {
          console.error('Error saving story progress:', error);
        }
      }
    }
    
    if (currentStoryPart < firstDayStoryParts.length - 1) {
      setCurrentStoryPart(prev => prev + 1);
    } else {
      const successThreshold = 10;
      const totalScore = scores.analysis + scores.communication;
      
      setStorySuccess(totalScore >= successThreshold);
      setStep('results');
    }
  };

  const handleRestart = async () => {
    setStep('intro');
    setCurrentQuestion(0);
    setScores({
      communication: 0,
      analysis: 0,
      teamwork: 0,
      creativity: 0,
      technical: 0
    });
    setSelectedCareer(null);
    setCurrentStoryPart(0);
    setUserData({ name: '', age: 0 });

    if (user) {
      try {
        await supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            current_step: 'intro', // Ensure current_step is set to a non-null value
            scores: {
              communication: 0,
              analysis: 0,
              teamwork: 0,
              creativity: 0,
              technical: 0
            },
            career_suggestions: [],
            selected_career: null,
            current_story_part: 0
          });
      } catch (error) {
        console.error('Error resetting progress:', error);
      }
    }
  };

  const analysisText = [
    `Merhaba ${userData.name}, kişilik testinin sonuçlarını analiz ettim.`,
    `İletişim becerilerin ${scores.communication > 40 ? 'oldukça yüksek' : scores.communication > 25 ? 'ortalama' : 'geliştirilebilir'} görünüyor.`,
    `Analitik düşünme yeteneğin ${scores.analysis > 40 ? 'çok iyi' : scores.analysis > 25 ? 'ortalama' : 'geliştirilebilir'} seviyede.`,
    `Takım çalışması becerilerin ${scores.teamwork > 40 ? 'mükemmel' : scores.teamwork > 25 ? 'iyi' : 'daha fazla geliştirilmeli'}.`,
    `Yenilikçi skorun ${scores.creativity > 40 ? 'üst düzeyde' : scores.creativity > 25 ? 'ortalama' : 'geliştirilebilir'}.`,
    `Teknik beceri seviyeni ${scores.technical > 40 ? 'çok yüksek' : scores.technical > 25 ? 'ortalama' : 'biraz geliştirmen gerekiyor'} olarak tespit ettim.`,
    `Skorların ve profilin doğrultusunda sana en uygun teknoloji kariyerlerini belirledim. Aşağıda bu kariyer yollarını ve sana uyum yüzdelerini görebilirsin.`
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4">
        <motion.div 
          className="bg-white rounded-xl shadow-xl overflow-hidden max-w-3xl w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { 
              type: "spring", 
              damping: 25, 
              stiffness: 120 
            }
          }}
        >
          <AnimatePresence mode="wait">
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ 
                  opacity: 0, 
                  x: -20, 
                  transition: { duration: 0.3 } 
                }}
              >
                <IntroSection onStart={handleStart} />
              </motion.div>
            )}
            
            {(step === 'name' || step === 'age') && (
              <motion.div
                key={`user-form-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { 
                    type: "spring", 
                    damping: 25, 
                    stiffness: 120 
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  x: -20, 
                  transition: { duration: 0.3 } 
                }}
              >
                <UserInfoForm
                  userData={userData}
                  onUpdateUserData={handleUpdateUserData}
                  onSubmit={() => setStep(step === 'name' ? 'age' : 'psychologist')}
                  step={step}
                />
              </motion.div>
            )}

            {step === 'psychologist' && (
              <motion.div
                key="psychologist"
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { 
                    type: "spring", 
                    damping: 25, 
                    stiffness: 120 
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  x: -20, 
                  transition: { duration: 0.3 } 
                }}
              >
                <PsychologistStory
                  userData={userData}
                  onContinue={() => setStep('questions')}
                />
              </motion.div>
            )}
            
            {step === 'questions' && (
              <motion.div
                key={`question-${currentQuestion}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { 
                    type: "spring", 
                    damping: 25, 
                    stiffness: 120 
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  x: -20, 
                  transition: { duration: 0.3 } 
                }}
              >
                <QuestionSection
                  currentQuestion={currentQuestion}
                  totalQuestions={questions.length}
                  question={questions[currentQuestion]}
                  onAnswerSelect={handleAnswerSelect}
                />
              </motion.div>
            )}
            
            {step === 'analysis' && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { 
                    type: "spring", 
                    damping: 25, 
                    stiffness: 120 
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  x: -20, 
                  transition: { duration: 0.3 } 
                }}
              >
                <AnalysisSection
                  analysisText={analysisText}
                  currentStep={0}
                  careerSuggestions={careerSuggestions}
                  onCareerSelect={handleCareerSelect}
                />
              </motion.div>
            )}
            
            {step === 'story' && firstDayStoryParts[currentStoryPart] && (
              <motion.div
                key={`story-${currentStoryPart}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { 
                    type: "spring", 
                    damping: 25, 
                    stiffness: 120 
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  x: -20, 
                  transition: { duration: 0.3 } 
                }}
              >
                <StorySection
                  storyPart={firstDayStoryParts[currentStoryPart]}
                  onChoice={handleStoryChoice}
                />
              </motion.div>
            )}
            
            {step === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { 
                    type: "spring", 
                    damping: 25, 
                    stiffness: 120 
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  x: -20, 
                  transition: { duration: 0.3 } 
                }}
              >
                <ResultSection
                  success={storySuccess}
                  onRestart={handleRestart}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user && location !== '/auth') {
      navigate('/auth');
    }
  }, [user, isLoading, location, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;