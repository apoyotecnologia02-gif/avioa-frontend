// hooks/useBirthdayPosts.ts
import { useState, useEffect, useRef } from 'react';

// ===== TIPOS =====
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
  month: string;
  isWeekend: boolean;
  employee: Employee;
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
  commentsList?: any[];
  isBirthdayPost?: boolean;
  birthdayPerson?: string;
}

interface BirthdayPostsData {
  birthdayPosts: Post[];
  todayBirthdays: Birthday[];
  monthBirthdays: Birthday[];
  generatedAt: string;
  count: {
    birthdayPosts: number;
    todayBirthdays: number;
    monthBirthdays: number;
  };
}

interface ApiResponse {
  success: boolean;
  data: BirthdayPostsData;
  message?: string;
}

export function useBirthdayPosts() {
  const [data, setData] = useState<BirthdayPostsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;

    const fetchBirthdayPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        hasFetched.current = true;

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const endpoint = `${API_URL}/users/birthday-posts`;

        console.log('🔵 URL del endpoint:', endpoint);

        let token = null;
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('token');
          if (!token) {
            token = sessionStorage.getItem('token');
          }
          if (!token) {
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
              const [name, value] = cookie.trim().split('=');
              if (name === 'token' || name === 'access_token') {
                token = value;
                break;
              }
            }
          }
        }

        console.log('🔑 Token:', token ? 'Presente' : 'No encontrado');

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 Status:', response.status);

        if (!response.ok) {
          let errorMessage = `Error ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = `${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const result: ApiResponse = await response.json();
        console.log('✅ Datos recibidos:', result);

        if (!result.success) {
          throw new Error(result.message || 'Error al obtener publicaciones de cumpleaños');
        }

        if (!result.data) {
          throw new Error('No se recibieron datos');
        }

        // ===== GENERAR ID CONSISTENTE PARA CADA PUBLICACIÓN =====
        // Esto asegura que el ID sea el mismo en cada refresh
        const birthdayPostsWithConsistentId = result.data.birthdayPosts.map(post => ({
          ...post,
          // Usar birthdayPerson como base del ID si existe, sino usar el ID original
          id: post.birthdayPerson 
            ? `birthday-${post.birthdayPerson.replace(/\s/g, '-')}` 
            : post.id,
        }));

        // Actualizar los datos con IDs consistentes
        const updatedData: BirthdayPostsData = {
          ...result.data,
          birthdayPosts: birthdayPostsWithConsistentId,
        };

        console.log(`🎂 ${updatedData.birthdayPosts.length} publicaciones de cumpleaños con IDs consistentes`);

        // 👇 Devolver TODAS las publicaciones (el componente filtrará las duplicadas)
        setData(updatedData);

      } catch (err) {
        console.error('❌ Error en useBirthdayPosts:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        hasFetched.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchBirthdayPosts();
  }, []);

  return { data, isLoading, error };
}