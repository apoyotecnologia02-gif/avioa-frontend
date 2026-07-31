"use client"
import React, { useState, useEffect } from 'react';
import { 
  Search, 
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
  Clock,
  Video,
  Camera,
  MessageCircle,
  Calendar as CalendarIcon,
  Sparkles
} from 'lucide-react';

// ===== TIPOS =====
interface Employee {
  id: string;
  name: string;
  role: string;
  initials: string;
}

interface Birthday {
  id: string;
  name: string;
  day: string;
  isWeekend?: boolean;
  employee?: Employee;
}

interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
}

// ===== DATOS DE EJEMPLO =====
const employeeData: Employee = {
  id: '1',
  name: 'Danna Gabriela Acosta',
  role: 'DIRECTOR DE VENTAS',
  initials: 'DA',
};

const employeesForBirthdays: Employee[] = [
  { id: '1', name: 'Santiago Lira', role: 'Desarrollador', initials: 'SL' },
  { id: '2', name: 'Juan Perez', role: 'Diseñador', initials: 'JP' },
  { id: '3', name: 'Marina Ospina', role: 'Marketing', initials: 'MO' },
  { id: '4', name: 'Omar Hugo Erazo', role: 'Ventas', initials: 'OHE' },
  { id: '5', name: 'Martha Rocio H...', role: 'RRHH', initials: 'MRH' },
  { id: '6', name: 'Néstor Moreno', role: 'Gerente', initials: 'NM' },
];

