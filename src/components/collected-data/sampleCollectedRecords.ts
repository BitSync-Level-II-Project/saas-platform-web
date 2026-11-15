import type {
  CollectedRecordSummary,
} from './collectedDataTypes'

const sampleEvidenceUrl =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg"
         width="800" height="360" viewBox="0 0 800 360">
      <rect width="800" height="360" fill="#f6f7fb"/>
      <rect x="24" y="24" width="752" height="312"
            rx="16" fill="white" stroke="#dce1ed"/>
      <text x="400" y="95" text-anchor="middle"
            font-family="Arial" font-size="22" fill="#727b95">
        DEMO EVIDENCE
      </text>
      <text x="400" y="205" text-anchor="middle"
            font-family="Arial" font-size="72" fill="#20223d">
        82.0 °C
      </text>
      <text x="400" y="285" text-anchor="middle"
            font-family="Arial" font-size="18" fill="#727b95">
        Illustration only — not a captured image
      </text>
    </svg>
  `)
export const sampleCollectedRecords: CollectedRecordSummary[] = [
  {
    id: 'SUB-2081',
    taskId: 'TSK-1042',
    templateId: 'TMP-04',
    templateVersion: 1,
    templateName: 'Equipment inspection',
    warehouse: 'Colombo warehouse',
    location: 'Machine room',
    submittedBy: 'Kavindu Silva',
    source: 'worker',
    submittedAt: '2026-11-06T09:23:00+05:30',
    receivedAt: '2026-11-06T09:24:00+05:30',
    reviewStatus: 'pending',
    answers: [
      {
        fieldId: 'equipment-code',
        label: 'Equipment code',
        value: 'EQ-102',
      },
      {
        fieldId: 'condition',
        label: 'Condition',
        value: 'Needs attention',
      },
      {
        fieldId: 'temperature',
        label: 'Temperature',
        value: '82 °C',
      },
    ],
    evidence: [
      {
        id: 'EVD-001',
        label: 'Meter display — demo illustration',
        url: sampleEvidenceUrl,
      },
    ],
  },
  {
    id: 'SUB-2080',
    taskId: 'TSK-1041',
    templateId: 'TMP-03',
    templateVersion: 1,
    templateName: 'Loading bay safety',
    warehouse: 'Colombo warehouse',
    location: 'Loading bay',
    submittedBy: 'Amaya Fernando',
    source: 'worker',
    submittedAt: '2026-11-06T09:10:00+05:30',
    receivedAt: '2026-11-06T09:12:00+05:30',
    reviewStatus: 'approved',
    answers: [
      {
        fieldId: 'bay-code',
        label: 'Loading bay',
        value: 'BAY-02',
      },
      {
        fieldId: 'access-clear',
        label: 'Access clear',
        value: 'Yes',
      },
    ],
    evidence: [],
  },
  {
    id: 'SUB-2077',
    taskId: 'TSK-1038',
    templateId: 'TMP-02',
    templateVersion: 1,
    templateName: 'Stock condition',
    warehouse: 'Galle warehouse',
    location: 'Storage aisle A',
    submittedBy: 'Nimal Fernando',
    source: 'worker',
    submittedAt: '2026-11-06T08:55:00+05:30',
    receivedAt: '2026-11-06T08:58:00+05:30',
    reviewStatus: 'recheck-requested',
    answers: [
      {
        fieldId: 'product-code',
        label: 'Product code',
        value: 'PRD-104',
      },
      {
        fieldId: 'package-condition',
        label: 'Package condition',
        value: 'Needs review',
      },
    ],
    evidence: [],
  },
]