# Firestore Security Specification - NEXUS Smart Club Operations

## Phase 0: Data Invariants & Zero-Trust Security Posture

### 1. Data Invariants
1. **Festivals**: Must have a valid ID matching `^[a-zA-Z0-9_\-]+$`, name, slug, start date, and status. Only authorized organizers can create or modify festivals. Public users can only read published festivals.
2. **Club Events**: Must belong to an existing festival. Capacity must be a positive number. Only organizers can modify events.
3. **Registrations**: Must belong to an existing event and festival. Registrations cannot exceed event capacity. Email must be valid. A participant can cancel their own registration; organizers can update statuses (e.g. Confirm, Waitlist, Check In).
4. **Check-In Logs**: An attendance log cannot be created without a valid registration and event ID. Only organizers and check-in desk operators can write check-in records.
5. **Users**: Users can read and update their own profile; cannot self-elevate `role` to `organizer`. Initial bootstrap organizer is protected.
6. **Organization Profile**: Readable publicly, updatable only by authenticated organizers.

### 2. The Dirty Dozen Malicious Payloads (Permission Denied Tests)
1. **Ghost Field Injection**: Adding `{ "isAdmin": true, "shadowRole": "superadmin" }` to a Festival update.
2. **Path Traversal / Long ID**: Attempting to create a Festival with an ID > 128 characters or illegal characters `../../root`.
3. **Capacity Overflow**: Creating an event with negative or non-numeric capacity.
4. **Orphaned Event**: Creating an event referencing a non-existent `festivalId`.
5. **Self-Role Escalation**: Participant updating their own `role` field from `"participant"` to `"organizer"`.
6. **Unauthenticated Festival Modification**: Unauthenticated user attempting to edit a festival banner or schedule.
7. **Cross-Tenant Registration Hijack**: User A attempting to delete or overwrite User B's registration pass.
8. **Forged Check-In**: Non-organizer pushing arbitrary CheckInLog documents into `/checkIns`.
9. **Fake Email Spoofing**: Attempting write operations with an unverified email claiming admin privileges.
10. **Huge Payload / Denial of Wallet**: Writing a 2MB string into `description` or `rules`.
11. **Client Delegation Bypass**: Attempting a blanket query scrape without filtering by owned registrations.
12. **Status Short-circuit**: Setting registration status to illegal status values.
