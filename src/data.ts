// Dummy case data for the Unified Forensic Timeline demo.
// Record text is copied verbatim from the live demo case; only the
// times of day are varied so records inside one day read in order.

export type Kind =
  | 'milestone'
  | 'message_in'
  | 'message_out'
  | 'evidence'
  | 'privileged'
  | 'audit'

export type PhaseKey =
  | 'received'
  | 'acknowledged'
  | 'evidence'
  | 'analysis'
  | 'par'
  | 'closed'

export interface Actor {
  name: string
  type: 'staff' | 'reporter' | 'system'
}

export interface EvidenceFile {
  name: string
  size: string
}

export interface TimelineRecord {
  id: string
  kind: Kind
  /** Plain-language summary of what happened. */
  headline: string
  /** Original record title from the platform. */
  title: string
  /** Original record text from the platform, kept verbatim. */
  body: string
  actor: Actor
  /** Local ISO timestamp. */
  at: string
  file?: EvidenceFile
  /** The chapter of the case this record belongs to. */
  phase: PhaseKey
}

const leadInvestigator: Actor = { name: 'Lead Investigator', type: 'staff' }
const financialAuditor: Actor = { name: 'Financial Auditor', type: 'staff' }
const investigationTeam: Actor = { name: 'Investigation Team', type: 'staff' }
const reporter: Actor = { name: 'Reporter', type: 'reporter' }
const reporterEmail: Actor = { name: 'vendor_anon99@protonmail.com', type: 'reporter' }
const system: Actor = { name: 'System', type: 'system' }

export const caseInfo = {
  id: 'TARI-ACME-001',
  title: 'Procurement kickbacks from IT vendors',
  client: 'Acme Industries',
  channel: 'Email',
  status: 'Closed',
  openedAt: '2026-08-08T09:14:00',
}

export interface Phase {
  key: PhaseKey
  /** Short name used in the lifecycle strip. */
  short: string
  title: string
  summary: string
}

export const phases: Phase[] = [
  {
    key: 'received',
    short: 'Report received',
    title: 'Report received',
    summary:
      'A vendor emailed an allegation that the Procurement Director demands 5% kickbacks, with a voicemail recording attached. The case was opened.',
  },
  {
    key: 'acknowledged',
    short: 'Acknowledged',
    title: 'Acknowledgement and legal hold',
    summary:
      "The reporter was acknowledged, the company was informed without revealing their identity, and a legal hold was placed on the Director's records.",
  },
  {
    key: 'evidence',
    short: 'Evidence gathering',
    title: 'Evidence gathering',
    summary:
      'Investigators asked the reporter for more detail. The reporter shared offshore SWIFT codes, and forensic accounting traced the kickbacks to a Cayman shell company.',
  },
  {
    key: 'analysis',
    short: 'Interview and analysis',
    title: 'Interview and analysis',
    summary:
      'External counsel was retained to interview the Director. The evidence was analysed and the Director confessed.',
  },
  {
    key: 'par',
    short: 'PAR shared',
    title: 'Preliminary assessment report (PAR)',
    summary:
      'The PAR was prepared with recommendations and shared with the client organisation.',
  },
  {
    key: 'closed',
    short: 'Closed',
    title: 'Case closed',
    summary: 'The complaint was closed after the PAR was submitted.',
  },
]

