"use client";

import React, { useState, useEffect, useRef } from 'react';
import {useRouter} from 'next/navigation';
import { 
  Search,
  Lightbulb, 
  Calendar, 
  FileText, 
  Gift, 
  FileCheck, 
  Plus,
  Music,
  Users,
  MapPin,
  Smile,
  Image,
  Bot,
  Film,
  EyeOff,
  X,
  Heart,
  Send,
  Paperclip,
  Clock,
  Cake,
  Video,
  Camera,
  MessageCircle,
  Calendar as CalendarIcon,
  Sparkles,
  Upload,
  Loader2,
  ThumbsUp,
  Reply,
  MoreHorizontal
} from 'lucide-react';
import { useGetUsers } from '@/hooks/useGetUsers';
import { useAuth } from "@/hooks/useAuth";
import { cn } from '@/lib/utils';

// ===== TIPOS =====
interface User {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  phone: string | null;
  department: string | null;
  area: string | null;
  position: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  signature: string | null;
  manager: string | null;
  status: string;
  birth_day: string | null;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarUrl?: string | null;
}

interface Birthday {
  id: string;
  name: string;
  day: string;
  isWeekend?: boolean;
  employee?: Employee;
}

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  authorId?: string;
  content: string;
  timestamp: string;
  likes: number;
  liked: boolean;
  replies?: Comment[];
}

interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  authorRole: string;
  authorId?: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  commentsList?: Comment[];
}

// ===== DATOS DE EJEMPLO (SOLO PARA PUBLICACIONES Y SLIDER) =====
const sliderImages = [
  'https://picsum.photos/seed/central1/800/500',
  'https://picsum.photos/seed/central2/800/500',
  'https://picsum.photos/seed/central3/800/500',
  'https://picsum.photos/seed/central4/800/500',
  'https://picsum.photos/seed/central5/800/500',
];

const initialPosts: Post[] = [
  {
    id: '1',
    author: 'María González',
    authorAvatar: 'MG',
    authorRole: 'Gerente de Marketing',
    content: 'Gran noticia! Hemos alcanzado el 150% de nuestras metas de ventas este mes. Gracias a todo el equipo por su increíble trabajo!',
    image: 'https://picsum.photos/seed/1/800/400',
    timestamp: 'Hace 2 horas',
    likes: 45,
    comments: 12,
    shares: 8,
    liked: false,
    commentsList: [
      {
        id: 'c1',
        author: 'Carlos Rodríguez',
        authorAvatar: 'CR',
        content: '¡Excelente noticia! Gran trabajo en equipo.',
        timestamp: 'Hace 1 hora',
        likes: 5,
        liked: false,
        replies: [
          {
            id: 'r1',
            author: 'María González',
            authorAvatar: 'MG',
            content: '¡Gracias Carlos! El esfuerzo de todos fue clave.',
            timestamp: 'Hace 30 min',
            likes: 2,
            liked: false,
          }
        ]
      },
      {
        id: 'c2',
        author: 'Ana Martínez',
        authorAvatar: 'AM',
        content: 'Increíble logro, felicidades a todo el equipo.',
        timestamp: 'Hace 45 min',
        likes: 3,
        liked: true,
      }
    ]
  },
  {
    id: '2',
    author: 'Carlos Rodríguez',
    authorAvatar: 'CR',
    authorRole: 'Desarrollador Senior',
    content: 'Nuevo lanzamiento de nuestra plataforma! Hoy estamos presentando la versión 3.0 con todas las mejoras que han solicitado. Pruébenla y déjennos sus comentarios!',
    image: 'https://picsum.photos/seed/2/800/400',
    timestamp: 'Hace 4 horas',
    likes: 32,
    comments: 18,
    shares: 15,
    liked: true,
    commentsList: [
      {
        id: 'c3',
        author: 'Pedro Ramírez',
        authorAvatar: 'PR',
        content: 'Excelente trabajo! La nueva interfaz es mucho más intuitiva.',
        timestamp: 'Hace 3 horas',
        likes: 7,
        liked: false,
      }
    ]
  },
  {
    id: '3',
    author: 'Ana Martínez',
    authorAvatar: 'AM',
    authorRole: 'Diseñadora UX/UI',
    content: 'Hoy comparto el nuevo diseño de nuestra interfaz. Me encantaría conocer sus opiniones! Hemos trabajado en mejorar la experiencia de usuario y la accesibilidad.',
    image: 'https://picsum.photos/seed/3/800/400',
    timestamp: 'Hace 6 horas',
    likes: 28,
    comments: 9,
    shares: 4,
    liked: false,
    commentsList: []
  },
  {
    id: '4',
    author: 'Pedro Ramírez',
    authorAvatar: 'PR',
    authorRole: 'Analista de Datos',
    content: 'Comparto los resultados del análisis trimestral. Hemos identificado oportunidades clave para mejorar la retención de clientes. Los detalles están en el dashboard.',
    image: 'https://picsum.photos/seed/4/800/400',
    timestamp: 'Hace 8 horas',
    likes: 19,
    comments: 7,
    shares: 3,
    liked: false,
    commentsList: []
  },
  {
    id: '5',
    author: 'Laura Fernández',
    authorAvatar: 'LF',
    authorRole: 'Recursos Humanos',
    content: 'Recordatorio importante: La evaluación de desempeño se acerca. Por favor, asegúrense de completar sus autoevaluaciones antes del 15 de diciembre.',
    timestamp: 'Hace 1 día',
    likes: 56,
    comments: 23,
    shares: 12,
    liked: true,
    commentsList: []
  },
  {
    id: '6',
    author: 'Roberto Méndez',
    authorAvatar: 'RM',
    authorRole: 'Ingeniero de Software',
    content: 'Nueva actualización del sistema de gestión de proyectos. Agregamos nuevas funcionalidades para facilitar el seguimiento de tareas y mejorar la colaboración.',
    image: 'https://picsum.photos/seed/6/800/400',
    timestamp: 'Hace 2 días',
    likes: 34,
    comments: 11,
    shares: 5,
    liked: false,
    commentsList: []
  },
];

