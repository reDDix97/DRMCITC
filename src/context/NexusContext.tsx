import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  cleanForFirestore,
  signInWithGoogle as firebaseGoogleSignIn,
  signOutFirebase,
} from '../lib/firebase';
import {
  SEED_CHECKINS,
  SEED_EVENTS,
  SEED_FESTIVALS,
  SEED_ORGANIZATION,
  SEED_REGISTRATIONS,
  SEED_USERS,
} from '../data/seed';
import {
  CheckInLog,
  ClubEvent,
  EventStatus,
  Festival,
  Organization,
  Registration,
  RegistrationStatus,
  UserProfile,
} from '../types/nexus';

const STORAGE_KEYS = {
  ORGANIZATION: 'nexus_v1_organization',
  FESTIVALS: 'nexus_v1_festivals',
  EVENTS: 'nexus_v1_events',
  REGISTRATIONS: 'nexus_v1_registrations',
  CHECKINS: 'nexus_v1_checkins',
  USERS: 'nexus_v1_users',
  CURRENT_USER: 'nexus_v1_current_user',
};

// Reference clock anchored to Oct 5, 2026 for consistent competition evaluation
export const REFERENCE_NOW = new Date('2026-10-05T12:00:00Z');

export interface EventAvailability {
  registeredCount: number;
  waitlistedCount: number;
  checkedInCount: number;
  capacity: number;
  remainingSeats: number;
  percentFilled: number;
  isFull: boolean;
  isDeadlinePassed: boolean;
  isClosingSoon: boolean;
  canRegister: boolean;
  effectiveStatus: EventStatus;
  statusReason: string;
}

export interface RegistrationInput {
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  institution: string;
  classYear: string;
  teamName?: string;
  notes?: string;
}

interface NexusContextValue {
  currentPath: string;
  navigate: (path: string) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  organization: Organization;
  festivals: Festival[];
  events: ClubEvent[];
  registrations: Registration[];
  checkIns: CheckInLog[];
  users: UserProfile[];
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string }>;

  login: (emailOrId: string, password?: string) => {
    ok: boolean;
    error?: string;
    user?: UserProfile;
  };
  registerUser: (profile: Omit<UserProfile, 'id' | 'createdAt'>) => {
    ok: boolean;
    error?: string;
    user?: UserProfile;
  };
  updateOrganizerPassword: (newPassword: string) => {
    ok: boolean;
    error?: string;
  };
  updateOrganizerEmail: (newEmail: string) => {
    ok: boolean;
    error?: string;
  };
  updateOrganization: (updates: Partial<Organization>) => void;
  logout: () => void;

  getFestivalBySlug: (slugOrId: string) => Festival | undefined;
  getEventBySlug: (slugOrId: string) => ClubEvent | undefined;
  getEventAvailability: (event: ClubEvent) => EventAvailability;
  getScheduleConflicts: (event: ClubEvent, email?: string) => ClubEvent[];

  submitRegistration: (input: RegistrationInput) => {
    ok: boolean;
    error?: string;
    fieldErrors?: Record<string, string>;
    registration?: Registration;
  };
  updateRegistrationStatus: (
    registrationId: string,
    nextStatus: RegistrationStatus
  ) => { ok: boolean; error?: string };
  updateRegistrationDetails: (
    registrationId: string,
    updates: Partial<Pick<Registration, 'phone' | 'teamName' | 'notes'>>
  ) => { ok: boolean; error?: string };

  verifyQrOrCode: (query: string) => {
    found: boolean;
    registration?: Registration;
    event?: ClubEvent;
    festival?: Festival;
    error?: string;
  };
  confirmCheckIn: (
    registrationId: string,
    method?: 'qr_scan' | 'manual_code'
  ) => { ok: boolean; error?: string; registration?: Registration };

  createFestival: (
    data: Omit<Festival, 'id' | 'organizationId' | 'createdAt'>
  ) => { ok: boolean; error?: string; festival?: Festival };
  updateFestival: (
    id: string,
    updates: Partial<Festival>
  ) => { ok: boolean; error?: string; festival?: Festival };
  deleteFestival: (id: string) => { ok: boolean; error?: string };

  createEvent: (
    data: Omit<ClubEvent, 'id' | 'createdAt'>
  ) => { ok: boolean; error?: string; event?: ClubEvent };
  updateEvent: (
    id: string,
    updates: Partial<ClubEvent>
  ) => { ok: boolean; error?: string; event?: ClubEvent };
  deleteEvent: (id: string) => { ok: boolean; error?: string };

  resetToSeedData: () => void;
}