export const records: TimelineRecord[] = [
  {
    id: 'r01',
    phase: 'received',
    headline: 'Case created automatically from the email',
    kind: 'audit',
    title: 'System Audit Record',
    body: 'Case automatically created from Email intake.',
    actor: system,
    at: '2026-08-08T09:14:00',
  },
  {
    id: 'r02',
    phase: 'received',
    headline: 'Reporter uploaded a voicemail recording',
    kind: 'evidence',
    title: 'Evidence Uploaded',
    body: 'File: vendor_voicemail_recording.mp3 (3.1 MB). Chain of custody logged.',
    actor: reporter,
    at: '2026-08-08T09:14:30',
    file: { name: 'vendor_voicemail_recording.mp3', size: '3.1 MB' },
  },
  {
    id: 'r03',
    phase: 'received',
    headline: 'Reporter described the kickback scheme',
    kind: 'message_in',
    title: 'Secure Message (Incoming)',
    body: 'Procurement Director has been systematically demanding 5% kickbacks from IT vendors in exchange for guaranteed contract renewals. I have attached the ledger anomalies and a recorded conversation.',
    actor: reporter,
    at: '2026-08-08T09:15:00',
  },
  {
    id: 'r04',
    phase: 'received',
    headline: "Case opened from the reporter's email",
    kind: 'milestone',
    title: 'Case Initiated',
    body: 'Report securely submitted via Email.',
    actor: reporterEmail,
    at: '2026-08-08T09:21:00',
  },
  {
    id: 'r05',
    phase: 'acknowledged',
    headline: 'Legal hold sent to the IT department',
    kind: 'audit',
    title: 'System Audit Record',
    body: 'Legal/Spoliation hold issued to IT department.',
    actor: leadInvestigator,
    at: '2026-08-09T10:02:00',
  },
  {
    id: 'r06',
    phase: 'acknowledged',
    headline: 'Reporter acknowledged and company informed',
    kind: 'audit',
    title: 'System Audit Record',
    body: 'Acknowledged to the complainant and company is informed about the complaint (identity withheld).',
    actor: leadInvestigator,
    at: '2026-08-09T10:05:00',
  },
  {
    id: 'r07',
    phase: 'acknowledged',
    headline: "Legal hold placed on the Director's emails, Slack and ERP logs",
    kind: 'privileged',
    title: 'Internal Investigation Note',
    body: 'LEGAL HOLD ISSUED: I have instructed IT to place a comprehensive litigation spoliation hold on all emails, Slack messages, and ERP logs for the Procurement Director.',
    actor: leadInvestigator,
    at: '2026-08-09T10:30:00',
  },
  {
    id: 'r08',
    phase: 'evidence',
    headline: 'Investigators started a conversation with the reporter',
    kind: 'audit',
    title: 'System Audit Record',
    body: 'Conversation with the complainant is commenced and additional information and evidence is sought.',
    actor: leadInvestigator,
    at: '2026-08-10T11:40:00',
  },
  {
    id: 'r09',
    phase: 'evidence',
    headline: 'Investigator asked for the offshore account details',
    kind: 'message_out',
    title: 'Secure Message (Outgoing)',
    body: 'We take these allegations extremely seriously. We have invoked a legal hold to preserve all evidence. Can you securely provide the offshore account routing details?',
    actor: leadInvestigator,
    at: '2026-08-10T11:42:00',
  },
  {
    id: 'r10',
    phase: 'evidence',
    headline: 'Upload logged for offshore_swift_codes.pdf',
    kind: 'audit',
    title: 'System Audit Record',
    body: 'Evidence file uploaded: offshore_swift_codes.pdf (Chain of Custody logged)',
    actor: system,
    at: '2026-08-13T16:05:00',
  },
  {
    id: 'r11',
    phase: 'evidence',
    headline: 'Reporter uploaded the offshore SWIFT codes',
    kind: 'evidence',
    title: 'Evidence Uploaded',
    body: 'File: offshore_swift_codes.pdf (1.2 MB). Chain of custody logged.',
    actor: reporter,
    at: '2026-08-13T16:05:30',
    file: { name: 'offshore_swift_codes.pdf', size: '1.2 MB' },
  },
  {
    id: 'r12',
    phase: 'evidence',
    headline: 'Reporter named the shell company, Apex Consulting',
    kind: 'message_in',
    title: 'Secure Message (Incoming)',
    body: "Attached the offshore swift codes. The bank is in the Cayman Islands. They are routing it through a shell company called 'Apex Consulting'.",
    actor: reporter,
    at: '2026-08-13T16:06:00',
  },
  {
    id: 'r13',
    phase: 'evidence',
    headline: 'Auditor confirmed receipt and asked for confidentiality',
    kind: 'message_out',
    title: 'Secure Message (Outgoing)',
    body: 'Received. Our forensic accounting team is mapping the SWIFT routes against our ERP ledgers. Please do not discuss this with anyone.',
    actor: financialAuditor,
    at: '2026-08-15T09:48:00',
  },
  {
    id: 'r14',
    phase: 'evidence',
    headline: 'Upload logged for erp_ledger_export_Q3.csv',
    kind: 'audit',
    title: 'System Audit Record',
    body: 'Evidence file uploaded: erp_ledger_export_Q3.csv (Chain of Custody logged)',
    actor: system,
    at: '2026-08-16T14:20:00',
  },
  {
    id: 'r15',
    phase: 'evidence',
    headline: 'Auditor uploaded the Q3 ERP ledger export',
    kind: 'evidence',
    title: 'Evidence Uploaded',
    body: 'File: erp_ledger_export_Q3.csv (4.8 MB). Chain of custody logged.',
    actor: financialAuditor,
    at: '2026-08-16T14:20:30',
    file: { name: 'erp_ledger_export_Q3.csv', size: '4.8 MB' },
  },
  {
    id: 'r16',
    phase: 'evidence',
    headline: 'Forensic accounting confirmed the kickbacks',
    kind: 'privileged',
    title: 'Internal Investigation Note',
    body: 'Forensic accounting confirms the kickback structure. The invoices were inflated exactly 5% over MSRP, and the delta was wired to the Cayman shell company.',
    actor: financialAuditor,
    at: '2026-08-16T17:35:00',
  },
  {
    id: 'r17',
    phase: 'evidence',
    headline: 'Reporter asked whether to record the next meeting',
    kind: 'message_in',
    title: 'Secure Message (Incoming)',
    body: 'Understood. I will lay low. The director is asking for another meeting next week. Should I record it?',
    actor: reporter,
    at: '2026-08-18T20:12:00',
  },
  {
    id: 'r18',
    phase: 'evidence',
    headline: 'Investigator advised the reporter not to record',
    kind: 'message_out',
    title: 'Secure Message (Outgoing)',
    body: 'Under advice of counsel, please DO NOT actively record further conversations, as this may violate state two-party consent laws. We have enough evidence to proceed internally.',
    actor: leadInvestigator,
    at: '2026-08-19T08:30:00',
  },
  {
    id: 'r19',
    phase: 'analysis',
    headline: 'External counsel retained to interview the Director',
    kind: 'privileged',
    title: 'Internal Investigation Note',
    body: 'PRIVILEGED: External counsel (Baker McKenzie) has been retained. They will conduct the formal interview with the Director tomorrow under Upjohn warnings.',
    actor: leadInvestigator,
    at: '2026-08-28T15:10:00',
  },
  {
    id: 'r20',
    phase: 'analysis',
    headline: 'Complaint and evidence analysed',
    kind: 'audit',
    title: 'System Audit Record',
    body: 'Complaint and evidence is analyzed.',
    actor: leadInvestigator,
    at: '2026-09-02T12:00:00',
  },
  {
    id: 'r21',
    phase: 'analysis',
    headline: 'Director confessed during the interview',
    kind: 'privileged',
    title: 'Internal Investigation Note',
    body: 'Director confessed during interview. Drafting PAR and preparing DOJ disclosure for FCPA violations.',
    actor: leadInvestigator,
    at: '2026-09-16T18:45:00',
  },
  {
    id: 'r22',
    phase: 'par',
    headline: 'Assessment report (PAR) generated and shared',
    kind: 'milestone',
    title: 'Preliminary Assessment Report (PAR) Generated',
    body: 'Formal assessment report finalized and shared with the client organization.',
    actor: investigationTeam,
    at: '2026-09-17T10:15:00',
  },
  {
    id: 'r23',
    phase: 'par',
    headline: 'PAR prepared with recommendations',
    kind: 'audit',
    title: 'System Audit Record',
    body: 'Preliminary assessment report (PAR) is prepared with recommendations on how to address the complaint and shared with the company.',
    actor: leadInvestigator,
    at: '2026-09-17T10:20:00',
  },
  {
    id: 'r24',
    phase: 'closed',
    headline: 'Case closed',
    kind: 'audit',
    title: 'System Audit Record',
    body: 'Complaint is closed from TAC after submission of PAR.',
    actor: leadInvestigator,
    at: '2026-09-20T11:00:00',
  },
]
