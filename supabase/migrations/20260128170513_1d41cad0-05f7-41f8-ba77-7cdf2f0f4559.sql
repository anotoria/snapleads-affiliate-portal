-- =============================================
-- MATERIAIS DE APOIO - DATABASE SCHEMA
-- =============================================

-- 1. TABELAS PARA TRILHAS (CURSOS)
-- =============================================

-- Trilhas/Cursos
CREATE TABLE public.learning_tracks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Módulos das Trilhas
CREATE TABLE public.learning_modules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    track_id UUID NOT NULL REFERENCES public.learning_tracks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Conteúdos dos Módulos
CREATE TABLE public.learning_contents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL DEFAULT 'video' CHECK (content_type IN ('video', 'text')),
    video_url TEXT,
    text_content TEXT,
    duration_minutes INTEGER DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Progresso do Usuário nos Conteúdos
CREATE TABLE public.user_content_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    content_id UUID NOT NULL REFERENCES public.learning_contents(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    last_watched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, content_id)
);

-- 2. TABELAS PARA MÍDIAS
-- =============================================

-- Categorias de Mídia
CREATE TABLE public.media_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('photo', 'video', 'file')),
    description TEXT,
    cover_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Itens de Mídia
CREATE TABLE public.media_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES public.media_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_type TEXT NOT NULL,
    file_size INTEGER DEFAULT 0,
    media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'file')),
    dimensions JSONB,
    duration_seconds INTEGER,
    download_count INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. ÍNDICES PARA PERFORMANCE
-- =============================================

-- Trilhas
CREATE INDEX idx_learning_tracks_active ON public.learning_tracks(is_active, sort_order);
CREATE INDEX idx_learning_tracks_featured ON public.learning_tracks(is_featured, is_active);
CREATE INDEX idx_learning_modules_track ON public.learning_modules(track_id, sort_order);
CREATE INDEX idx_learning_contents_module ON public.learning_contents(module_id, sort_order);
CREATE INDEX idx_user_content_progress_user ON public.user_content_progress(user_id, content_id);
CREATE INDEX idx_user_content_progress_content ON public.user_content_progress(content_id);

-- Mídias
CREATE INDEX idx_media_categories_type ON public.media_categories(type, is_active, sort_order);
CREATE INDEX idx_media_items_category ON public.media_items(category_id, media_type, sort_order);
CREATE INDEX idx_media_items_type ON public.media_items(media_type, is_active);

-- 4. TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_learning_tracks_updated_at
    BEFORE UPDATE ON public.learning_tracks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_modules_updated_at
    BEFORE UPDATE ON public.learning_modules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_contents_updated_at
    BEFORE UPDATE ON public.learning_contents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_content_progress_updated_at
    BEFORE UPDATE ON public.user_content_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_categories_updated_at
    BEFORE UPDATE ON public.media_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_items_updated_at
    BEFORE UPDATE ON public.media_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 5. HABILITAR RLS EM TODAS AS TABELAS
-- =============================================

ALTER TABLE public.learning_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS RLS - LEARNING_TRACKS
-- =============================================

CREATE POLICY "Users can view active tracks"
ON public.learning_tracks FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can view all tracks"
ON public.learning_tracks FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert tracks"
ON public.learning_tracks FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update tracks"
ON public.learning_tracks FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete tracks"
ON public.learning_tracks FOR DELETE
USING (is_admin(auth.uid()));

-- 7. POLÍTICAS RLS - LEARNING_MODULES
-- =============================================

CREATE POLICY "Users can view modules of active tracks"
ON public.learning_modules FOR SELECT
USING (
    auth.uid() IS NOT NULL 
    AND is_active = true
    AND EXISTS (
        SELECT 1 FROM public.learning_tracks 
        WHERE id = learning_modules.track_id 
        AND is_active = true
    )
);

CREATE POLICY "Admins can view all modules"
ON public.learning_modules FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert modules"
ON public.learning_modules FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update modules"
ON public.learning_modules FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete modules"
ON public.learning_modules FOR DELETE
USING (is_admin(auth.uid()));

-- 8. POLÍTICAS RLS - LEARNING_CONTENTS
-- =============================================

CREATE POLICY "Users can view contents of active modules"
ON public.learning_contents FOR SELECT
USING (
    auth.uid() IS NOT NULL 
    AND is_active = true
    AND EXISTS (
        SELECT 1 FROM public.learning_modules m
        JOIN public.learning_tracks t ON t.id = m.track_id
        WHERE m.id = learning_contents.module_id 
        AND m.is_active = true
        AND t.is_active = true
    )
);

