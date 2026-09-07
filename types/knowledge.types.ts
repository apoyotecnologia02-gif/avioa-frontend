export interface KnowledgeFolder {
  knowledgeFolderId: string;
  name: string;
  parentId: string;
  createdAt: string | null;
  _count?: { children: number; files: number };
}

export interface KnowledgeFile {
  knowledgeFileId: string;
  title: string;
  driveUrl: string;
  folderId: string;
  createdAt: string;
}

export interface BreadcrumbItem {
  knowledgeFolderId: string;
  name: string;
}

export interface KnowledgeContents {
  folder: KnowledgeFolder | null;
  breadcrumb: BreadcrumbItem[];
  subfolders: KnowledgeFolder[];
  files: KnowledgeFile[];
}
