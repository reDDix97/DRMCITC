export type UserRole = 'participant' | 'organizer';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  institution: string;
  department: string;
  role: UserRole;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  shortName: string;
  subtitle: string;
  tagline?: string;
  description: string;
  campus: string;
  institution?: string;
  foundedYear: number;
  contactEmail: string;
  website: string;
}

export type FestivalStatus = 'Upcoming' | 'Active' | 'Draft' | 'Completed' | 'Concluded' | 'Archived';

export interface Festival {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  year?: number;
  location: string;
  venue?: string;
  organizerName: string;
  status: FestivalStatus;
  coverImage: string;
  thumbnailImage?: string;
  featured: boolean;
  createdAt: string;
}

export type EventCategory =
  | 'Competition'
  | 'Hackathon'
  | 'Workshop'
  | 'Robotics'
  | 'Gaming'
  | 'Quiz';

export type EventStatus = 'Open' | 'Closing Soon' | 'Full' | 'Closed' | 'Draft' | 'Archived';

export interface ClubEvent {
  id: string;
  festivalId: string;
  name: string;
  slug: string;
  category: EventCategory;
  shortSummary: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  endTime: string;   // HH:mm (24h)
  venue: string;
  capacity: number;
  registrationDeadline: string; // ISO string
  rules: string[];
  prizes?: string;
  teamSize?: string;
  eligibility?: string;
  organizerContact: string;
  status: EventStatus;
  featured: boolean;
  createdAt: string;
}

export type RegistrationStatus =
  | 'Registered'
  | 'Confirmed'
  | 'Waitlisted'
  | 'Checked In'
  | 'Cancelled';

export interface Registration {
  id: string;
  registrationCode: string; // e.g. NEX-TC26-8419
  eventId: string;
  festivalId: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  institution: string;
  classYear: string;
  teamName?: string;
  notes?: string;
  status: RegistrationStatus;
  qrPayload: string;
  registeredAt: string; // ISO string
  checkedInAt?: string; // ISO string
  checkedInBy?: string;
}

export interface CheckInLog {
  id: string;
  registrationId: string;
  registrationCode: string;
  eventId: string;
  participantName: string;
  checkedInAt: string;
  timestamp?: string;
  verifiedBy: string;
  method: 'qr_scan' | 'manual_code';
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