const birthdayData: Birthday[] = [
  { id: '1', name: 'Santiago Lira', day: 'viernes 03', employee: employeesForBirthdays[0] },
  { id: '2', name: 'Juan Perez', day: 'viernes 03', employee: employeesForBirthdays[1] },
  { id: '3', name: 'Marina Ospina', day: 'jueves 09', employee: employeesForBirthdays[2] },
  { id: '4', name: 'Omar Hugo Erazo', day: 'lunes 13', employee: employeesForBirthdays[3] },
  { id: '5', name: 'Martha Rocio H...', day: 'lunes 20', employee: employeesForBirthdays[4] },
  { id: '6', name: 'Néstor Moreno', day: 'jueves 23', isWeekend: true, employee: employeesForBirthdays[5] },
];

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
  },
];

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
  const colors = [
    'from-pink-500 to-pink-300',
    'from-purple-500 to-purple-300',
    'from-blue-500 to-blue-300',
    'from-green-500 to-green-300',
    'from-yellow-500 to-yellow-300',
    'from-red-500 to-red-300',
    'from-indigo-500 to-indigo-300',
    'from-teal-500 to-teal-300',
  ];
  
  const colorIndex = parseInt(employee.id) % colors.length;
  const gradientClass = colors[colorIndex];

  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientClass} text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0`}>
        {employee.initials}
      </div>
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

// ===== MODAL PARA CREAR PUBLICACIÓN =====
interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (content: string) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onCreatePost }) => {
  const [content, setContent] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (content.trim()) {
      onCreatePost(content);
      setContent('');
      onClose();
    }
  };

  const options = [
    { icon: Music, label: 'Música' },
    { icon: Users, label: 'Personas' },
    { icon: MapPin, label: 'Ubicación' },
    { icon: Smile, label: 'Sentimientos' },
  ];

  const mediaOptions = [
    { icon: Image, label: 'Galería' },
    { icon: Bot, label: 'Imágenes de IA' },
    { icon: Film, label: 'GIF' },
    { icon: EyeOff, label: 'No publica' },
  ];

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
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {employeeData.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{employeeData.name}</p>
            <p className="text-xs text-gray-500">{employeeData.role}</p>
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
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[120px] text-gray-700 placeholder-gray-400"
            autoFocus
          />
        </div>

        {/* Opciones de medios */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {mediaOptions.map((option) => (
              <button
                key={option.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <option.icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              content.trim()
                ? 'bg-purple-600 text-white hover:bg-purple-700'
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

// ===== COMPONENTE PRINCIPAL =====
export const WallOfPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleCreatePost = (content: string) => {
    const newPostData: Post = {
      id: Date.now().toString(),
      author: 'Danna Gabriela Acosta',
      authorAvatar: 'DA',
      authorRole: 'DIRECTOR DE VENTAS',
      content: content,
      timestamp: 'Ahora mismo',
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false,
    };

    setPosts([newPostData, ...posts]);
  };

  // Acciones para el aside izquierdo
  const actions = [
    { icon: Calendar, label: 'Solicitar Vacaciones', color: 'text-blue-500' },
    { icon: FileText, label: 'Ver Comprobantes', color: 'text-green-500' },
    { icon: Gift, label: 'Ver Beneficios', color: 'text-purple-500' },
    { icon: FileCheck, label: 'Solicitar Documento', color: 'text-orange-500' }
  ];

  return (
    <>
      <div className="w-full h-[calc(100vh-120px)] overflow-hidden bg-gray-100 p-4">
        <div className="h-full max-w-7xl mx-auto">
          
          {/* Layout: 3 Columnas*/}
          <div className="h-full bg-white/30 rounded-2xl p-4 backdrop-blur-sm border border-white/50 flex flex-col">
            
            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6 flex-1 min-h-0">
              
              {/* Aside Izquierdo - Panel de creación de publicaciones */}
              <aside className="h-full overflow-hidden">
                <div className="bg-white rounded-xl shadow-sm p-5 h-full flex flex-col">
                  <h2 className="text-sm font-semibold text-gray-800 mb-4">Crear publicación</h2>
                  
                  {/* Botón "¿Qué estás pensando?" */}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200 hover:border-purple-300"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {employeeData.initials}
                    </div>
                    <span className="text-sm text-gray-500">¿Qué estás pensando?</span>
                  </button>

                  {/* Separador */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400 text-center mb-3">Acciones rápidas</p>
                  </div>

                  {/* Acciones rápidas */}
                  <div className="space-y-2">
                    {actions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => console.log(`${action.label} clickeado`)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 group"
                      >
                        <action.icon className={`w-5 h-5 ${action.color}`} />
                        <span className="group-hover:text-gray-800">{action.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Separador final */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400 text-center">
                      Publica contenido para compartir con tu equipo
                    </p>
                  </div>
                </div>
              </aside>

              {/* Contenido Central */}
              <main className="h-full flex flex-col space-y-4 overflow-y-auto pr-1">
                {/* Slider de imágenes */}
                <ImageSlider />

                {/* Publicaciones */}
                <div className="space-y-4 pb-4">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
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
                              post.liked ? 'text-red ' : 'text-gray-500'
                            }`}
                          >
                            <span>{post.liked ? <Heart fill="red" className="h-4 w-4 text-red stroke-none"  /> : <Heart className="h-4 w-4 border-none" />}</span>
                            <span>{post.likes}</span>
                          </button>
                          <button className="flex items-center gap-1.5 text-sm text-gray-500">
                            <MessageCircle className="h-4 w-4" /> <span>{post.comments}</span>
                          </button>
                  
                        </div>
                        <button className="text-sm text-gray-400 hover:text-purple-600 transition-colors">
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
                  {/* Cumpleaños con avatares */}
                  <div className="flex-shrink-0">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-800">🎂 Cumpleaños</h3>
                      <span className="text-xs text-gray-500 font-medium">Noviembre</span>
                    </div>
                    <div className="space-y-0.5">
                      {birthdayData.map((birthday) => (
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
                      ))}
                    </div>
                  </div>

                  {/* Publicación fijada */}
                  <div className="flex-shrink-0">
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      📌 Publicación fijada
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3.5 border-l-4 border-purple-600">
                      <p className="text-sm text-gray-700">
                        <strong>¡Atención equipo!</strong>
                        <br />
                        Recuerden que la reunión general será el próximo martes a las 10:00 AM.
                      </p>
                    </div>
                  </div>

                  {/* Tips del día */}
                  <div className="flex-1 flex items-end">
                    <div className="w-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-purple-100">
                      <p className="text-xs text-gray-600 text-center">
                        💡 Tips del día: Recuerda actualizar tu perfil
                      </p>
                      <div className="mt-2 flex justify-center gap-2">
                        <span className="inline-block w-2 h-2 bg-purple-400 rounded-full"></span>
                        <span className="inline-block w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
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
      />
    </>
  );
};