
# Plano: Materiais de Apoio (Trilhas e Mídias)

## Visao Geral

Implementar um sistema completo de materiais de apoio com duas areas principais:

1. **Trilhas (Cursos)**: Sistema de cursos com modulos e conteudos (video/texto)
2. **Midias**: Biblioteca de arquivos organizados por tipo (Fotos, Videos, Arquivos)

Ambos os lados (Admin e Afiliado) serao implementados com interface estilo Netflix para capas.

---

## Arquitetura do Sistema

```text
+----------------------------------+
|      MATERIAIS DE APOIO          |
+----------------------------------+
|                                  |
|  +------------+  +------------+  |
|  |  TRILHAS   |  |   MIDIAS   |  |
|  +------------+  +------------+  |
|       |               |          |
|   Modulos         Categorias     |
|       |               |          |
|  Conteudos        Arquivos       |
|                                  |
+----------------------------------+
```

---

## Estrutura de Banco de Dados

### Tabelas para Trilhas (Cursos)

#### 1. `learning_tracks` (Trilhas/Cursos)

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| title | text | Titulo da trilha |
| description | text | Descricao |
| cover_url | text | URL da capa (estilo Netflix) |
| sort_order | integer | Ordem de exibicao |
| is_active | boolean | Status ativo |
| is_featured | boolean | Destaque na home |
| created_by | uuid | Admin que criou |
| created_at | timestamptz | Data criacao |
| updated_at | timestamptz | Data atualizacao |

#### 2. `learning_modules` (Modulos)

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| track_id | uuid | FK -> learning_tracks |
| title | text | Titulo do modulo |
| description | text | Descricao |
| sort_order | integer | Ordem dentro da trilha |
| is_active | boolean | Status ativo |
| created_at | timestamptz | Data criacao |
| updated_at | timestamptz | Data atualizacao |

#### 3. `learning_contents` (Conteudos)

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| module_id | uuid | FK -> learning_modules |
| title | text | Titulo do conteudo |
| description | text | Descricao |
| content_type | text | 'video' ou 'text' |
| video_url | text | URL do video (se aplicavel) |
| text_content | text | Conteudo texto/HTML |
| duration_minutes | integer | Duracao em minutos |
| sort_order | integer | Ordem dentro do modulo |
| is_active | boolean | Status ativo |
| created_at | timestamptz | Data criacao |
| updated_at | timestamptz | Data atualizacao |

#### 4. `user_content_progress` (Progresso do Usuario)

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK -> auth.users |
| content_id | uuid | FK -> learning_contents |
| completed | boolean | Conteudo concluido |
| progress_percent | integer | Progresso (0-100) |
| last_watched_at | timestamptz | Ultimo acesso |
| created_at | timestamptz | Data criacao |
| updated_at | timestamptz | Data atualizacao |

### Tabelas para Midias

#### 5. `media_categories` (Categorias de Midia)

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| name | text | Nome interno |
| display_name | text | Nome exibicao |
| type | text | 'photo', 'video', 'file' |
| description | text | Descricao |
| cover_url | text | Capa da categoria |
| sort_order | integer | Ordem |
| is_active | boolean | Status |
| created_at | timestamptz | Data criacao |
| updated_at | timestamptz | Data atualizacao |

#### 6. `media_items` (Itens de Midia)

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| category_id | uuid | FK -> media_categories |
| title | text | Titulo do arquivo |
| description | text | Descricao |
| file_url | text | URL do arquivo |
| thumbnail_url | text | URL da miniatura |
| file_type | text | Extensao (jpg, mp4, pdf) |
| file_size | integer | Tamanho em bytes |
| media_type | text | 'photo', 'video', 'file' |
| dimensions | jsonb | {width, height} para imagens |
| duration_seconds | integer | Duracao para videos |
| download_count | integer | Contador de downloads |
| sort_order | integer | Ordem |
| is_active | boolean | Status |
| created_by | uuid | Admin que criou |
| created_at | timestamptz | Data criacao |
| updated_at | timestamptz | Data atualizacao |