CREATE POLICY "Admins can view all contents"
ON public.learning_contents FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert contents"
ON public.learning_contents FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update contents"
ON public.learning_contents FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete contents"
ON public.learning_contents FOR DELETE
USING (is_admin(auth.uid()));

-- 9. POLÍTICAS RLS - USER_CONTENT_PROGRESS
-- =============================================

CREATE POLICY "Users can view own progress"
ON public.user_content_progress FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON public.user_content_progress FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON public.user_content_progress FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
ON public.user_content_progress FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
ON public.user_content_progress FOR SELECT
USING (is_admin(auth.uid()));

-- 10. POLÍTICAS RLS - MEDIA_CATEGORIES
-- =============================================

CREATE POLICY "Users can view active categories"
ON public.media_categories FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can view all categories"
ON public.media_categories FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert categories"
ON public.media_categories FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update categories"
ON public.media_categories FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories"
ON public.media_categories FOR DELETE
USING (is_admin(auth.uid()));

-- 11. POLÍTICAS RLS - MEDIA_ITEMS
-- =============================================

CREATE POLICY "Users can view active media items"
ON public.media_items FOR SELECT
USING (
    auth.uid() IS NOT NULL 
    AND is_active = true
    AND EXISTS (
        SELECT 1 FROM public.media_categories 
        WHERE id = media_items.category_id 
        AND is_active = true
    )
);

CREATE POLICY "Admins can view all media items"
ON public.media_items FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert media items"
ON public.media_items FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update media items"
ON public.media_items FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete media items"
ON public.media_items FOR DELETE
USING (is_admin(auth.uid()));

-- 12. STORAGE BUCKETS
-- =============================================

-- Bucket para capas de trilhas e categorias (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('learning-covers', 'learning-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para vídeos dos conteúdos (privado - apenas autenticados)
INSERT INTO storage.buckets (id, name, public)
VALUES ('learning-videos', 'learning-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Bucket para mídias (público para download)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-library', 'media-library', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para thumbnails (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-thumbnails', 'media-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 13. POLÍTICAS DE STORAGE
-- =============================================

-- learning-covers: leitura pública
CREATE POLICY "Public read learning covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'learning-covers');

-- learning-covers: admins podem fazer upload
CREATE POLICY "Admins can upload learning covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'learning-covers' AND is_admin(auth.uid()));

-- learning-covers: admins podem atualizar
CREATE POLICY "Admins can update learning covers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'learning-covers' AND is_admin(auth.uid()));

-- learning-covers: admins podem deletar
CREATE POLICY "Admins can delete learning covers"
ON storage.objects FOR DELETE
USING (bucket_id = 'learning-covers' AND is_admin(auth.uid()));

-- learning-videos: usuários autenticados podem assistir
CREATE POLICY "Authenticated can view learning videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'learning-videos' AND auth.uid() IS NOT NULL);

-- learning-videos: admins podem fazer upload
CREATE POLICY "Admins can upload learning videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'learning-videos' AND is_admin(auth.uid()));

-- learning-videos: admins podem atualizar
CREATE POLICY "Admins can update learning videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'learning-videos' AND is_admin(auth.uid()));

-- learning-videos: admins podem deletar
CREATE POLICY "Admins can delete learning videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'learning-videos' AND is_admin(auth.uid()));

-- media-library: leitura pública (download)
CREATE POLICY "Public read media library"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-library');

-- media-library: admins podem fazer upload
CREATE POLICY "Admins can upload to media library"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media-library' AND is_admin(auth.uid()));

-- media-library: admins podem atualizar
CREATE POLICY "Admins can update media library"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media-library' AND is_admin(auth.uid()));

-- media-library: admins podem deletar
CREATE POLICY "Admins can delete from media library"
ON storage.objects FOR DELETE
USING (bucket_id = 'media-library' AND is_admin(auth.uid()));

-- media-thumbnails: leitura pública
CREATE POLICY "Public read media thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-thumbnails');

-- media-thumbnails: admins podem fazer upload
CREATE POLICY "Admins can upload media thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media-thumbnails' AND is_admin(auth.uid()));

-- media-thumbnails: admins podem atualizar
CREATE POLICY "Admins can update media thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media-thumbnails' AND is_admin(auth.uid()));

-- media-thumbnails: admins podem deletar
CREATE POLICY "Admins can delete media thumbnails"
ON storage.objects FOR DELETE
USING (bucket_id = 'media-thumbnails' AND is_admin(auth.uid()));

-- 14. HABILITAR REALTIME PARA TABELAS PRINCIPAIS
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_tracks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_modules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_contents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.media_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.media_items;