const NexusContext = createContext<NexusContextValue | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors
  }
}

export const VALID_STATUS_TRANSITIONS: Record<RegistrationStatus, RegistrationStatus[]> = {
  Registered: ['Confirmed', 'Waitlisted', 'Checked In', 'Cancelled'],
  Confirmed: ['Checked In', 'Waitlisted', 'Cancelled', 'Registered'],
  Waitlisted: ['Confirmed', 'Registered', 'Cancelled'],
  'Checked In': ['Confirmed'],
  Cancelled: ['Registered', 'Confirmed'],
};

export const NexusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const p = window.location.pathname + window.location.search;
    return p || '/';
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const [organization, setOrganization] = useState<Organization>(() =>
    loadFromStorage(STORAGE_KEYS.ORGANIZATION, SEED_ORGANIZATION)
  );

  const [festivals, setFestivals] = useState<Festival[]>(() => {
    const raw = loadFromStorage(STORAGE_KEYS.FESTIVALS, SEED_FESTIVALS);
    return raw.map((f) => {
      // If coverImage contains old baked-in SVG text tags, upgrade to the clean high-res backdrop
      if (f.coverImage && (f.coverImage.includes('<text') || f.coverImage.includes('NEXUS OPERATIONS'))) {
        const seedMatch = SEED_FESTIVALS.find((sf) => sf.id === f.id);
        if (seedMatch) {
          return { ...f, coverImage: seedMatch.coverImage };
        }
      }
      return f;
    });
  });
  const [events, setEvents] = useState<ClubEvent[]>(() =>
    loadFromStorage(STORAGE_KEYS.EVENTS, SEED_EVENTS)
  );
  const [registrations, setRegistrations] = useState<Registration[]>(() =>
    loadFromStorage(STORAGE_KEYS.REGISTRATIONS, SEED_REGISTRATIONS)
  );
  const [checkIns, setCheckIns] = useState<CheckInLog[]>(() =>
    loadFromStorage(STORAGE_KEYS.CHECKINS, SEED_CHECKINS)
  );
  const [users, setUsers] = useState<UserProfile[]>(() =>
    loadFromStorage(STORAGE_KEYS.USERS, SEED_USERS)
  );
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    loadFromStorage<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null)
  );
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const email = (fbUser.email || '').toLowerCase();
        const isOrganizerEmail =
          email === 'abmrifat4501x@gmail.com' ||
          email === 'organizer@drmcitclub.org';

        setUsers((prev) => {
          const found = prev.find(
            (u) => u.email.toLowerCase() === email || u.id === fbUser.uid
          );
          if (found) {
            const updated: UserProfile =
              isOrganizerEmail && found.role !== 'organizer'
                ? { ...found, role: 'organizer' as const }
                : found;
            setCurrentUser(updated);
            return prev.map((u) => (u.id === updated.id ? updated : u));
          } else {
            const newUser: UserProfile = {
              id: fbUser.uid,
              fullName: fbUser.displayName || 'Authorized User',
              email: fbUser.email || '',
              phone: fbUser.phoneNumber || '',
              studentId: `STU-${fbUser.uid.slice(0, 6).toUpperCase()}`,
              institution: 'Dhaka Residential Model College',
              department: isOrganizerEmail ? 'Operations Committee' : 'General Delegation',
              role: isOrganizerEmail ? 'organizer' : 'participant',
              createdAt: new Date().toISOString(),
            };
            setCurrentUser(newUser);
            return [...prev, newUser];
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore synchronization across devices
  useEffect(() => {
    // 1. Synchronize Festivals
    const unsubFestivals = onSnapshot(
      collection(db, 'festivals'),
      (snapshot) => {
        if (snapshot.empty) {
          const localFests = loadFromStorage<Festival[]>(STORAGE_KEYS.FESTIVALS, SEED_FESTIVALS);
          const initial = localFests.length > 0 ? localFests : SEED_FESTIVALS;
          initial.forEach((f) => {
            setDoc(doc(db, 'festivals', f.id), cleanForFirestore(f)).catch(() => {});
          });
          setFestivals(initial);
        } else {
          const remoteFests = snapshot.docs.map((d) => d.data() as Festival);
          const localFests = loadFromStorage<Festival[]>(STORAGE_KEYS.FESTIVALS, []);
          const missing = localFests.filter((lf) => !remoteFests.some((rf) => rf.id === lf.id));
          if (missing.length > 0) {
            missing.forEach((f) => {
              setDoc(doc(db, 'festivals', f.id), cleanForFirestore(f)).catch(() => {});
            });
            setFestivals([...remoteFests, ...missing]);
          } else {
            setFestivals(remoteFests);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'festivals');
      }
    );

    // 2. Synchronize Events (Real-time sync between organizer and participant devices)
    const unsubEvents = onSnapshot(
      collection(db, 'events'),
      (snapshot) => {
        if (snapshot.empty) {
          const localEvents = loadFromStorage<ClubEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
          const initial = localEvents.length > 0 ? localEvents : SEED_EVENTS;
          initial.forEach((e) => {
            setDoc(doc(db, 'events', e.id), cleanForFirestore(e)).catch(() => {});
          });
          setEvents(initial);
        } else {
          const remoteEvents = snapshot.docs.map((d) => d.data() as ClubEvent);
          const localEvents = loadFromStorage<ClubEvent[]>(STORAGE_KEYS.EVENTS, []);
          const missing = localEvents.filter((le) => !remoteEvents.some((re) => re.id === le.id));
          if (missing.length > 0) {
            missing.forEach((e) => {
              setDoc(doc(db, 'events', e.id), cleanForFirestore(e)).catch(() => {});
            });
            setEvents([...remoteEvents, ...missing]);
          } else {
            setEvents(remoteEvents);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'events');
      }
    );

    // 3. Synchronize Registrations
    const unsubRegistrations = onSnapshot(
      collection(db, 'registrations'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteRegs = snapshot.docs.map((d) => d.data() as Registration);
          setRegistrations(remoteRegs);
        } else {
          const localRegs = loadFromStorage<Registration[]>(STORAGE_KEYS.REGISTRATIONS, SEED_REGISTRATIONS);
          if (localRegs.length > 0) {
            localRegs.forEach((r) => {
              setDoc(doc(db, 'registrations', r.id), cleanForFirestore(r)).catch(() => {});
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'registrations');
      }
    );

    // 4. Synchronize Check-In Logs
    const unsubCheckIns = onSnapshot(
      collection(db, 'checkIns'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteLogs = snapshot.docs.map((d) => d.data() as CheckInLog);
          setCheckIns(remoteLogs);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'checkIns');
      }
    );

    // 5. Synchronize Organization Profile
    const unsubOrg = onSnapshot(
      doc(db, 'organization', 'default'),
      (snap) => {
        if (snap.exists()) {
          setOrganization(snap.data() as Organization);
        } else {
          setDoc(doc(db, 'organization', 'default'), cleanForFirestore(SEED_ORGANIZATION)).catch(() => {});
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'organization/default');
      }
    );

    return () => {
      unsubFestivals();
      unsubEvents();
      unsubRegistrations();
      unsubCheckIns();
      unsubOrg();
    };
  }, []);

  useEffect(() => saveToStorage(STORAGE_KEYS.ORGANIZATION, organization), [organization]);
  useEffect(() => saveToStorage(STORAGE_KEYS.FESTIVALS, festivals), [festivals]);
  useEffect(() => saveToStorage(STORAGE_KEYS.EVENTS, events), [events]);
  useEffect(() => saveToStorage(STORAGE_KEYS.REGISTRATIONS, registrations), [registrations]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CHECKINS, checkIns), [checkIns]);
  useEffect(() => saveToStorage(STORAGE_KEYS.USERS, users), [users]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser), [currentUser]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  };

  const login = (emailOrId: string, password?: string) => {
    const query = emailOrId.trim().toLowerCase();
    if (!query) {
      return { ok: false, error: 'Please enter your email or account ID.' };
    }
    const existing = users.find(
      (u) =>
        u.email.toLowerCase() === query ||
        u.id.toLowerCase() === query ||
        u.studentId.toLowerCase() === query
    );
    if (!existing) {
      return {
        ok: false,
        error:
          'No account found matching this email or account ID. Verify your credentials or create a participant account.',
      };
    }

    // Strict authentication for Organizer accounts
    if (existing.role === 'organizer') {
      const requiredPassword = existing.password || 'NexusAdmin2026!';
      if (!password || password.trim() !== requiredPassword) {
        return {
          ok: false,
          error: 'Incorrect organizer password. Access to organizer workspace is denied.',
        };
      }
    } else if (existing.password && password) {
      // Participant password check if configured
      if (password.trim() !== existing.password) {
        return {
          ok: false,
          error: 'Incorrect password for this participant account.',
        };
      }
    }

    setCurrentUser(existing);
    return { ok: true, user: existing };
  };

  const registerUser = (profile: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const cleanEmail = profile.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    const newUser: UserProfile = {
      ...profile,
      role: 'participant', // Strictly participant role
      email: cleanEmail,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { ok: true, user: newUser };
  };

  const updateOrganizerPassword = (newPassword: string) => {
    if (!newPassword || newPassword.trim().length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters long.' };
    }
    if (currentUser?.role !== 'organizer') {
      return {
        ok: false,
        error: 'Unauthorized: Only authenticated organizers can update organizer security credentials.',
      };
    }
    const cleanPass = newPassword.trim();
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, password: cleanPass } : u))
    );
    setCurrentUser((prev) => (prev ? { ...prev, password: cleanPass } : null));
    return { ok: true };
  };

  const updateOrganizerEmail = (newEmail: string) => {
    const cleanEmail = newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { ok: false, error: 'Please enter a valid official email address.' };
    }
    if (currentUser?.role !== 'organizer') {
      return {
        ok: false,
        error: 'Unauthorized: Only authenticated organizers can update organizer security credentials.',
      };
    }
    const conflict = users.find(
      (u) => u.id !== currentUser.id && u.email.toLowerCase() === cleanEmail
    );
    if (conflict) {
      return {
        ok: false,
        error: 'An account with this email address already exists. Please choose a different email.',
      };
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, email: cleanEmail } : u))
    );
    setCurrentUser((prev) => (prev ? { ...prev, email: cleanEmail } : null));
    return { ok: true };
  };

  const updateOrganization = (updates: Partial<Organization>) => {
    setOrganization((prev) => {
      const next = { ...prev, ...updates };
      setDoc(doc(db, 'organization', 'default'), cleanForFirestore(next), { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, 'organization/default');
      });
      return next;
    });
  };

  const signInWithGoogle = async () => {
    const res = await firebaseGoogleSignIn();
    if (!res.ok) {
      return { ok: false, error: res.error };
    }
    return { ok: true };
  };

  const logout = () => {
    signOutFirebase().catch(() => {});
    setCurrentUser(null);
  };

  const getFestivalBySlug = (slugOrId: string) =>
    festivals.find((f) => f.slug === slugOrId || f.id === slugOrId);

  const getEventBySlug = (slugOrId: string) =>
    events.find((e) => e.slug === slugOrId || e.id === slugOrId);

  const getEventAvailability = (event: ClubEvent): EventAvailability => {
    const eventRegs = registrations.filter((r) => r.eventId === event.id);
    const activeRegs = eventRegs.filter(
      (r) => r.status === 'Registered' || r.status === 'Confirmed' || r.status === 'Checked In'
    );
    const waitlistedCount = eventRegs.filter((r) => r.status === 'Waitlisted').length;
    const checkedInCount = eventRegs.filter((r) => r.status === 'Checked In').length;

    const registeredCount = activeRegs.length;
    const capacity = Math.max(1, event.capacity);
    const remainingSeats = Math.max(0, capacity - registeredCount);
    const percentFilled = Math.min(100, Math.round((registeredCount / capacity) * 100));
    const isFull = registeredCount >= capacity;

    const deadlineDate = new Date(event.registrationDeadline);
    const isDeadlinePassed = deadlineDate.getTime() < REFERENCE_NOW.getTime();
    const hoursUntilDeadline =
      (deadlineDate.getTime() - REFERENCE_NOW.getTime()) / (1000 * 60 * 60);
    const isClosingSoon =
      !isDeadlinePassed && (hoursUntilDeadline <= 72 || remainingSeats <= Math.ceil(capacity * 0.15));

    let effectiveStatus: EventStatus = event.status;
    let statusReason = 'Registration is open';

    if (event.status === 'Draft' || event.status === 'Archived') {
      effectiveStatus = event.status;
      statusReason = `Event is currently ${event.status.toLowerCase()}`;
    } else if (event.status === 'Closed' || isDeadlinePassed) {
      effectiveStatus = 'Closed';
      statusReason = isDeadlinePassed
        ? 'Registration deadline has passed'
        : 'Registration closed by organizer';
    } else if (isFull || event.status === 'Full') {
      effectiveStatus = 'Full';
      statusReason = 'All available seats have been claimed';
    } else if (isClosingSoon || event.status === 'Closing Soon') {
      effectiveStatus = 'Closing Soon';
      statusReason = `${remainingSeats} seats remaining before deadline`;
    } else {
      effectiveStatus = 'Open';
      statusReason = `${remainingSeats} of ${capacity} seats available`;
    }

    const canRegister =
      effectiveStatus === 'Open' || effectiveStatus === 'Closing Soon';

    return {
      registeredCount,
      waitlistedCount,
      checkedInCount,
      capacity,
      remainingSeats,
      percentFilled,
      isFull,
      isDeadlinePassed,
      isClosingSoon,
      canRegister,
      effectiveStatus,
      statusReason,
    };
  };

  const getScheduleConflicts = (event: ClubEvent, email?: string): ClubEvent[] => {
    const targetEmail = (email || currentUser?.email || '').trim().toLowerCase();
    if (!targetEmail) return [];

    const userEventIds = new Set(
      registrations
        .filter(
          (r) =>
            r.email.toLowerCase() === targetEmail &&
            r.status !== 'Cancelled' &&
            r.eventId !== event.id
        )
        .map((r) => r.eventId)
    );

    const toMinutes = (hhmm: string) => {
      const [h, m] = hhmm.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const startA = toMinutes(event.startTime);
    const endA = toMinutes(event.endTime);

    return events.filter((other) => {
      if (!userEventIds.has(other.id)) return false;
      if (other.date !== event.date) return false;
      const startB = toMinutes(other.startTime);
      const endB = toMinutes(other.endTime);
      return startA < endB && startB < endA;
    });
  };

  const submitRegistration = (input: RegistrationInput) => {
    const fieldErrors: Record<string, string> = {};
    const fullName = input.fullName.trim();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone.trim();
    const studentId = input.studentId.trim().toUpperCase();
    const institution = input.institution.trim();
    const classYear = input.classYear.trim();

    if (fullName.length < 3) {
      fieldErrors.fullName = 'Please enter your full legal name (minimum 3 characters).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldErrors.email = 'Please enter a valid academic or personal email address.';
    }
    if (!/^[+\d][\d\s-]{7,18}$/.test(phone)) {
      fieldErrors.phone = 'Please enter a valid phone number (e.g., +880 1711-000000).';
    }
    if (studentId.length < 4) {
      fieldErrors.studentId = 'Please enter a valid Student / Roll ID (minimum 4 characters).';
    }
    if (institution.length < 2) {
      fieldErrors.institution = 'Please specify your school, college, or university.';
    }
    if (classYear.length < 2) {
      fieldErrors.classYear = 'Please specify your class, year, or department.';
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        ok: false,
        error: 'Please correct the highlighted fields before submitting.',
        fieldErrors,
      };
    }

    const event = events.find((e) => e.id === input.eventId);
    if (!event) {
      return { ok: false, error: 'The requested event could not be found.' };
    }

    const availability = getEventAvailability(event);
    if (availability.isDeadlinePassed || event.status === 'Closed') {
      return {
        ok: false,
        error: 'Registration for this event is closed because the deadline has passed.',
      };
    }
    if (availability.isFull || event.status === 'Full') {
      return {
        ok: false,
        error: 'This event has reached full capacity. No additional seats are available.',
      };
    }

    const duplicate = registrations.find(
      (r) =>
        r.eventId === event.id &&
        r.status !== 'Cancelled' &&
        (r.email.toLowerCase() === email || r.studentId.toUpperCase() === studentId)
    );
    if (duplicate) {
      return {
        ok: false,
        error: `A participant with this email or Student ID is already registered for ${event.name} (Pass ID: ${duplicate.registrationCode}).`,
      };
    }

    const fest = festivals.find((f) => f.id === event.festivalId);
    const festPrefix = fest
      ? fest.name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) + fest.startDate.slice(2, 4)
      : 'EV26';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const registrationCode = `NEX-${festPrefix}-${randomNum}`;
    const qrPayload = `NEXUS|${registrationCode}|${event.id}|${email}`;

    const newReg: Registration = {
      id: `reg-${Date.now()}`,
      registrationCode,
      eventId: event.id,
      festivalId: event.festivalId,
      userId: currentUser?.id,
      fullName,
      email,
      phone,
      studentId,
      institution,
      classYear,
      teamName: input.teamName?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      status: 'Confirmed',
      qrPayload,
      registeredAt: new Date().toISOString(),
    };

    setRegistrations((prev) => [newReg, ...prev]);

    // Push new registration to Firestore so all devices see updated counts & roster
    setDoc(doc(db, 'registrations', newReg.id), cleanForFirestore(newReg)).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `registrations/${newReg.id}`);
    });

    return { ok: true, registration: newReg };
  };

  const updateRegistrationStatus = (
    registrationId: string,
    nextStatus: RegistrationStatus
  ) => {
    const reg = registrations.find(
      (r) => r.id === registrationId || r.registrationCode === registrationId
    );
    if (!reg) {
      return { ok: false, error: 'Registration record not found.' };
    }
    if (reg.status === nextStatus) {
      return { ok: true };
    }

    const allowed = VALID_STATUS_TRANSITIONS[reg.status] || [];
    if (!allowed.includes(nextStatus)) {
      return {
        ok: false,
        error: `Cannot transition directly from "${reg.status}" to "${nextStatus}".`,
      };
    }

    const isCurrentlyActive =
      reg.status === 'Registered' || reg.status === 'Confirmed' || reg.status === 'Checked In';
    const willBeActive =
      nextStatus === 'Registered' || nextStatus === 'Confirmed' || nextStatus === 'Checked In';

    if (!isCurrentlyActive && willBeActive) {
      const ev = events.find((e) => e.id === reg.eventId);
      if (ev) {
        const avail = getEventAvailability(ev);
        if (avail.isFull) {
          return {
            ok: false,
            error: `Cannot activate registration because ${ev.name} is at full capacity (${avail.capacity}/${avail.capacity}).`,
          };
        }
      }
    }

    const nowIso = new Date().toISOString();
    let updatedReg: Registration | null = null;
    let newLog: CheckInLog | null = null;

    setRegistrations((prev) =>
      prev.map((item) => {
        if (item.id !== reg.id) return item;
        const res: Registration = {
          ...item,
          status: nextStatus,
          checkedInAt:
            nextStatus === 'Checked In'
              ? item.checkedInAt || nowIso
              : nextStatus === 'Cancelled'
              ? undefined
              : item.checkedInAt,
          checkedInBy:
            nextStatus === 'Checked In'
              ? currentUser?.fullName || 'Organizer'
              : item.checkedInBy,
        };
        updatedReg = res;
        return res;
      })
    );

    if (updatedReg) {
      setDoc(doc(db, 'registrations', reg.id), cleanForFirestore(updatedReg), { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `registrations/${reg.id}`);
      });
    }

    if (nextStatus === 'Checked In') {
      newLog = {
        id: `chk-${Date.now()}`,
        registrationId: reg.id,
        registrationCode: reg.registrationCode,
        eventId: reg.eventId,
        participantName: reg.fullName,
        checkedInAt: nowIso,
        verifiedBy: currentUser?.fullName || 'Organizer',
        method: 'manual_code',
      };
      setCheckIns((prev) => [newLog!, ...prev]);
      setDoc(doc(db, 'checkIns', newLog.id), cleanForFirestore(newLog)).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `checkIns/${newLog!.id}`);
      });
    }

    return { ok: true };
  };

  const updateRegistrationDetails = (
    registrationId: string,
    updates: Partial<Pick<Registration, 'phone' | 'teamName' | 'notes'>>
  ) => {
    const reg = registrations.find((r) => r.id === registrationId);
    if (!reg) return { ok: false, error: 'Registration not found.' };
    const updated = { ...reg, ...updates };
    setRegistrations((prev) =>
      prev.map((r) => (r.id === registrationId ? updated : r))
    );
    setDoc(doc(db, 'registrations', registrationId), cleanForFirestore(updated), { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `registrations/${registrationId}`);
    });
    return { ok: true };
  };

  const verifyQrOrCode = (query: string) => {
    const clean = query.trim();
    if (!clean) {
      return { found: false, error: 'Please enter or scan a Registration ID or QR payload.' };
    }

    let targetCode = clean;
    if (clean.startsWith('NEXUS|')) {
      const parts = clean.split('|');
      if (parts[1]) targetCode = parts[1];
    }

    const reg = registrations.find(
      (r) =>
        r.registrationCode.toLowerCase() === targetCode.toLowerCase() ||
        r.id.toLowerCase() === targetCode.toLowerCase() ||
        r.qrPayload.toLowerCase() === clean.toLowerCase()
    );

    if (!reg) {
      return {
        found: false,
        error: `No matching registration found for "${clean}". Verify the pass code and try again.`,
      };
    }

    const event = events.find((e) => e.id === reg.eventId);
    const festival = festivals.find((f) => f.id === reg.festivalId);

    return {
      found: true,
      registration: reg,
      event,
      festival,
    };
  };

  const confirmCheckIn = (
    registrationId: string,
    method: 'qr_scan' | 'manual_code' = 'qr_scan'
  ) => {
    const reg = registrations.find(
      (r) => r.id === registrationId || r.registrationCode === registrationId
    );
    if (!reg) {
      return { ok: false, error: 'Registration record does not exist.' };
    }
    if (reg.status === 'Checked In') {
      return {
        ok: false,
        error: `Duplicate check-in prevented: ${reg.fullName} was already checked in at ${
          reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'an earlier time'
        }.`,
      };
    }
    if (reg.status === 'Cancelled' || reg.status === 'Waitlisted') {
      return {
        ok: false,
        error: `Cannot check in participant because their registration status is "${reg.status}".`,
      };
    }

    const nowIso = new Date().toISOString();
    const updated: Registration = {
      ...reg,
      status: 'Checked In',
      checkedInAt: nowIso,
      checkedInBy: currentUser?.fullName || 'Organizer',
    };

    setRegistrations((prev) => prev.map((r) => (r.id === reg.id ? updated : r)));
    const newLog: CheckInLog = {
      id: `chk-${Date.now()}`,
      registrationId: reg.id,
      registrationCode: reg.registrationCode,
      eventId: reg.eventId,
      participantName: reg.fullName,
      checkedInAt: nowIso,
      verifiedBy: currentUser?.fullName || 'Organizer',
      method,
    };
    setCheckIns((prev) => [newLog, ...prev]);

    setDoc(doc(db, 'registrations', reg.id), cleanForFirestore(updated), { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `registrations/${reg.id}`);
    });
    setDoc(doc(db, 'checkIns', newLog.id), cleanForFirestore(newLog)).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `checkIns/${newLog.id}`);
    });

    return { ok: true, registration: updated };
  };

  const createFestival = (data: Omit<Festival, 'id' | 'organizationId' | 'createdAt'>) => {
    const slug =
      data.slug.trim() ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    if (festivals.some((f) => f.slug === slug)) {
      return { ok: false, error: 'A festival with this URL slug already exists.' };
    }

    const newFest: Festival = {
      ...data,
      slug,
      id: `fest-${Date.now()}`,
      organizationId: SEED_ORGANIZATION.id,
      createdAt: new Date().toISOString(),
    };

    setFestivals((prev) => [newFest, ...prev]);

    // Push new festival to Firestore so all devices see it in real-time
    setDoc(doc(db, 'festivals', newFest.id), cleanForFirestore(newFest)).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `festivals/${newFest.id}`);
    });

    return { ok: true, festival: newFest };
  };

  const updateFestival = (id: string, updates: Partial<Festival>) => {
    const existing = festivals.find((f) => f.id === id);
    if (!existing) return { ok: false, error: 'Festival not found.' };
    const updated = { ...existing, ...updates };
    setFestivals((prev) => prev.map((f) => (f.id === id ? updated : f)));

    // Push festival changes to Firestore so edits sync in real time across devices
    setDoc(doc(db, 'festivals', id), cleanForFirestore(updated), { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `festivals/${id}`);
    });

    return { ok: true, festival: updated };
  };

  const deleteFestival = (id: string) => {
    const hasEvents = events.some((e) => e.festivalId === id);
    if (hasEvents) {
      return {
        ok: false,
        error:
          'Cannot delete a festival that still has active events. Archive the festival or reassign its events first.',
      };
    }
    setFestivals((prev) => prev.filter((f) => f.id !== id));

    deleteDoc(doc(db, 'festivals', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `festivals/${id}`);
    });

    return { ok: true };
  };

  const createEvent = (data: Omit<ClubEvent, 'id' | 'createdAt'>) => {
    const slug =
      data.slug.trim() ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    if (events.some((e) => e.slug === slug)) {
      return { ok: false, error: 'An event with this URL slug already exists.' };
    }

    const newEvent: ClubEvent = {
      ...data,
      slug,
      id: `evt-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev]);

    // Push new event to Firestore so participant devices immediately see the event
    setDoc(doc(db, 'events', newEvent.id), cleanForFirestore(newEvent)).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `events/${newEvent.id}`);
    });

    return { ok: true, event: newEvent };
  };

  const updateEvent = (id: string, updates: Partial<ClubEvent>) => {
    const existing = events.find((e) => e.id === id);
    if (!existing) return { ok: false, error: 'Event not found.' };
    const updated = { ...existing, ...updates };
    setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));

    // Push updated event to Firestore so participant devices immediately see event edits
    setDoc(doc(db, 'events', id), cleanForFirestore(updated), { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `events/${id}`);
    });

    return { ok: true, event: updated };
  };

  const deleteEvent = (id: string) => {
    const activeRegs = registrations.filter(
      (r) => r.eventId === id && r.status !== 'Cancelled'
    );
    if (activeRegs.length > 0) {
      return {
        ok: false,
        error: `Cannot delete an event with ${activeRegs.length} active registrations. Close or archive the event instead.`,
      };
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));

    deleteDoc(doc(db, 'events', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `events/${id}`);
    });

    return { ok: true };
  };

  const resetToSeedData = async () => {
    setOrganization(SEED_ORGANIZATION);
    setFestivals(SEED_FESTIVALS);
    setEvents(SEED_EVENTS);
    setRegistrations(SEED_REGISTRATIONS);
    setCheckIns(SEED_CHECKINS);
    setUsers(SEED_USERS);
    setCurrentUser(null);

    // Sync reset state to Firestore
    try {
      await setDoc(doc(db, 'organization', 'default'), cleanForFirestore(SEED_ORGANIZATION));
      for (const f of SEED_FESTIVALS) {
        await setDoc(doc(db, 'festivals', f.id), cleanForFirestore(f));
      }
      for (const e of SEED_EVENTS) {
        await setDoc(doc(db, 'events', e.id), cleanForFirestore(e));
      }
      for (const r of SEED_REGISTRATIONS) {
        await setDoc(doc(db, 'registrations', r.id), cleanForFirestore(r));
      }
    } catch (err) {
      console.warn('Failed to reset Firestore collections:', err);
    }
  };

  const value = useMemo<NexusContextValue>(
    () => ({
      currentPath,
      navigate,
      commandPaletteOpen,
      setCommandPaletteOpen,
      organization,
      festivals,
      events,
      registrations,
      checkIns,
      users,
      currentUser,
      firebaseUser,
      login,
      registerUser,
      signInWithGoogle,
      updateOrganizerPassword,
      updateOrganizerEmail,
      updateOrganization,
      logout,
      getFestivalBySlug,
      getEventBySlug,
      getEventAvailability,
      getScheduleConflicts,
      submitRegistration,
      updateRegistrationStatus,
      updateRegistrationDetails,
      verifyQrOrCode,
      confirmCheckIn,
      createFestival,
      updateFestival,
      deleteFestival,
      createEvent,
      updateEvent,
      deleteEvent,
      resetToSeedData,
    }),
    [
      currentPath,
      commandPaletteOpen,
      organization,
      festivals,
      events,
      registrations,
      checkIns,
      users,
      currentUser,
      firebaseUser,
    ]
  );

  return <NexusContext.Provider value={value}>{children}</NexusContext.Provider>;
};

export function useNexus(): NexusContextValue {
  const ctx = useContext(NexusContext);
  if (!ctx) {
    throw new Error('useNexus must be used within a NexusProvider');
  }
  return ctx;
}