### Indices para Performance

```sql
-- Trilhas
CREATE INDEX idx_learning_tracks_active ON learning_tracks(is_active, sort_order);
CREATE INDEX idx_learning_modules_track ON learning_modules(track_id, sort_order);
CREATE INDEX idx_learning_contents_module ON learning_contents(module_id, sort_order);
CREATE INDEX idx_user_content_progress_user ON user_content_progress(user_id, content_id);

-- Midias
CREATE INDEX idx_media_categories_type ON media_categories(type, is_active, sort_order);
CREATE INDEX idx_media_items_category ON media_items(category_id, media_type, sort_order);
CREATE INDEX idx_media_items_type ON media_items(media_type, is_active);
```

---

## Politicas RLS (Row Level Security)

### learning_tracks

```sql
-- Usuarios autenticados podem ver trilhas ativas
CREATE POLICY "Users can view active tracks"
ON learning_tracks FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Admins podem gerenciar trilhas
CREATE POLICY "Admins can manage tracks"
ON learning_tracks FOR ALL
USING (is_admin(auth.uid()));
```

### learning_modules

```sql
-- Usuarios podem ver modulos de trilhas ativas
CREATE POLICY "Users can view modules of active tracks"
ON learning_modules FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND is_active = true
  AND EXISTS (
    SELECT 1 FROM learning_tracks 
    WHERE id = learning_modules.track_id 
    AND is_active = true
  )
);

-- Admins podem gerenciar modulos
CREATE POLICY "Admins can manage modules"
ON learning_modules FOR ALL
USING (is_admin(auth.uid()));
```

### learning_contents

```sql
-- Usuarios podem ver conteudos de modulos ativos
CREATE POLICY "Users can view contents of active modules"
ON learning_contents FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND is_active = true
  AND EXISTS (
    SELECT 1 FROM learning_modules m
    JOIN learning_tracks t ON t.id = m.track_id
    WHERE m.id = learning_contents.module_id 
    AND m.is_active = true
    AND t.is_active = true
  )
);

-- Admins podem gerenciar conteudos
CREATE POLICY "Admins can manage contents"
ON learning_contents FOR ALL
USING (is_admin(auth.uid()));
```

### user_content_progress

```sql
-- Usuarios podem ver/gerenciar seu proprio progresso
CREATE POLICY "Users can manage own progress"
ON user_content_progress FOR ALL
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Admins podem ver todo o progresso
CREATE POLICY "Admins can view all progress"
ON user_content_progress FOR SELECT
USING (is_admin(auth.uid()));
```

### media_categories

```sql
-- Usuarios podem ver categorias ativas
CREATE POLICY "Users can view active categories"
ON media_categories FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Admins podem gerenciar categorias
CREATE POLICY "Admins can manage categories"
ON media_categories FOR ALL
USING (is_admin(auth.uid()));
```

### media_items

```sql
-- Usuarios podem ver midias de categorias ativas
CREATE POLICY "Users can view active media items"
ON media_items FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND is_active = true
  AND EXISTS (
    SELECT 1 FROM media_categories 
    WHERE id = media_items.category_id 
    AND is_active = true
  )
);

-- Admins podem gerenciar midias
CREATE POLICY "Admins can manage media items"
ON media_items FOR ALL
USING (is_admin(auth.uid()));
```

---

## Storage Buckets

### Criar Buckets

```sql
-- Bucket para capas de trilhas e categorias
INSERT INTO storage.buckets (id, name, public)
VALUES ('learning-covers', 'learning-covers', true);

-- Bucket para videos dos conteudos
INSERT INTO storage.buckets (id, name, public)
VALUES ('learning-videos', 'learning-videos', false);

-- Bucket para midias (fotos, videos, arquivos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-library', 'media-library', true);

-- Bucket para thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-thumbnails', 'media-thumbnails', true);
```

