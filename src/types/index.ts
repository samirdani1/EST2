export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  subject: string;
  type: 'cours' | 'td' | 'tp';
  description: string;
  fileUrl?: string;
  fileName?: string;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
  downloads: number;
  likes: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  postedByName: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ScheduleSlot {
  day: string;
  timeStart: string;
  timeEnd: string;
  subject: string;
  teacher: string;
  room: string;
  type: string;
  groups?: string;
}
