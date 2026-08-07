# CloudSync — Product Reference

## Overview

CloudSync is a real-time file and data synchronisation platform that keeps content consistent across cloud storage providers, on-premise systems, and end-user devices. It supports conflict resolution, selective sync, bandwidth throttling, and granular permission controls.

**Current stable version:** 2.5.0  
**Previous stable version:** 2.4.1  
**Deprecated (EOL 2025-09-30):** 2.2.x and below

---

## Core Modules

### File Sync

Bidirectional sync between configured endpoints. Supports Amazon S3, Azure Blob, Google Cloud Storage, on-premise NAS, and desktop clients (Windows, macOS).

**Sync modes:**
- `realtime` — changes propagate within seconds (requires persistent connection)
- `scheduled` — sync runs on a cron schedule (minimum every 5 minutes)
- `manual` — sync triggered via API or UI action

**Configuration options:**
- `include_patterns` — glob patterns for files to include (e.g., `**/*.csv`)
- `exclude_patterns` — glob patterns to exclude (e.g., `**/.DS_Store`, `**/node_modules`)
- `max_file_size_mb` — files above this limit are skipped (default: 500)
- `versioning` — keep last N versions per file (default: 10, max: 100)

### Conflict Resolution

When the same file is modified on two endpoints before a sync cycle completes, a conflict is created.

**Resolution strategies:**
- `newest_wins` — most recent modification timestamp takes precedence
- `source_wins` — the designated "primary" endpoint always wins
- `manual` — conflict is held in queue for human review
- `fork` — both versions kept; conflicted copy created with timestamp suffix

Conflicts are visible at: Settings → Sync → Conflicts.  
Unresolved conflicts older than 30 days trigger an alert to the account admin.

### Permissions

File-level and folder-level permissions are enforced independently of the underlying storage provider's permissions.

**Permission levels:**
- `read` — can download/view
- `write` — can upload and modify
- `admin` — can change permissions, delete, and manage shares

**SSO integration:** CloudSync respects group memberships from Okta, Azure AD, and Google Workspace. Group sync runs every 15 minutes.

**Known limitation:** Permission changes made directly in the underlying storage provider (e.g., AWS IAM) are not reflected in CloudSync until the next sync cycle. Always manage permissions through CloudSync for consistent enforcement.

### Bandwidth Limits

To avoid saturating network links, configure bandwidth throttling per sync job.

- `upload_limit_mbps` and `download_limit_mbps` (0 = unlimited)
- Throttling schedules allow different limits by time of day (e.g., reduced during business hours)
- Network path: Settings → Sync Jobs → [job] → Bandwidth

### Integrations

CloudSync integrates with Slack (sync status notifications), PagerDuty (critical alert routing), Jira (attach synced files to tickets), and Salesforce (sync customer documents to account records).

---

## Common Support Scenarios

### Sync has stopped / files not updating

1. Check the sync job status at Settings → Sync Jobs. Look for `STALLED` or `ERROR` state.
2. Inspect the job log — most common causes:
   - Expired credentials for the destination storage provider
   - File above `max_file_size_mb` blocking the queue
   - Network timeout (`ERR_CONNECTION_TIMEOUT`)
3. Restart the job: Sync Jobs → [job] → Actions → Force Sync.
4. If using `realtime` mode, verify the persistent connection is healthy (green dot in the UI).

### Conflict storm after bulk upload

If many files were uploaded offline and synced simultaneously:
1. Switch the job temporarily to `manual` mode.
2. Download the conflict report: Sync Jobs → [job] → Export Conflicts.
3. Resolve conflicts in bulk using the API: `POST /v2/conflicts/resolve` with strategy in payload.
4. Re-enable the original sync mode.

### New users cannot access synced files

1. Confirm the user's group membership is correct in the IDP (Okta/Azure AD/Google).
2. Wait up to 15 minutes for the group sync cycle, or force a manual group sync: Settings → Integrations → [IDP] → Sync Now.
3. Verify the user has been assigned the correct permission level in CloudSync (not just in the IDP).
4. Check if `SSO_GROUP_NOT_FOUND` appears in audit logs — this means the group name in CloudSync does not match the IDP group name exactly (case-sensitive).

---

## Pricing & Limits by Plan

| Feature | Starter | Professional | Business | Enterprise |
|---------|---------|--------------|----------|------------|
| Storage synced | 100 GB | 1 TB | 10 TB | Unlimited |
| Sync endpoints | 2 | 10 | 50 | Unlimited |
| File versioning | 5 versions | 25 versions | 100 versions | Unlimited |
| Bandwidth throttling | No | Yes | Yes | Yes |
| Support SLA | 48h | 24h | 8h | 2h |