### Politicas de Storage

```sql
-- learning-covers: publico para leitura
CREATE POLICY "Public read learning covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'learning-covers');

-- learning-covers: admins podem fazer upload
CREATE POLICY "Admins can upload learning covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'learning-covers' AND is_admin(auth.uid()));

-- learning-videos: usuarios autenticados podem assistir
CREATE POLICY "Authenticated can view learning videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'learning-videos' AND auth.uid() IS NOT NULL);

-- learning-videos: admins podem fazer upload
CREATE POLICY "Admins can upload learning videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'learning-videos' AND is_admin(auth.uid()));

-- media-library: publico para leitura (download)
CREATE POLICY "Public read media library"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-library');

-- media-library: admins podem fazer upload
CREATE POLICY "Admins can upload to media library"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media-library' AND is_admin(auth.uid()));
```

---

## Estrutura de Arquivos

### Paginas

```text
src/pages/
  +-- SupportMaterials.tsx         (Hub principal do afiliado)
  +-- Tracks.tsx                   (Lista de trilhas - afiliado)
  +-- TrackDetail.tsx              (Detalhes de uma trilha)
  +-- ContentPlayer.tsx            (Player de conteudo)
  +-- MediaLibrary.tsx             (Biblioteca de midias)
  +-- MediaCategory.tsx            (Categoria especifica)
  +-- admin/
      +-- AdminTracks.tsx          (Gerenciar trilhas)
      +-- AdminTrackModules.tsx    (Gerenciar modulos de uma trilha)
      +-- AdminContents.tsx        (Gerenciar conteudos de um modulo)
      +-- AdminMediaCategories.tsx (Gerenciar categorias)
      +-- AdminMediaItems.tsx      (Gerenciar itens de midia)
```

### Componentes

```text
src/components/
  +-- learning/
      +-- TrackCard.tsx            (Card estilo Netflix para trilha)
      +-- ModuleAccordion.tsx      (Acordeao de modulos)
      +-- ContentItem.tsx          (Item de conteudo na lista)
      +-- VideoPlayer.tsx          (Player de video)
      +-- TextContent.tsx          (Visualizador de conteudo texto)
      +-- ProgressBar.tsx          (Barra de progresso)
  +-- media/
      +-- MediaTypeSelector.tsx    (Seletor FOTOS | VIDEOS | ARQUIVOS)
      +-- CategoryCard.tsx         (Card de categoria estilo Netflix)
      +-- MediaGrid.tsx            (Grid de itens de midia)
      +-- MediaCard.tsx            (Card individual de midia)
      +-- MediaViewer.tsx          (Modal com zoom para imagens)
      +-- DownloadButton.tsx       (Botao de download)
      +-- BulkDownload.tsx         (Download em lote)
```

### Hooks

```text
src/hooks/
  +-- useTracks.tsx               (CRUD trilhas - afiliado)
  +-- useModules.tsx              (CRUD modulos)
  +-- useContents.tsx             (CRUD conteudos)
  +-- useContentProgress.tsx      (Progresso do usuario)
  +-- useMediaCategories.tsx      (Categorias de midia)
  +-- useMediaItems.tsx           (Itens de midia)
  +-- useAdminTracks.tsx          (Admin - trilhas)
  +-- useAdminModules.tsx         (Admin - modulos)
  +-- useAdminContents.tsx        (Admin - conteudos)
  +-- useAdminMediaCategories.tsx (Admin - categorias)
  +-- useAdminMediaItems.tsx      (Admin - itens)
```

---

## Interface do Usuario

### Pagina Hub "Materiais de Apoio" (Afiliado)