// ===== FUNCIÓN PARA OBTENER INICIALES =====
const getInitials = (name: string | null | undefined): string => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return (first + last).toUpperCase();
};

// ===== SCROLLBAR STYLES (reutilizable) =====
const scrollbarStyles = `
  [&::-webkit-scrollbar]:w-1.5
  [&::-webkit-scrollbar]:h-1.5
  [&::-webkit-scrollbar-track]:bg-muted/20
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-muted-foreground/25
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/40
  dark:[&::-webkit-scrollbar-track]:bg-muted/15
  dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30
  dark:[&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/50
  scrollbar-width:thin
  scrollbar-color:hsl(var(--muted-foreground)/0.25) transparent
`;

// ===== COMPONENTE SLIDER =====
const ImageSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => 
      prev === 0 ? sliderImages.length - 1 : prev - 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => 
      prev === sliderImages.length - 1 ? 0 : prev + 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <div className="relative w-full h-[280px] bg-muted rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {sliderImages.map((image, index) => (
          <div key={index} className="min-w-full h-full flex-shrink-0">
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handlePrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all hover:scale-110 backdrop-blur-sm"
        aria-label="Imagen anterior"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all hover:scale-110 backdrop-blur-sm"
        aria-label="Siguiente imagen"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-white w-6' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// ===== COMPONENTE AVATAR PARA CUMPLEAÑOS =====
