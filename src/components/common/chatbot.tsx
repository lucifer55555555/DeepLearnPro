'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, MessageSquare, Send, Loader2, Sparkles, BookOpen, ClipboardList, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { learningTopics } from '@/lib/data';
import { aiChatbotAssistance, AIChatbotAssistanceInput } from '@/ai/flows/ai-chatbot-assistance';
import { cn } from '@/lib/utils';
import { progressStorage } from '@/lib/progress';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatMode = 'explain' | 'study-plan' | 'test-me' | 'general';

const learningMaterial = learningTopics.map(topic => `Topic: ${topic.title}\nContent:\n${topic.content}`).join('\n\n---\n\n');

const quickActions = [
  { label: 'Explain a concept', icon: BookOpen, mode: 'explain' as ChatMode, prompt: 'Explain how Convolutional Neural Networks (CNNs) work in simple terms' },
  { label: '30-day study plan', icon: ClipboardList, mode: 'study-plan' as ChatMode, prompt: 'Create a 30-day deep learning study plan for me' },
  { label: 'Test my knowledge', icon: BrainCircuit, mode: 'test-me' as ChatMode, prompt: 'Test my knowledge on neural networks and deep learning' },
];

function formatMarkdown(text: string) {
  // Simple markdown → HTML for chat bubbles
  let html = text
    // Headers
    .replace(/^### (.+)$/gm, '<h4 class="font-bold text-sm mt-3 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-bold text-base mt-3 mb-1">$1</h3>')
    .replace(/^# (.+)$/gm, '<h3 class="font-bold text-lg mt-3 mb-1">$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-background/50 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-background/50 p-2 rounded-md my-2 overflow-x-auto text-xs font-mono"><code>$2</code></pre>')
    // Checkboxes
    .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-center gap-2 my-0.5"><span class="w-3.5 h-3.5 border border-current rounded-sm inline-block flex-shrink-0"></span><span>$1</span></div>')
    .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-center gap-2 my-0.5"><span class="w-3.5 h-3.5 bg-primary border border-primary rounded-sm inline-block flex-shrink-0 text-primary-foreground text-center text-xs leading-[0.85rem]">✓</span><span>$1</span></div>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<div class="flex gap-2 my-0.5"><span class="text-primary mt-1">•</span><span>$1</span></div>')
    // Ordered lists
    .replace(/^(\d+)\. (.+)$/gm, '<div class="flex gap-2 my-0.5"><span class="text-primary font-bold min-w-[1.25rem]">$1.</span><span>$2</span></div>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p class="mt-2">')
    // Single newlines
    .replace(/\n/g, '<br/>');

  return `<p>${html}</p>`;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your **AI Learning Mentor**. I can:\n\n- 📖 **Explain concepts** simply\n- 📅 **Create study plans** for you\n- 🧪 **Test your knowledge** with quizzes\n\nTry one of the quick actions below, or ask me anything!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<ChatMode>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const getProgressSummary = (): string => {
    const progress = progressStorage.get();
    const parts: string[] = [];
    if (progress.completedCourseIds.length > 0)
      parts.push(`Completed courses: ${progress.completedCourseIds.join(', ')}`);
    if (progress.completedQuizIds.length > 0)
      parts.push(`Completed quizzes: ${progress.completedQuizIds.join(', ')}`);
    if (progress.solvedProjectIds.length > 0)
      parts.push(`Solved projects: ${progress.solvedProjectIds.join(', ')}`);
    if (Object.keys(progress.quizScores).length > 0) {
      const scores = Object.entries(progress.quizScores)
        .map(([quiz, score]) => `${quiz}: ${score}%`)
        .join(', ');
      parts.push(`Quiz scores: ${scores}`);
    }
    return parts.length > 0 ? parts.join('. ') : 'New learner, no progress yet.';
  };

  const handleSend = async (text: string, mode: ChatMode = currentMode) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCurrentMode(mode);

    try {
      const aiInput: AIChatbotAssistanceInput = {
        question: text,
        learningMaterial: learningMaterial,
        mode: mode,
        userProgress: getProgressSummary(),
      };
      const response = await aiChatbotAssistance(aiInput);
      const assistantMessage: Message = { role: 'assistant', content: response.answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      const errorText = error.message || 'Unknown error';
      const errorMessage: Message = { role: 'assistant', content: `⚠️ **Error:** ${errorText}\n\nPlease check your Vercel logs for more details.` };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSend(input);
  };

  const handleQuickAction = async (action: typeof quickActions[0]) => {
    await handleSend(action.prompt, action.mode);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-primary shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/50 hover:scale-110 transition-all duration-300 focus-visible:ring-primary"
        aria-label="Open AI Mentor"
      >
        <Sparkles className="h-7 w-7 text-primary-foreground" />
      </Button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col w-full sm:max-w-lg">
          <SheetHeader className="px-4 pt-4">
            <SheetTitle className="font-headline flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              AI Learning Mentor
            </SheetTitle>
            <SheetDescription>
              Your personal deep learning coach — powered by Gemini AI
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 px-4">
            <div className="flex flex-col gap-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 border border-primary/50 flex-shrink-0">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl p-3 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-card border border-border rounded-bl-md'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <div
                        className="prose prose-sm prose-invert max-w-none [&_pre]:my-1 [&_h3]:text-foreground [&_h4]:text-foreground [&_strong]:text-foreground"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className='border-border'>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                  <Avatar className="h-8 w-8 border border-primary/50 flex-shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-card border border-border rounded-xl rounded-bl-md p-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick action chips */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs font-medium text-primary hover:bg-primary/10 hover:border-primary/50 transition-colors"
                >
                  <action.icon className="h-3.5 w-3.5" />
                  {action.label}
                </button>
              ))}
            </div>
          )}

          <SheetFooter className="px-4 pb-4">
            <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about ML/DL..."
                disabled={isLoading}
                autoComplete="off"
                className="rounded-full"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="rounded-full flex-shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