```text
+------------------------------------------+
|  MATERIAIS DE APOIO                      |
|  Aprenda e tenha acesso a recursos       |
+------------------------------------------+
|                                          |
|  [== TRILHAS ==]    [== MIDIAS ==]      |
|                                          |
|  +--------+ +--------+ +--------+        |
|  | Capa 1 | | Capa 2 | | Capa 3 |        |  <- Carrossel Netflix
|  | Trilha | | Trilha | | Trilha |        |
|  +--------+ +--------+ +--------+        |
|                                          |
|  +---+ +---+ +---+                       |
|  |FOT| |VID| |ARQ|  <- Tipos de Midia   |
|  +---+ +---+ +---+                       |
+------------------------------------------+
```

### Pagina de Trilha (Detalhe)

```text
+------------------------------------------+
|  [<- Voltar]                             |
|                                          |
|  +--------+  TITULO DA TRILHA            |
|  |  CAPA  |  Descricao da trilha...      |
|  |        |  [Progresso: 45%]            |
|  +--------+                              |
+------------------------------------------+
|  MODULOS                                 |
|  +--------------------------------------+|
|  | v Modulo 1: Introducao               ||
|  |   [x] Conteudo 1: Bem-vindo    5min  ||
|  |   [x] Conteudo 2: Conceitos   10min  ||
|  |   [ ] Conteudo 3: Pratica     15min  ||
|  +--------------------------------------+|
|  | > Modulo 2: Avancado                 ||
|  +--------------------------------------+|
+------------------------------------------+
```

### Pagina de Conteudo (Player)

```text
+------------------------------------------+
|  [<- Trilha] > Modulo 1 > Conteudo 1     |
+------------------------------------------+
|  +--------------------------------------+|
|  |                                      ||
|  |          VIDEO PLAYER                ||
|  |                                      ||
|  +--------------------------------------+|
|  Titulo do Conteudo                      |
|  Descricao detalhada...                  |
|                                          |
|  [Anterior]  [Proximo]  [x] Marcar como  |
|                             concluido    |
+------------------------------------------+
```

### Pagina de Midias (Biblioteca)

```text
+------------------------------------------+
|  BIBLIOTECA DE MIDIAS                    |
+------------------------------------------+
|  [FOTOS]  [VIDEOS]  [ARQUIVOS]          |
+------------------------------------------+
|  CATEGORIAS                              |
|  +--------+ +--------+ +--------+        |
|  | Capa 1 | | Capa 2 | | Capa 3 |        |
|  |Banners | |Logos   | |Posts   |        |
|  +--------+ +--------+ +--------+        |
+------------------------------------------+
```

### Visualizador de Midia (Modal)

```text
+------------------------------------------+
|  [x]                           [Download]|
+------------------------------------------+
|                                          |
|           +----------------+             |
|           |                |             |
|           |    IMAGEM      |             |
|           |   (com zoom)   |             |
|           |                |             |
|           +----------------+             |
|                                          |
|  [<]  1 de 24  [>]                       |
+------------------------------------------+
```

---

## Admin - Interface

### Pagina Admin Trilhas

```text
+------------------------------------------+
|  GERENCIAR TRILHAS          [+ Nova]     |
+------------------------------------------+
|  | Ordem | Capa | Titulo | Status | Acoes|
|  |-------|------|--------|--------|------|
|  |  1    | [img]| Intro  | Ativo  | [E][D]|
|  |  2    | [img]| Avanco | Inativo| [E][D]|
+------------------------------------------+
|  [Clique para gerenciar modulos]         |
+------------------------------------------+
```

### Pagina Admin Midias

```text
+------------------------------------------+
|  GERENCIAR MIDIAS                        |
+------------------------------------------+
|  [Categorias]  [Itens de Midia]          |
+------------------------------------------+
|  FOTOS | VIDEOS | ARQUIVOS               |
|  +--------------------------------------+|
|  | Categoria | Tipo | Qtde | Status     ||
|  |-----------|------|------|------------|
|  | Banners   | FOTO |  24  | Ativo      ||
|  | Tutoriais | VIDEO|  12  | Ativo      ||
|  +--------------------------------------+|
+------------------------------------------+
```

