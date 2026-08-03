"use client"

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
    <div className="relative w-full h-[280px] bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
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
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all hover:scale-110"
        aria-label="Imagen anterior"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all hover:scale-110"
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
    <div className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
      {employee.avatarUrl ? (
        <img 
          src={employee.avatarUrl} 
          alt={employee.name}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientClass} text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0`}>
          {employee.initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 font-medium truncate">{employee.name}</p>
      </div>
      <span
        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${
          isWeekend
            ? 'bg-red-50 text-red-600'
            : 'bg-gray-100 text-gray-600'
        }`}
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

  // Encontrar el post actual basado en el postId
  const currentPost = posts.find(p => p.id === postId) || null;

  // Scroll al final cuando se agregan nuevos comentarios
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
        className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">Comentarios</h2>
            <span className="text-sm text-gray-400">({currentPost.comments})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Post original */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {currentPost.authorAvatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">{currentPost.author}</h4>
                  <p className="text-xs text-gray-500">{currentPost.authorRole}</p>
                </div>
                <span className="text-xs text-gray-400">{currentPost.timestamp}</span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{currentPost.content}</p>
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

        {/* Lista de comentarios */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentPost.commentsList && currentPost.commentsList.length > 0 ? (
            currentPost.commentsList.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  {comment.authorAvatar}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold text-gray-800">{comment.author}</span>
                        <span className="text-xs text-gray-400 ml-2">{comment.timestamp}</span>
                      </div>
                      <button
                        onClick={() => onLikeComment(currentPost.id, comment.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          comment.liked ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${comment.liked ? 'fill-blue-500' : ''}`} />
                        <span>{comment.likes}</span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                  </div>
                  
                  {/* Botón de responder */}
                  <button
                    onClick={() => setReplyTo({ commentId: comment.id, author: comment.author })}
                    className="text-xs text-blue-500 hover:text-blue-700 ml-3 mt-1 font-medium"
                  >
                    Responder
                  </button>

                  {/* Respuestas */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-8 mt-3 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-200 text-white flex items-center justify-center font-bold text-[8px] flex-shrink-0">
                            {reply.authorAvatar}
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-lg p-2.5">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs font-semibold text-gray-800">{reply.author}</span>
                                <span className="text-[10px] text-gray-400 ml-2">{reply.timestamp}</span>
                              </div>
                              <button
                                onClick={() => onLikeComment(currentPost.id, reply.id)}
                                className={`flex items-center gap-1 text-xs transition-colors ${
                                  reply.liked ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'
                                }`}
                              >
                                <ThumbsUp className={`w-3 h-3 ${reply.liked ? 'fill-blue-500' : ''}`} />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                            <p className="text-xs text-gray-700 mt-0.5">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input de respuesta */}
                  {replyTo && replyTo.commentId === comment.id && (
                    <div className="ml-8 mt-2 flex items-center gap-2">
                      {currentUser?.avatarUrl ? (
                        <img 
                          src={currentUser.avatarUrl} 
                          alt={currentUser.name}
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 text-white flex items-center justify-center font-bold text-[8px] flex-shrink-0">
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
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={!replyContent.trim()}
                          className={`p-1.5 rounded-full transition-colors ${
                            replyContent.trim()
                              ? 'text-blue-500 hover:bg-blue-50'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setReplyTo(null);
                            setReplyContent('');
                          }}
                          className="text-gray-400 hover:text-gray-600 text-xs"
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
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No hay comentarios aún</p>
              <p className="text-sm text-gray-400">Sé el primero en comentar</p>
            </div>
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Input de comentario */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {currentUser?.avatarUrl ? (
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
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
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className={`p-2.5 rounded-full transition-colors ${
                  newComment.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
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
        className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Nueva publicación</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Perfil del usuario */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          {currentUser?.avatarUrl ? (
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {userInitials}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-800">{currentUser?.name || 'Usuario'}</p>
            <p className="text-xs text-gray-500">{currentUser?.position || currentUser?.role || 'Empleado'}</p>
          </div>
        </div>

        {/* Opciones de publicación */}
        <div className="flex flex-wrap gap-2 p-4 border-b border-gray-100">
          {options.map((option) => (
            <button
              key={option.label}
              onClick={() => setSelectedOption(option.label === selectedOption ? null : option.label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                selectedOption === option.label
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[120px] text-gray-700 placeholder-gray-400"
            autoFocus
          />
          
          {/* Vista previa de imagen */}
          {selectedImage && (
            <div className="relative mt-3 rounded-lg overflow-hidden border border-gray-200">
              <img 
                src={selectedImage} 
                alt="Vista previa" 
                className="w-full h-auto max-h-[300px] object-contain"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Input de archivo oculto */}
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <option.icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() && !selectedImage}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              (content.trim() || selectedImage)
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            Publicar
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== COMPONENTE LOADING =====
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <p className="text-sm text-gray-500">Cargando usuarios...</p>
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
  
  // Usar el usuario autenticado como currentUser
  const currentUser = authUser || usersData?.[0] || null;

  // Transformar usuarios para cumpleaños
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

  // Acciones para el aside izquierdo
  const actions = [
    { icon: Calendar, label: 'Solicitar Vacaciones', color: 'text-blue-500', href: '/leaves' },
    { icon: FileText, label: 'Ver Comprobantes', color: 'text-blue-500', href: '/receipts' },
    { icon: Gift, label: 'Ver Beneficios', color: 'text-blue-500', href: '/points' },
    { icon: FileCheck, label: 'Solicitar Documento', color: 'text-blue-500', href: '/documents' }
  ];

  const userInitials = currentUser ? getInitials(currentUser.name) : 'U';

  if (isLoadingAuth || isLoadingUsers) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 font-semibold">Error al cargar usuarios</p>
          <p className="text-sm text-gray-500 mt-2">Por favor, intenta de nuevo más tarde</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-[calc(100vh-120px)] overflow-hidden bg-gray-100 p-4">
        <div className="h-full max-w-7xl mx-auto">
          
          {/* Layout: 3 Columnas*/}
          <div className="h-full bg-white/30 rounded-2xl p-4 backdrop-blur-sm border border-white/50 flex flex-col">
            
            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6 flex-1 min-h-0">
              
              {/* Aside Izquierdo */}
              <aside className="h-full overflow-hidden">
                <div className="bg-white rounded-xl shadow-sm p-5 h-full flex flex-col">
                  <h2 className="text-sm font-semibold text-gray-800 mb-4">Crear publicación</h2>
                  
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200 hover:border-blue-300"
                  >
                    {currentUser?.avatarUrl ? (
                      <img 
                        src={currentUser.avatarUrl} 
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {userInitials}
                      </div>
                    )}
                    <span className="text-sm text-gray-500">¿Qué estás pensando?</span>
                  </button>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400 text-center mb-3">Acciones rápidas</p>
                  </div>

                  <div className="space-y-2">
                    {actions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => {
                          console.log(`${action.label} clickeado`);
                          router.push(action.href);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 group"
                      >
                        <action.icon className={`w-5 h-5 ${action.color}`} />
                        <span className="group-hover:text-gray-800">{action.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      {currentUser?.avatarUrl ? (
                        <img 
                          src={currentUser.avatarUrl} 
                          alt={currentUser.name}
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 text-white flex items-center justify-center font-bold text-[8px] flex-shrink-0">
                          {userInitials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{currentUser?.name || 'Usuario'}</p>
                        <p className="text-[10px] text-gray-400 truncate">{currentUser?.email || ''}</p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-2">
                      Sesión activa
                    </p>
                  </div>
                </div>
              </aside>

              {/* Contenido Central */}
              <main className="h-full flex flex-col space-y-4 overflow-y-auto pr-1">
                <ImageSlider />

                <div className="space-y-4 pb-4">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {post.authorAvatar}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800">{post.author}</h4>
                            <p className="text-xs text-gray-500">{post.authorRole}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{post.timestamp}</span>
                      </div>
                      <p className="mt-3 text-sm text-gray-700 leading-relaxed">{post.content}</p>
                      {post.image && (
                        <div className="mt-3 rounded-lg overflow-hidden">
                          <img
                            src={post.image}
                            alt="Post image"
                            className="w-full h-auto object-cover max-h-[400px]"
                          />
                        </div>
                      )}
                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-1.5 text-sm transition-colors ${
                              post.liked ? 'text-red-500' : 'text-gray-500'
                            }`}
                          >
                            <span>{post.liked ? <Heart fill="red" className="h-4 w-4 text-red-500 stroke-none" /> : <Heart className="h-4 w-4" />}</span>
                            <span>{post.likes}</span>
                          </button>
                          <button
                            onClick={() => handleOpenComments(post.id)}
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" /> <span>{post.comments}</span>
                          </button>
                        </div>
                        <button className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
                          ⋮
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </main>

              {/* Aside Derecho */}
              <aside className="h-full overflow-hidden">
                <div className="bg-white rounded-xl shadow-sm p-5 h-full overflow-y-auto flex flex-col space-y-4">
                  <div className="flex-shrink-0">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                      <Cake className="h-5 w-5 text-blue-500" />
                      <h3 className="text-sm font-semibold text-gray-800"> Cumpleaños</h3>
                      <span className="text-xs text-gray-500 font-medium">
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
                            <div key={birthday.id} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                              <span className="text-sm text-gray-700 font-medium">{birthday.name}</span>
                              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-600">
                                {birthday.day}
                              </span>
                            </div>
                          )
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No hay cumpleaños este mes
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      <Paperclip className="w-4 h-4 mr-1 inline-block" /> Publicación fijada
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3.5 border-l-4 border-blue-600">
                      <p className="text-sm text-gray-700">
                        <strong>¡Atención equipo!</strong>
                        <br />
                        Recuerden que la reunión general será el próximo martes a las 10:00 AM.
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 flex items-end">
                    <div className="w-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-gray-600 text-center">
                        <Lightbulb className="w-4 h-4 mr-1 inline-block" /> Tips del día: Recuerda actualizar tu perfil
                      </p>
                      <div className="mt-2 flex justify-center gap-2">
                        <span className="inline-block w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span className="inline-block w-2 h-2 bg-blue-300 rounded-full"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>

        </div>
      </div>

      {/* Modal para crear publicación */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreatePost={handleCreatePost}
        currentUser={currentUser}
      />

      {/* Modal de comentarios */}
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