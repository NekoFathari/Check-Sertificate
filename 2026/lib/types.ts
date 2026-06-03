// Type definitions for Certificate Management System

export interface Sertifikat {
  id: string;
  nama: string;
  nomor_sertif: string;
  asal: string;
  kab_kot: string;
  provinsi: string;
  status: 'Aktif' | 'Tidak Aktif';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthToken {
  accessToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  rowsProcessed?: number;
  errors?: string[];
}

// ─── Profile & Settings ────────────────────────────────────────────────────

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  institution?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'id' | 'en';
  emailNotifications: boolean;
  uploadNotifications: boolean;
}

export interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface GoogleSheetsSettings {
  spreadsheetId: string;
  sheetName: string;
  range: string;
  syncInterval: number; // minutes
  enabled: boolean;
}

// ─── Certificate Preview & Layout ──────────────────────────────────────────

export type CertificateLayoutPreset = 'compact' | 'standard' | 'wide';

export interface CertificateLayout {
  preset: CertificateLayoutPreset;
  titlePosition: { x: number; y: number };
  namePosition: { x: number; y: number };
  numberPosition: { x: number; y: number };
  datePosition: { x: number; y: number };
  signaturePosition: { x: number; y: number };
  fontSize: number;
  fontFamily: string;
}

export type CertificateTemplateType = 'default' | 'custom';

export interface CertificateTemplate {
  id: string;
  name: string;
  type: CertificateTemplateType;
  description: string;
  previewImage?: string;
}

export interface CertificatePreviewData {
  sertifikat: Sertifikat;
  template: CertificateTemplate;
  layout: CertificateLayout;
  fileUrl?: string;
  fileType?: 'pdf' | 'image';
}