---

## Webhook - Extensao

### Novas Tabelas Suportadas

| Tabela | Descricao |
|--------|-----------|
| `learning_tracks` | Trilhas de aprendizado |
| `learning_modules` | Modulos das trilhas |
| `learning_contents` | Conteudos dos modulos |
| `media_categories` | Categorias de midia |
| `media_items` | Itens de midia |

### Acoes Especiais

| Action | Descricao |
|--------|-----------|
| `upload_media` | Upload de arquivo de midia |
| `upload_content_video` | Upload de video de conteudo |
| `bulk_upload_media` | Upload em lote de midias |

### Exemplo de Payload - Criar Trilha

```json
{
  "action": "insert",
  "table": "learning_tracks",
  "data": {
    "title": "Introducao ao Programa de Afiliados",
    "description": "Aprenda os conceitos basicos...",
    "cover_url": "https://...",
    "is_active": true,
    "is_featured": true
  }
}
```

### Exemplo de Payload - Upload de Midia

```json
{
  "action": "upload_media",
  "data": {
    "category_id": "uuid-categoria",
    "title": "Banner Promocional Janeiro",
    "file_base64": "base64...",
    "file_name": "banner-janeiro.png",
    "media_type": "photo"
  }
}
```

---

## Traducoes (i18n)

### Novas Chaves

```typescript
supportMaterials: {
  title: "Materiais de Apoio",
  subtitle: "Aprenda e tenha acesso a recursos exclusivos",
  tracks: "Trilhas",
  media: "Midias",
  photos: "Fotos",
  videos: "Videos",
  files: "Arquivos",
  // Trilhas
  startTrack: "Iniciar Trilha",
  continueTrack: "Continuar Trilha",
  completedTrack: "Trilha Concluida",
  progress: "Progresso",
  modules: "Modulos",
  contents: "Conteudos",
  duration: "Duracao",
  markAsComplete: "Marcar como concluido",
  nextContent: "Proximo Conteudo",
  previousContent: "Conteudo Anterior",
  // Midias
  downloadSelected: "Baixar Selecionados",
  downloadAll: "Baixar Todos",
  selectAll: "Selecionar Todos",
  clearSelection: "Limpar Selecao",
  noMediaFound: "Nenhuma midia encontrada",
  zoomIn: "Ampliar",
  zoomOut: "Reduzir",
},
admin: {
  // Trilhas
  tracks: "Trilhas",
  tracksSubtitle: "Gerencie trilhas de aprendizado",
  addTrack: "Nova Trilha",
  editTrack: "Editar Trilha",
  manageModules: "Gerenciar Modulos",
  // Modulos
  modules: "Modulos",
  modulesSubtitle: "Gerencie modulos da trilha",
  addModule: "Novo Modulo",
  editModule: "Editar Modulo",
  manageContents: "Gerenciar Conteudos",
  // Conteudos
  contents: "Conteudos",
  contentsSubtitle: "Gerencie conteudos do modulo",
  addContent: "Novo Conteudo",
  editContent: "Editar Conteudo",
  contentType: "Tipo de Conteudo",
  videoContent: "Conteudo em Video",
  textContent: "Conteudo em Texto",
  // Midias
  mediaCategories: "Categorias de Midia",
  mediaCategoriesSubtitle: "Organize suas midias por categoria",
  addCategory: "Nova Categoria",
  editCategory: "Editar Categoria",
  mediaItems: "Itens de Midia",
  mediaItemsSubtitle: "Gerencie arquivos de midia",
  uploadMedia: "Fazer Upload",
  bulkUpload: "Upload em Lote",
}
```

---

## Rotas

### Afiliado

