export function getDriveEmbedUrl(url: string) {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);

  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }

  return url;
}

export function getDriveThumbnail(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  return null;
}

export interface Tutorial {
  tutorialId: string;
  title: string;
  description: string | null;
  driveUrl: string;
  category: string;
  createdAt: string;
}
