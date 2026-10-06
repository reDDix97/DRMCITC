import { ClubEvent, Festival, Registration } from '../types/nexus';

/**
 * Generates a deterministic 25x25 QR-style matrix from a payload string.
 * Includes standard 7x7 finder patterns at three corners, 5x5 alignment pattern,
 * timing lines, and high-density encoded payload cells.
 */
export function generateQrMatrix(payload: string): boolean[][] {
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );
  const reserved: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );

  const placeFinderPattern = (rowOffset: number, colOffset: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = rowOffset + r;
        const cc = colOffset + c;
        if (rr >= 0 && rr < size && cc >= 0 && cc < size) {
          reserved[rr][cc] = true;
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
            const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            matrix[rr][cc] = isBorder || isInner;
          } else {
            matrix[rr][cc] = false;
          }
        }
      }
    }
  };

  placeFinderPattern(0, 0);
  placeFinderPattern(0, size - 7);
  placeFinderPattern(size - 7, 0);

  // Alignment pattern at (16, 16)
  for (let r = 16; r <= 20; r++) {
    for (let c = 16; c <= 20; c++) {
      reserved[r][c] = true;
      const isBorder = r === 16 || r === 20 || c === 16 || c === 20;
      const isCenter = r === 18 && c === 18;
      matrix[r][c] = isBorder || isCenter;
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    reserved[6][i] = true;
    reserved[i][6] = true;
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Deterministic hash stream from payload
  let seed = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    seed ^= payload.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }

  let state = seed >>> 0;
  const nextBit = (r: number, c: number) => {
    const charCode = payload.charCodeAt((r * size + c) % payload.length) || 73;
    state ^= (state << 13) ^ charCode;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) + r * 31 + c * 17) % 100 < 52;
  };

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c]) {
        matrix[r][c] = nextBit(r, c);
      }
    }
  }

  return matrix;
}

/**
 * Generates and downloads an RFC 5545 compliant .ics calendar invite file.
 */
export function downloadEventIcs(
  event: ClubEvent,
  festival?: Festival,
  registration?: Registration
): void {
  const dateClean = event.date.replace(/-/g, '');
  const startClean = event.startTime.replace(':', '') + '00';
  const endClean = event.endTime.replace(':', '') + '00';

  const dtStart = `${dateClean}T${startClean}`;
  const dtEnd = `${dateClean}T${endClean}`;
  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const summary = `${event.name}${festival ? ` — ${festival.name}` : ''}`;
  const passDetails = registration
    ? `\\nRegistration ID: ${registration.registrationCode}\\nParticipant: ${registration.fullName} (${registration.studentId})\\nStatus: ${registration.status}`
    : '';
  const description = `${event.shortSummary}\\n\\nVenue: ${event.venue}${passDetails}\\n\\nManaged via NEXUS Smart Club Operations (DRMC IT Club).`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DRMC IT Club//NEXUS Smart Club Operations//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}-${registration?.registrationCode || 'public'}@nexus.drmcitclub.org`,
    `DTSTAMP:${nowStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `LOCATION:${event.venue}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.slug}-calendar.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports participant registrations to a downloadable CSV file.
 */
export function exportParticipantsToCsv(
  registrations: Registration[],
  eventsMap: Record<string, ClubEvent>,
  festivalsMap: Record<string, Festival>
): void {
  const headers = [
    'Registration ID',
    'Participant Name',
    'Email',
    'Phone',
    'Student ID',
    'Institution',
    'Class/Year',
    'Team Name',
    'Event',
    'Festival',
    'Status',
    'Registered At',
    'Checked In At',
  ];

  const escapeCsv = (val: string | undefined) => {
    if (!val) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
  };

  const rows = registrations.map((r) => {
    const ev = eventsMap[r.eventId];
    const fest = festivalsMap[r.festivalId];
    return [
      escapeCsv(r.registrationCode),
      escapeCsv(r.fullName),
      escapeCsv(r.email),
      escapeCsv(r.phone),
      escapeCsv(r.studentId),
      escapeCsv(r.institution),
      escapeCsv(r.classYear),
      escapeCsv(r.teamName || ''),
      escapeCsv(ev?.name || r.eventId),
      escapeCsv(fest?.name || r.festivalId),
      escapeCsv(r.status),
      escapeCsv(r.registeredAt),
      escapeCsv(r.checkedInAt || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `nexus-participants-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const exportRegistrationsCsv = exportParticipantsToCsv;