const BirthdayAvatar: React.FC<{ employee: Employee; day: string; isWeekend?: boolean }> = ({ 
  employee, 
  day, 
  isWeekend 
}) => {
  const blueGradients = [
    'from-blue-600 to-blue-400',
    'from-blue-500 to-blue-300',
    'from-blue-700 to-blue-500',
    'from-blue-400 to-blue-200',
    'from-blue-600 to-blue-300',
    'from-blue-800 to-blue-500',
  ];
  
  const colorIndex = parseInt(employee.id) % blueGradients.length;
  const gradientClass = blueGradients[colorIndex];

  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors rounded-lg px-2 -mx-2">
      {employee.avatarUrl ? (
        <img 
          src={employee.avatarUrl} 
          alt={employee.name}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-background"
        />
      ) : (
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientClass} text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 ring-2 ring-background`}>
          {employee.initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-medium truncate">{employee.name}</p>
      </div>
      <span
        className={cn(
          "text-xs px-2.5 py-0.5 rounded-full font-semibold flex-shrink-0 transition-colors",
          isWeekend
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground"
        )}
      >
        {day}
      </span>
    </div>
  );
};

// ===== MODAL DE COMENTARIOS =====
interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | null;
  posts: Post[];
  currentUser: User | null;
  onAddComment: (postId: string, content: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
  onAddReply: (postId: string, commentId: string, content: string) => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  postId,
  posts,
  currentUser,
  onAddComment,
  onLikeComment,
  onAddReply
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ commentId: string, author: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  const currentPost = posts.find(p => p.id === postId) || null;

  useEffect(() => {
    if (commentsEndRef.current && currentPost) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPost?.commentsList?.length]);

  if (!isOpen || !currentPost) return null;

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(currentPost.id, newComment);
      setNewComment('');
    }
  };

  const handleSubmitReply = (commentId: string) => {
    if (replyContent.trim()) {
      onAddReply(currentPost.id, commentId, replyContent);
      setReplyContent('');
      setReplyTo(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'comment' | 'reply') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (type === 'comment') {
        handleSubmitComment();
      } else {
        handleSubmitReply(replyTo?.commentId || '');
      }
    }
  };

  const userInitials = currentUser ? getInitials(currentUser.name) : 'U';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col shadow-2xl border border-border/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Comentarios</h2>
            <span className="text-sm text-muted-foreground">({currentPost.comments})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Post original */}
        <div className="p-4 border-b border-border/50 flex-shrink-0 bg-muted/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 ring-2 ring-background">
              {currentPost.authorAvatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{currentPost.author}</h4>
                  <p className="text-xs text-muted-foreground">{currentPost.authorRole}</p>
                </div>
                <span className="text-xs text-muted-foreground">{currentPost.timestamp}</span>
              </div>
              <p className="mt-2 text-sm text-foreground">{currentPost.content}</p>
              {currentPost.image && (
                <div className="mt-2 rounded-lg overflow-hidden">
                  <img
                    src={currentPost.image}
                    alt="Post image"
                    className="w-full h-auto max-h-[200px] object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de comentarios con scroll mejorado */}
        <div className={cn(
          "flex-1 overflow-y-auto p-4 space-y-4",
          scrollbarStyles
        )}>
          {currentPost.commentsList && currentPost.commentsList.length > 0 ? (
            currentPost.commentsList.map((comment) => (
              <div key={comment.id} className="flex gap-3 animate-in fade-in-50 duration-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 ring-2 ring-background">
                  {comment.authorAvatar}
                </div>
                <div className="flex-1">
                  <div className="bg-muted/30 rounded-xl p-3 border border-border/30 hover:border-border/60 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold text-foreground">{comment.author}</span>
                        <span className="text-xs text-muted-foreground ml-2">{comment.timestamp}</span>
                      </div>
                      <button
                        onClick={() => onLikeComment(currentPost.id, comment.id)}
                        className={cn(
                          "flex items-center gap-1 text-xs transition-colors px-2 py-1 rounded-full",
                          comment.liked 
                            ? "text-primary bg-primary/10" 
                            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                        )}
                      >
                        <ThumbsUp className={cn("w-3.5 h-3.5", comment.liked && "fill-primary")} />
                        <span>{comment.likes}</span>
                      </button>
                    </div>
                    <p className="text-sm text-foreground mt-1">{comment.content}</p>
                  </div>
                  
                  <button
                    onClick={() => setReplyTo({ commentId: comment.id, author: comment.author })}
                    className="text-xs text-primary hover:text-primary/80 ml-3 mt-1.5 font-medium transition-colors"
                  >
                    Responder
                  </button>

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-8 mt-3 space-y-3 border-l-2 border-border/30 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3 animate-in fade-in-50 duration-200">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-200 text-white flex items-center justify-center font-bold text-[8px] flex-shrink-0 ring-2 ring-background">
                            {reply.authorAvatar}
                          </div>
                          <div className="flex-1 bg-muted/20 rounded-xl p-2.5 border border-border/20">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs font-semibold text-foreground">{reply.author}</span>
                                <span className="text-[10px] text-muted-foreground ml-2">{reply.timestamp}</span>
                              </div>
                              <button
                                onClick={() => onLikeComment(currentPost.id, reply.id)}
                                className={cn(
                                  "flex items-center gap-1 text-xs transition-colors px-2 py-0.5 rounded-full",
                                  reply.liked 
                                    ? "text-primary bg-primary/10" 
                                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                )}
                              >
                                <ThumbsUp className={cn("w-3 h-3", reply.liked && "fill-primary")} />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                            <p className="text-xs text-foreground mt-0.5">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {replyTo && replyTo.commentId === comment.id && (
                    <div className="ml-8 mt-2 flex items-center gap-2 animate-in slide-in-from-left-5 duration-200">
                      {currentUser?.avatarUrl ? (
                        <img 
                          src={currentUser.avatarUrl} 
                          alt={currentUser.name}
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0 ring-2 ring-background"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 text-white flex items-center justify-center font-bold text-[8px] flex-shrink-0 ring-2 ring-background">
                          {userInitials}
                        </div>
                      )}
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          ref={replyInputRef}
                          type="text"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, 'reply')}
                          placeholder={`Responder a ${replyTo.author}...`}
                          className="flex-1 px-3 py-1.5 text-sm border border-input rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={!replyContent.trim()}
                          className={cn(
                            "p-1.5 rounded-full transition-colors",
                            replyContent.trim()
                              ? "text-primary hover:bg-primary/10"
                              : "text-muted-foreground cursor-not-allowed"
                          )}
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setReplyTo(null);
                            setReplyContent('');
                          }}
                          className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium">No hay comentarios aún</p>
              <p className="text-sm text-muted-foreground mt-1">Sé el primero en comentar</p>
            </div>
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Input de comentario */}
        <div className="p-4 border-t border-border flex-shrink-0 bg-muted/5">
          <div className="flex items-center gap-3">
            {currentUser?.avatarUrl ? (
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-background"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 ring-2 ring-background">
                {userInitials}
              </div>
            )}
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'comment')}
                placeholder="Escribe un comentario..."
                className="flex-1 px-4 py-2.5 text-sm border border-input rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground transition-shadow"
              />
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className={cn(
                  "p-2.5 rounded-full transition-all",
                  newComment.trim()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-sm"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== MODAL PARA CREAR PUBLICACIÓN =====
interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (content: string, image?: string) => void;
  currentUser: User | null;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreatePost,
  currentUser 
}) => {
  const [content, setContent] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (content.trim() || selectedImage) {
      onCreatePost(content, selectedImage || undefined);
      setContent('');
      setSelectedImage(null);
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  const options = [
    { icon: Music, label: 'Música' },
    { icon: Users, label: 'Personas' },
    { icon: MapPin, label: 'Ubicación' }
  ];

  const mediaOptions = [
    { icon: Image, label: 'Galería', action: () => fileInputRef.current?.click() },
    { icon: Bot, label: 'Imágenes de IA' },
    { icon: Film, label: 'GIF' },
    { icon: EyeOff, label: 'No publica' },
  ];

  const userInitials = currentUser ? getInitials(currentUser.name) : 'U';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] shadow-2xl border border-border/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scroll con scrollbar mejorada */}
        <div className={cn(
          "overflow-y-auto max-h-[90vh]",
          scrollbarStyles
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card/95 backdrop-blur-sm z-10">
            <h2 className="text-xl font-semibold text-foreground">Nueva publicación</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Perfil del usuario */}
          <div className="flex items-center gap-3 p-4 border-b border-border/50">
            {currentUser?.avatarUrl ? (
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-background"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 ring-2 ring-background">
                {userInitials}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">{currentUser?.name || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground">{currentUser?.position || currentUser?.role || 'Empleado'}</p>
            </div>
          </div>

          {/* Opciones de publicación */}
          <div className="flex flex-wrap gap-2 p-4 border-b border-border/50">
            {options.map((option) => (
              <button
                key={option.label}
                onClick={() => setSelectedOption(option.label === selectedOption ? null : option.label)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                  selectedOption === option.label
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <option.icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          {/* Área de texto */}
          <div className="p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="¿Qué estás pensando?"
              className="w-full px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none min-h-[120px] bg-background text-foreground placeholder:text-muted-foreground transition-shadow"
              autoFocus
            />
            
            {selectedImage && (
              <div className="relative mt-3 rounded-lg overflow-hidden border border-border">
                <img 
                  src={selectedImage} 
                  alt="Vista previa" 
                  className="w-full h-auto max-h-[300px] object-contain"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 transition-colors backdrop-blur-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Opciones de medios */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {mediaOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={option.action || (() => console.log(`${option.label} clickeado`))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  <option.icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() && !selectedImage}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
                (content.trim() || selectedImage)
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-sm"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
              Publicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== COMPONENTE LOADING =====
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-muted"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">Cargando usuarios...</p>
    </div>
  </div>
);

// ===== COMPONENTE PRINCIPAL =====
export const WallOfPosts: React.FC = () => {
  const { data: usersData, isLoading: isLoadingUsers, error } = useGetUsers();
  const { user: authUser, isLoading: isLoadingAuth } = useAuth();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const router = useRouter();
  
  const currentUser = authUser || usersData?.[0] || null;

  const getBirthdayData = (): Birthday[] => {
    if (!usersData || usersData.length === 0) return [];
    
    const days = ['viernes 03', 'viernes 03', 'jueves 09', 'lunes 13', 'lunes 20', 'jueves 23'];
    const isWeekend = [false, false, false, false, false, true];
    
    return usersData.slice(0, 6).map((user: User, index: number) => ({
      id: user.userId,
      name: user.name,
      day: days[index % days.length],
      isWeekend: isWeekend[index % isWeekend.length],
      employee: {
        id: user.userId,
        name: user.name,
        role: user.position || user.role || 'Empleado',
        initials: getInitials(user.name),
        avatarUrl: user.avatarUrl
      }
    }));
  };

  const birthdayData = getBirthdayData();

  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleCreatePost = (content: string, image?: string) => {
    if (!currentUser) return;
    
    const newPostData: Post = {
      id: Date.now().toString(),
      author: currentUser.name,
      authorAvatar: getInitials(currentUser.name),
      authorRole: currentUser.position || currentUser.role || 'Empleado',
      authorId: currentUser.userId,
      content: content || '📷 Nueva publicación con imagen',
      image: image,
      timestamp: 'Ahora mismo',
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false,
      commentsList: []
    };

    setPosts([newPostData, ...posts]);
  };

  const handleOpenComments = (postId: string) => {
    setSelectedPostId(postId);
    setIsCommentsModalOpen(true);
  };

  const handleAddComment = (postId: string, content: string) => {
    if (!currentUser) return;
    
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const newComment: Comment = {
            id: `c${Date.now()}`,
            author: currentUser.name,
            authorAvatar: getInitials(currentUser.name),
            authorId: currentUser.userId,
            content: content,
            timestamp: 'Ahora mismo',
            likes: 0,
            liked: false,
            replies: []
          };
          
          const updatedCommentsList = [...(post.commentsList || []), newComment];
          
          return {
            ...post,
            commentsList: updatedCommentsList,
            comments: updatedCommentsList.length
          };
        }
        return post;
      })
    );
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const updatedCommentsList = post.commentsList?.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                liked: !comment.liked,
                likes: comment.liked ? comment.likes - 1 : comment.likes + 1
              };
            }
            if (comment.replies) {
              const updatedReplies = comment.replies.map(reply => {
                if (reply.id === commentId) {
                  return {
                    ...reply,
                    liked: !reply.liked,
                    likes: reply.liked ? reply.likes - 1 : reply.likes + 1
                  };
                }
                return reply;
              });
              return { ...comment, replies: updatedReplies };
            }
            return comment;
          });
          return { ...post, commentsList: updatedCommentsList };
        }
        return post;
      })
    );
  };

  const handleAddReply = (postId: string, commentId: string, content: string) => {
    if (!currentUser) return;
    
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const newReply: Comment = {
            id: `r${Date.now()}`,
            author: currentUser.name,
            authorAvatar: getInitials(currentUser.name),
            authorId: currentUser.userId,
            content: content,
            timestamp: 'Ahora mismo',
            likes: 0,
            liked: false
          };
          
          const updatedCommentsList = post.commentsList?.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newReply]
              };
            }
            return comment;
          });
          
          return { ...post, commentsList: updatedCommentsList };
        }
        return post;
      })
    );
  };

  const actions = [
    { icon: Calendar, label: 'Solicitar Vacaciones', color: 'text-primary', href: '/leaves' },
    { icon: FileText, label: 'Ver Comprobantes', color: 'text-primary', href: '/receipts' },
    { icon: Gift, label: 'Ver Beneficios', color: 'text-primary', href: '/points' },
    { icon: FileCheck, label: 'Solicitar Documento', color: 'text-primary', href: '/documents' }
  ];

  const userInitials = currentUser ? getInitials(currentUser.name) : 'U';

  if (isLoadingAuth || isLoadingUsers) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-destructive font-semibold">Error al cargar usuarios</p>
          <p className="text-sm text-muted-foreground mt-2">Por favor, intenta de nuevo más tarde</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-[calc(100vh-120px)] overflow-hidden bg-muted/20 p-4">
        <div className="h-full max-w-7xl mx-auto">
          
          <div className="h-full bg-card/30 rounded-2xl p-4 backdrop-blur-sm border border-border/50 flex flex-col shadow-sm">
            
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6 flex-1 min-h-0">
              
              {/* Aside Izquierdo */}
              <aside className="h-full overflow-hidden">
                <div className="bg-card rounded-xl shadow-sm p-5 h-full flex flex-col border border-border/50 hover:border-border/80 transition-colors">
                  <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Crear publicación
                  </h2>
                  
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted rounded-xl transition-all border border-border/50 hover:border-primary/30 group"
                  >
                    {currentUser?.avatarUrl ? (
                      <img 
                        src={currentUser.avatarUrl} 
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-background"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 ring-2 ring-background">
                        {userInitials}
                      </div>
                    )}
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">¿Qué estás pensando?</span>
                  </button>

                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground text-center mb-3">Acciones rápidas</p>
                  </div>

                  <div className="space-y-1">
                    {actions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => {
                          console.log(`${action.label} clickeado`);
                          router.push(action.href);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-sm text-muted-foreground group"
                      >
                        <action.icon className={`w-5 h-5 ${action.color}`} />
                        <span className="group-hover:text-foreground transition-colors">{action.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      {currentUser?.avatarUrl ? (
                        <img 
                          src={currentUser.avatarUrl} 
                          alt={currentUser.name}
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0 ring-2 ring-background"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 text-white flex items-center justify-center font-bold text-[8px] flex-shrink-0 ring-2 ring-background">
                          {userInitials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{currentUser?.name || 'Usuario'}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{currentUser?.email || ''}</p>
                      </div>
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping opacity-75"></div>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center mt-2">
                      Sesión activa
                    </p>
                  </div>
                </div>
              </aside>

              {/* Contenido Central - con scrollbar mejorada */}
              <main className={cn(
                "h-full flex flex-col space-y-4 overflow-y-auto pr-1",
                scrollbarStyles
              )}>
                <ImageSlider />

                <div className="space-y-4 pb-4">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-card rounded-xl shadow-sm p-5 border border-border/50 hover:border-border/80 transition-colors hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 ring-2 ring-background">
                            {post.authorAvatar}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">{post.author}</h4>
                            <p className="text-xs text-muted-foreground">{post.authorRole}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                      </div>
                      <p className="mt-3 text-sm text-foreground leading-relaxed">{post.content}</p>
                      {post.image && (
                        <div className="mt-3 rounded-lg overflow-hidden">
                          <img
                            src={post.image}
                            alt="Post image"
                            className="w-full h-auto object-cover max-h-[400px]"
                          />
                        </div>
                      )}
                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/50">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={cn(
                              "flex items-center gap-1.5 text-sm transition-all px-3 py-1 rounded-full",
                              post.liked 
                                ? "text-red-500 bg-red-50 dark:bg-red-500/10" 
                                : "text-muted-foreground hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/5"
                            )}
                          >
                            <span>{post.liked ? <Heart fill="red" className="h-4 w-4 text-red-500 stroke-none" /> : <Heart className="h-4 w-4" />}</span>
                            <span>{post.likes}</span>
                          </button>
                          <button
                            onClick={() => handleOpenComments(post.id)}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1 rounded-full hover:bg-primary/5"
                          >
                            <MessageCircle className="h-4 w-4" /> <span>{post.comments}</span>
                          </button>
                        </div>
                        <button className="text-sm text-muted-foreground hover:text-primary transition-colors p-1 rounded-full hover:bg-muted/50">
                          ⋮
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </main>

              {/* Aside Derecho - con scrollbar mejorada */}
              <aside className="h-full overflow-hidden">
                <div className={cn(
                  "bg-card rounded-xl shadow-sm p-5 h-full overflow-y-auto flex flex-col space-y-4 border border-border/50 hover:border-border/80 transition-colors",
                  scrollbarStyles
                )}>
                  <div className="flex-shrink-0">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-primary/10">
                          <Cake className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Cumpleaños</h3>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium capitalize">
                        {new Date().toLocaleString('es', { month: 'long' })}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {birthdayData.length > 0 ? (
                        birthdayData.map((birthday) => (
                          birthday.employee ? (
                            <BirthdayAvatar 
                              key={birthday.id}
                              employee={birthday.employee}
                              day={birthday.day}
                              isWeekend={birthday.isWeekend}
                            />
                          ) : (
                            <div key={birthday.id} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
                              <span className="text-sm text-foreground font-medium">{birthday.name}</span>
                              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-muted text-muted-foreground">
                                {birthday.day}
                              </span>
                            </div>
                          )
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-sm text-muted-foreground">No hay cumpleaños este mes</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5" /> Publicación fijada
                    </div>
                    <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-lg p-3.5 border-l-4 border-primary">
                      <p className="text-sm text-foreground">
                        <strong>¡Atención equipo!</strong>
                        <br />
                        Recuerden que la reunión general será el próximo martes a las 10:00 AM.
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 flex items-end">
                    <div className="w-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-lg p-4 border border-primary/10">
                      <p className="text-xs text-foreground text-center">
                        <Lightbulb className="w-4 h-4 mr-1 inline-block text-primary" /> 
                        Tips del día: Recuerda actualizar tu perfil
                      </p>
                      <div className="mt-2 flex justify-center gap-2">
                        <span className="inline-block w-2 h-2 bg-primary/30 rounded-full animate-pulse"></span>
                        <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                        <span className="inline-block w-2 h-2 bg-primary/30 rounded-full animate-pulse"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>

        </div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreatePost={handleCreatePost}
        currentUser={currentUser}
      />

      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => {
          setIsCommentsModalOpen(false);
          setSelectedPostId(null);
        }}
        postId={selectedPostId}
        posts={posts}
        currentUser={currentUser}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        onAddReply={handleAddReply}
      />
    </>
  );
};