| Rota | Pagina |
|------|--------|
| `/materials` | Hub de Materiais de Apoio |
| `/materials/tracks` | Lista de Trilhas |
| `/materials/tracks/:id` | Detalhe da Trilha |
| `/materials/tracks/:id/content/:contentId` | Player do Conteudo |
| `/materials/media` | Biblioteca de Midias |
| `/materials/media/:type` | Midias por Tipo |
| `/materials/media/:type/:categoryId` | Categoria Especifica |

### Admin

| Rota | Pagina |
|------|--------|
| `/admin/tracks` | Gerenciar Trilhas |
| `/admin/tracks/:id/modules` | Gerenciar Modulos |
| `/admin/tracks/:trackId/modules/:moduleId/contents` | Gerenciar Conteudos |
| `/admin/media` | Gerenciar Midias |
| `/admin/media/categories` | Gerenciar Categorias |
| `/admin/media/items/:categoryId` | Gerenciar Itens |

---

## Sidebar Updates

### Afiliado (AppSidebar)

```typescript
// Adicionar item no menu
{ title: t.nav.supportMaterials, url: "/materials", icon: GraduationCap }
```

### Admin (AdminSidebar)

```typescript
// Adicionar itens no menu
{ title: t.nav.adminTracks, url: "/admin/tracks", icon: BookOpen }
{ title: t.nav.adminMedia, url: "/admin/media", icon: FolderImage }
```

---

## Ordem de Implementacao

### Fase 1: Banco de Dados
1. Criar tabelas de trilhas (learning_tracks, learning_modules, learning_contents)
2. Criar tabelas de midias (media_categories, media_items)
3. Criar tabela de progresso (user_content_progress)
4. Configurar indices
5. Configurar RLS policies
6. Criar storage buckets

### Fase 2: Backend/Hooks
1. Hooks de leitura para afiliado (useTracks, useContents, useMediaItems)
2. Hooks de admin (useAdminTracks, useAdminContents, useAdminMediaItems)
3. Hook de progresso (useContentProgress)
4. Hook de upload (useMediaUpload)

### Fase 3: Componentes Base
1. TrackCard (card estilo Netflix)
2. CategoryCard (card estilo Netflix)
3. MediaViewer (modal com zoom)
4. VideoPlayer (player de video)
5. DownloadButton e BulkDownload

### Fase 4: Paginas Afiliado
1. Hub de Materiais de Apoio
2. Lista de Trilhas
3. Detalhe da Trilha
4. Player de Conteudo
5. Biblioteca de Midias
6. Visualizador de Categoria

### Fase 5: Paginas Admin
1. Gerenciar Trilhas
2. Gerenciar Modulos
3. Gerenciar Conteudos
4. Gerenciar Categorias de Midia
5. Gerenciar Itens de Midia

### Fase 6: Integracao
1. Atualizar sidebar (afiliado e admin)
2. Atualizar rotas (App.tsx)
3. Atualizar traducoes (i18n)
4. Atualizar webhook documentation
5. Extender webhook para novas tabelas

---

## Consideracoes de Seguranca

1. **RLS Rigoroso**: Todas as tabelas com RLS habilitado
2. **Validacao de Upload**: Tipos de arquivo permitidos (jpg, png, mp4, pdf, etc.)
3. **Limite de Tamanho**: Max 50MB para videos, 10MB para imagens, 20MB para arquivos
4. **Storage Seguro**: Videos de conteudos em bucket privado
5. **Sanitizacao**: Todos os inputs sanitizados contra XSS
6. **Auditoria**: Log de uploads e downloads para admin

---

## Estimativa de Arquivos

| Categoria | Quantidade |
|-----------|------------|
| Migrations SQL | 1-2 |
| Paginas | 12 |
| Componentes | 15 |
| Hooks | 11 |
| Traducoes | ~100 chaves |
| Webhook updates | 1 |

Esta funcionalidade adicionara aproximadamente **40 novos arquivos** ao projeto.
