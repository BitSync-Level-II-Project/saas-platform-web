import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Database,
  Eye,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Smartphone,
  Sliders,
  Trash2,
  X,
  ChevronRight,
  ChevronDown,
  AlertOctagon,
  Info,
  Check,
  Zap,
  Radio,
  FileText,
  Sliders as SlidersIcon,
  Layers,
  ArrowRight,
  History,
  Lock,
  Cpu,
  Server
} from 'lucide-react';

// ==========================================
// TYPES & CONSTANTS
// ==========================================

const SEVERITIES = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const ALERT_STATUSES = ['NEW', 'ACKNOWLEDGED', 'RESOLVED', 'ESCALATED'];
const OPERATORS = [
  { value: 'GT', label: '>' },
  { value: 'GTE', label: '>=' },
  { value: 'LT', label: '<' },
  { value: 'LTE', label: '<=' },
  { value: 'EQ', label: '==' },
  { value: 'NEQ', label: '!=' },
  { value: 'BETWEEN', label: 'Between' },
];

// ==========================================
// INITIAL MOCK DATA
// ==========================================

const INITIAL_RULES = [
  {
    id: 'rule-001',
    name: 'Stamping Press High Temp',
    description: 'Triggers critical alert when press main bearing exceeds safety limits',
    siteId: 'site-main',
    siteName: 'Main Plant Colombo',
    locationId: 'loc-press1',
    locationName: 'Stamping Press 1',
    templateId: 'tmpl-press-insp',
    fieldKey: 'temperature',
    operator: 'GT',
    thresholdValue: 80,
    severity: 'CRITICAL',
    enabled: true,
    cooldownMinutes: 1,
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'rule-002',
    name: 'High Ambient Noise Level',
    description: 'Monitors workplace acoustic safety thresholds',
    siteId: 'site-main',
    siteName: 'Main Plant Colombo',
    locationId: 'loc-machine-room',
    locationName: 'Machine Room B',
    templateId: 'tmpl-audio-mon',
    fieldKey: 'soundDb',
    operator: 'GT',
    thresholdValue: 85,
    severity: 'HIGH',
    enabled: true,
    cooldownMinutes: 15,
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'rule-003',
    name: 'Stationed Device Low Battery',
    description: 'Alerts supervisor when stationed edge phone battery dips below operational range',
    siteId: 'site-galle',
    siteName: 'Galle Warehouse',
    locationId: 'loc-loading',
    locationName: 'Loading Bay A',
    templateId: 'tmpl-sys-mon',
    fieldKey: 'battery',
    operator: 'LT',
    thresholdValue: 20,
    severity: 'MEDIUM',
    enabled: true,
    cooldownMinutes: 30,
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'rule-004',
    name: 'Hydraulic Pressure Variance',
    description: 'Ensures hydraulic pressure stays within normal calibrated operating bounds',
    siteId: 'site-main',
    siteName: 'Main Plant Colombo',
    locationId: 'loc-press1',
    locationName: 'Stamping Press 1',
    templateId: 'tmpl-press-insp',
    fieldKey: 'pressurePsi',
    operator: 'BETWEEN',
    thresholdValue: 100,
    thresholdMax: 250,
    severity: 'HIGH',
    enabled: false,
    cooldownMinutes: 10,
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  }
];

const INITIAL_EVENTS = [
  {
    id: 'evt-101',
    sourceType: 'STATIONED_TELEMETRY',
    deviceId: 'dev-phone-01',
    deviceName: 'Stationed Phone - Press 1',
    siteId: 'site-main',
    siteName: 'Main Plant Colombo',
    locationId: 'loc-press1',
    locationName: 'Stamping Press 1',
    payload: { temperature: 85.4, pressurePsi: 180, soundDb: 72 },
    occurredAt: new Date(Date.now() - 1000 * 180).toISOString(),
    status: 'PROCESSED',
    alertsCreated: ['alt-501']
  },
  {
    id: 'evt-102',
    sourceType: 'FIELD_SUBMISSION',
    userId: 'usr-kavindu',
    userName: 'Kavindu (Worker)',
    siteId: 'site-main',
    siteName: 'Main Plant Colombo',
    locationId: 'loc-machine-room',
    locationName: 'Machine Room B',
    payload: { temperature: 74.2, soundDb: 88.5, vibrationMm: 1.2 },
    occurredAt: new Date(Date.now() - 1000 * 450).toISOString(),
    status: 'PROCESSED',
    alertsCreated: ['alt-502']
  },
  {
    id: 'evt-103',
    sourceType: 'HEARTBEAT',
    deviceId: 'dev-phone-02',
    deviceName: 'Stationed Phone - Galle Bay',
    siteId: 'site-galle',
    siteName: 'Galle Warehouse',
    locationId: 'loc-loading',
    locationName: 'Loading Bay A',
    payload: { battery: 18, network: 'WIFI', appForeground: true, queueSize: 0 },
    occurredAt: new Date(Date.now() - 1000 * 900).toISOString(),
    status: 'PROCESSED',
    alertsCreated: ['alt-503']
  },
  {
    id: 'evt-104',
    sourceType: 'FIELD_SUBMISSION',
    userId: 'usr-kavindu',
    userName: 'Kavindu (Worker)',
    siteId: 'site-main',
    siteName: 'Main Plant Colombo',
    locationId: 'loc-press1',
    locationName: 'Stamping Press 1',
    payload: { temperature: 78.0, pressurePsi: 210 },
    occurredAt: new Date(Date.now() - 1000 * 1800).toISOString(),
    status: 'PROCESSED',
    alertsCreated: []
  },
  {
    id: 'evt-105',
    sourceType: 'STATIONED_TELEMETRY',
    deviceId: 'dev-phone-01',
    deviceName: 'Stationed Phone - Press 1',
    siteId: 'site-main',
    siteName: 'Main Plant Colombo',
    locationId: 'loc-press1',
    locationName: 'Stamping Press 1',
    payload: { temperature: 'INVALID_NUMERIC' },
    occurredAt: new Date(Date.now() - 1000 * 3600).toISOString(),
    status: 'FAILED',
    error: 'Payload parse error: temperature parameter is not a numeric value',
    alertsCreated: []
  }
];

const INITIAL_ALERTS = [
  {
    id: 'alt-501',
    title: 'Stamping Press High Temp Exceeded',
    message: 'Field temperature recorded 85.4°C exceeding safety limit threshold of 80°C.',
    severity: 'CRITICAL',
    status: 'NEW',
    ruleId: 'rule-001',
    eventId: 'evt-101',
    siteName: 'Main Plant Colombo',
    locationName: 'Stamping Press 1',
    deviceName: 'Stationed Phone - Press 1',
    escalationLevel: 0,
    createdAt: new Date(Date.now() - 1000 * 180).toISOString(),
    actions: [
      { id: 'act-1', action: 'CREATED', actorName: 'System Engine', createdAt: new Date(Date.now() - 1000 * 180).toISOString() }
    ]
  },
  {
    id: 'alt-502',
    title: 'High Ambient Noise Level Detected',
    message: 'Sound intensity level recorded 88.5 dB exceeding threshold 85 dB.',
    severity: 'HIGH',
    status: 'ACKNOWLEDGED',
    ruleId: 'rule-002',
    eventId: 'evt-102',
    siteName: 'Main Plant Colombo',
    locationName: 'Machine Room B',
    deviceName: 'Field Worker App',
    escalationLevel: 0,
    createdAt: new Date(Date.now() - 1000 * 450).toISOString(),
    actions: [
      { id: 'act-2', action: 'CREATED', actorName: 'System Engine', createdAt: new Date(Date.now() - 1000 * 450).toISOString() },
      { id: 'act-3', action: 'ACKNOWLEDGED', actorName: 'Malith (Supervisor)', note: 'Investigating hearing protection deployment in sector', createdAt: new Date(Date.now() - 1000 * 300).toISOString() }
    ]
  },
  {
    id: 'alt-503',
    title: 'Stationed Phone Low Battery Warning',
    message: 'Battery level reached 18%, falling below minimum 20% operating threshold.',
    severity: 'MEDIUM',
    status: 'NEW',
    ruleId: 'rule-003',
    eventId: 'evt-103',
    siteName: 'Galle Warehouse',
    locationName: 'Loading Bay A',
    deviceName: 'Stationed Phone - Galle Bay',
    escalationLevel: 0,
    createdAt: new Date(Date.now() - 1000 * 900).toISOString(),
    actions: [
      { id: 'act-4', action: 'CREATED', actorName: 'System Engine', createdAt: new Date(Date.now() - 1000 * 900).toISOString() }
    ]
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-901',
    type: 'ALERT_CREATED',
    title: 'CRITICAL Alert Raised: Press 1',
    body: 'Stamping press temp reached 85.4°C at Main Plant Colombo.',
    severity: 'CRITICAL',
    alertId: 'alt-501',
    status: 'SENT',
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 180).toISOString()
  },
  {
    id: 'notif-902',
    type: 'ALERT_CREATED',
    title: 'HIGH Alert: Machine Room Noise',
    body: 'Noise level of 88.5 dB reported by Kavindu.',
    severity: 'HIGH',
    alertId: 'alt-502',
    status: 'DELIVERED',
    readAt: new Date(Date.now() - 1000 * 200).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 450).toISOString()
  },
  {
    id: 'notif-903',
    type: 'DEVICE_OFFLINE',
    title: 'Stationed Phone Offline',
    body: 'Stationed Phone - Katunayake failed heartbeats for >5 min.',
    severity: 'HIGH',
    alertId: null,
    status: 'FAILED',
    failureReason: 'Push token expired for recipient device',
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 3600 * 5).toISOString()
  }
];

const INITIAL_AUDIT = [
  {
    id: 'aud-001',
    actorName: 'System Engine',
    actorRole: 'AUTOMATION',
    action: 'ALERT_CREATED',
    resourceType: 'Alert',
    resourceId: 'alt-501',
    outcome: 'SUCCESS',
    before: null,
    after: { id: 'alt-501', status: 'NEW', severity: 'CRITICAL', ruleId: 'rule-001' },
    createdAt: new Date(Date.now() - 1000 * 180).toISOString()
  },
  {
    id: 'aud-002',
    actorName: 'Malith Senanayake',
    actorRole: 'SUPERVISOR',
    action: 'ALERT_ACKNOWLEDGED',
    resourceType: 'Alert',
    resourceId: 'alt-502',
    outcome: 'SUCCESS',
    before: { id: 'alt-502', status: 'NEW' },
    after: { id: 'alt-502', status: 'ACKNOWLEDGED', note: 'Investigating hearing protection' },
    createdAt: new Date(Date.now() - 1000 * 300).toISOString()
  },
  {
    id: 'aud-003',
    actorName: 'Dinesh Wijesinghe',
    actorRole: 'MANAGER',
    action: 'RULE_UPDATED',
    resourceType: 'AutomationRule',
    resourceId: 'rule-001',
    outcome: 'SUCCESS',
    before: { name: 'Stamping Press High Temp', cooldownMinutes: 5 },
    after: { name: 'Stamping Press High Temp', cooldownMinutes: 1 },
    createdAt: new Date(Date.now() - 1000 * 3600 * 2).toISOString()
  }
];

const INITIAL_DEVICES = [
  {
    deviceId: 'dev-phone-01',
    deviceName: 'Stationed Phone - Press 1',
    siteName: 'Main Plant Colombo',
    locationName: 'Stamping Press 1',
    status: 'ONLINE',
    lastHeartbeatAt: new Date(Date.now() - 1000 * 35).toISOString(),
    batteryLevel: 94,
    networkType: 'WIFI',
    appForeground: true,
    queueSize: 0,
    intervalMinutes: 10
  },
  {
    deviceId: 'dev-phone-02',
    deviceName: 'Stationed Phone - Galle Bay',
    siteName: 'Galle Warehouse',
    locationName: 'Loading Bay A',
    status: 'LOW_BATTERY',
    lastHeartbeatAt: new Date(Date.now() - 1000 * 50).toISOString(),
    batteryLevel: 18,
    networkType: '4G',
    appForeground: true,
    queueSize: 3,
    intervalMinutes: 15
  },
  {
    deviceId: 'dev-phone-03',
    deviceName: 'Stationed Phone - Katunayake',
    siteName: 'Katunayake Facility',
    locationName: 'Assembly Area 3',
    status: 'OFFLINE',
    lastHeartbeatAt: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
    batteryLevel: 0,
    networkType: 'DISCONNECTED',
    appForeground: false,
    queueSize: 12,
    intervalMinutes: 5
  }
];

// ==========================================
// BADGE COMPONENTS
// ==========================================

function SeverityBadge({ level }) {
  const styles = {
    INFO: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
    LOW: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800',
    CRITICAL: 'bg-red-100 text-red-800 border-red-300 ring-1 ring-red-400 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700 dark:ring-red-500 animate-pulse',
  };

  const icons = {
    INFO: <Info className="w-3 h-3" />,
    LOW: <Check className="w-3 h-3" />,
    MEDIUM: <AlertTriangle className="w-3 h-3" />,
    HIGH: <AlertTriangle className="w-3 h-3" />,
    CRITICAL: <AlertOctagon className="w-3 h-3" />
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[level] || styles.INFO}`}>
      {icons[level]}
      {level}
    </span>
  );
}

function StatusBadge({ status, type = 'alert' }) {
  let style = 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';

  if (type === 'alert') {
    switch (status) {
      case 'NEW':
        style = 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800';
        break;
      case 'ACKNOWLEDGED':
        style = 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800';
        break;
      case 'RESOLVED':
        style = 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800';
        break;
      case 'ESCALATED':
        style = 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800';
        break;
      default: break;
    }
  } else if (type === 'device') {
    switch (status) {
      case 'ONLINE':
        style = 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300';
        break;
      case 'LOW_BATTERY':
        style = 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300';
        break;
      case 'OFFLINE':
        style = 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300';
        break;
      case 'NOT_FOREGROUND':
        style = 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
        break;
      default: break;
    }
  } else if (type === 'event') {
    switch (status) {
      case 'PROCESSED':
        style = 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300';
        break;
      case 'RECEIVED':
        style = 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300';
        break;
      case 'FAILED':
        style = 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300';
        break;
      default: break;
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {status}
    </span>
  );
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function App() {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState('operations');
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedAuditId, setSelectedAuditId] = useState(null);

  // Global Application State (Simulating DB store)
  const [useMock, setUseMock] = useState(true);
  const [currentUser, setCurrentUser] = useState({
    userId: 'usr-245057J',
    name: 'Nelithma Liyanage',
    role: 'MANAGER',
    tenantId: 'tenant-nagarro-demo',
    tenantName: 'Nagarro Industrial'
  });

  const [rules, setRules] = useState(INITIAL_RULES);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT);
  const [devices, setDevices] = useState(INITIAL_DEVICES);

  // Modals & UI Controls
  const [toast, setToast] = useState(null);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [pairingCodeModal, setPairingCodeModal] = useState(false);
  const [pairingCodeData, setPairingCodeData] = useState(null);
  const [pairingCountdown, setPairingCountdown] = useState(600);
  const [actionReasonModal, setActionReasonModal] = useState({ open: false, type: null, alertId: null, note: '' });

  // Toast Notification Trigger
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Live Auto-Polling Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time heartbeat updates
      setDevices(prev => prev.map(dev => {
        if (dev.status === 'ONLINE') {
          return { ...dev, lastHeartbeatAt: new Date().toISOString() };
        }
        return dev;
      }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Pairing Countdown Timer Effect
  useEffect(() => {
    let timer;
    if (pairingCodeModal && pairingCountdown > 0) {
      timer = setInterval(() => setPairingCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [pairingCodeModal, pairingCountdown]);

  // Derived Values
  const unreadNotifCount = useMemo(() => {
    return notifications.filter(n => !n.readAt).length;
  }, [notifications]);

  const criticalAlertsCount = useMemo(() => {
    return alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  }, [alerts]);

  // ==========================================
  // CORE AUTOMATION & RULE EVALUATION ENGINE
  // ==========================================

  const evaluateRuleCondition = (rule, value) => {
    const numVal = Number(value);
    if (isNaN(numVal)) return false;
    const tVal = Number(rule.thresholdValue);
    const tMax = Number(rule.thresholdMax);

    switch (rule.operator) {
      case 'GT': return numVal > tVal;
      case 'GTE': return numVal >= tVal;
      case 'LT': return numVal < tVal;
      case 'LTE': return numVal <= tVal;
      case 'EQ': return numVal === tVal;
      case 'NEQ': return numVal !== tVal;
      case 'BETWEEN': return numVal >= tVal && numVal <= tMax;
      default: return false;
    }
  };

  const processIncomingEvent = (newEvent) => {
    // 1. Audit Event Received
    const receivedAudit = {
      id: `aud-${Date.now()}`,
      actorName: 'Edge Service',
      actorRole: 'STATIONED_PHONE',
      action: 'EVENT_RECEIVED',
      resourceType: 'OperationalEvent',
      resourceId: newEvent.id,
      outcome: 'SUCCESS',
      after: newEvent,
      createdAt: new Date().toISOString()
    };

    // 2. Evaluate Enabled Rules
    const matchedAlerts = [];
    rules.filter(r => r.enabled).forEach(rule => {
      const value = newEvent.payload[rule.fieldKey];
      if (value !== undefined && evaluateRuleCondition(rule, value)) {
        // Cooldown check
        const cooldownMs = (rule.cooldownMinutes || 0) * 60000;
        const recentAlert = alerts.find(a =>
          a.ruleId === rule.id &&
          a.status !== 'RESOLVED' &&
          (Date.now() - new Date(a.createdAt).getTime()) < cooldownMs
        );

        if (!recentAlert) {
          const newAlertId = `alt-${Date.now()}-${Math.floor(Math.random() * 100)}`;
          const createdAlert = {
            id: newAlertId,
            title: `${rule.name} Threshold Exceeded`,
            message: `Field '${rule.fieldKey}' recorded ${value} (rule condition: ${rule.operator} ${rule.thresholdValue}${rule.operator === 'BETWEEN' ? ' - ' + rule.thresholdMax : ''}).`,
            severity: rule.severity,
            status: 'NEW',
            ruleId: rule.id,
            eventId: newEvent.id,
            siteName: newEvent.siteName || 'Main Facility',
            locationName: newEvent.locationName || 'General Location',
            deviceName: newEvent.deviceName || 'Mobile Edge',
            escalationLevel: 0,
            createdAt: new Date().toISOString(),
            actions: [
              { id: `act-${Date.now()}`, action: 'CREATED', actorName: 'System Engine', createdAt: new Date().toISOString() }
            ]
          };
          matchedAlerts.push(createdAlert);
        }
      }
    });

    // 3. Save Event
    const processedEvt = {
      ...newEvent,
      status: 'PROCESSED',
      alertsCreated: matchedAlerts.map(a => a.id)
    };

    setEvents(prev => [processedEvt, ...prev]);

    if (matchedAlerts.length > 0) {
      setAlerts(prev => [...matchedAlerts, ...prev]);

      // Generate Notifications
      const newNotifs = matchedAlerts.map(a => ({
        id: `notif-${Date.now()}-${a.id}`,
        type: 'ALERT_CREATED',
        title: `${a.severity} Alert: ${a.title}`,
        body: a.message,
        severity: a.severity,
        alertId: a.id,
        status: 'SENT',
        readAt: null,
        createdAt: new Date().toISOString()
      }));

      setNotifications(prev => [...newNotifs, ...prev]);
      showToast(`Event triggered ${matchedAlerts.length} operational alert(s)!`, 'warning');
    } else {
      showToast('Event ingested and processed successfully (no threshold violations).', 'info');
    }

    setAuditLogs(prev => [receivedAudit, ...prev]);
  };

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  const handleAlertAction = (alertId, actionType, note = '') => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    let targetStatus = alert.status;
    let newEscalation = alert.escalationLevel;

    if (actionType === 'acknowledge') {
      targetStatus = 'ACKNOWLEDGED';
    } else if (actionType === 'resolve') {
      targetStatus = 'RESOLVED';
    } else if (actionType === 'escalate') {
      targetStatus = 'ESCALATED';
      newEscalation += 1;
    }

    const updatedAlert = {
      ...alert,
      status: targetStatus,
      escalationLevel: newEscalation,
      actions: [
        ...alert.actions,
        {
          id: `act-${Date.now()}`,
          action: actionType.toUpperCase(),
          actorName: currentUser.name,
          note: note || undefined,
          createdAt: new Date().toISOString()
        }
      ]
    };

    setAlerts(prev => prev.map(a => a.id === alertId ? updatedAlert : a));

    // Write Audit
    const auditEntry = {
      id: `aud-${Date.now()}`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: `ALERT_${actionType.toUpperCase()}`,
      resourceType: 'Alert',
      resourceId: alertId,
      outcome: 'SUCCESS',
      before: { status: alert.status, escalationLevel: alert.escalationLevel },
      after: { status: targetStatus, escalationLevel: newEscalation, note },
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [auditEntry, ...prev]);

    showToast(`Alert marked as ${targetStatus}.`);
    setActionReasonModal({ open: false, type: null, alertId: null, note: '' });
  };

  const handleSaveRule = (ruleFormData) => {
    if (ruleFormData.id) {
      // Update
      const oldRule = rules.find(r => r.id === ruleFormData.id);
      setRules(prev => prev.map(r => r.id === ruleFormData.id ? { ...ruleFormData, updatedAt: new Date().toISOString() } : r));

      setAuditLogs(prev => [{
        id: `aud-${Date.now()}`,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'RULE_UPDATED',
        resourceType: 'AutomationRule',
        resourceId: ruleFormData.id,
        outcome: 'SUCCESS',
        before: oldRule,
        after: ruleFormData,
        createdAt: new Date().toISOString()
      }, ...prev]);

      showToast('Automation rule updated successfully.');
    } else {
      // Create
      const newRule = {
        ...ruleFormData,
        id: `rule-${Date.now()}`,
        updatedAt: new Date().toISOString()
      };
      setRules(prev => [newRule, ...prev]);

      setAuditLogs(prev => [{
        id: `aud-${Date.now()}`,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'RULE_CREATED',
        resourceType: 'AutomationRule',
        resourceId: newRule.id,
        outcome: 'SUCCESS',
        before: null,
        after: newRule,
        createdAt: new Date().toISOString()
      }, ...prev]);

      showToast('New automation rule created.');
    }
    setActiveTab('rules');
    setSelectedRuleId(null);
  };

  const handleDeleteRule = (ruleId) => {
    const rule = rules.find(r => r.id === ruleId);
    setRules(prev => prev.filter(r => r.id !== ruleId));

    setAuditLogs(prev => [{
      id: `aud-${Date.now()}`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'RULE_DELETED',
      resourceType: 'AutomationRule',
      resourceId: ruleId,
      outcome: 'SUCCESS',
      before: rule,
      after: null,
      createdAt: new Date().toISOString()
    }, ...prev]);

    showToast('Automation rule removed.', 'info');
  };

  const handleGeneratePairingCode = (deviceId) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPairingCodeData({ deviceId, code });
    setPairingCountdown(600);
    setPairingCodeModal(true);

    setAuditLogs(prev => [{
      id: `aud-${Date.now()}`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'DEVICE_PAIRING_CODE_CREATED',
      resourceType: 'Device',
      resourceId: deviceId,
      outcome: 'SUCCESS',
      createdAt: new Date().toISOString()
    }, ...prev]);
  };

  // ==========================================
  // RENDERED SUB-VIEWS
  // ==========================================

  // --- 1. OPERATIONS MONITOR ---
  const renderOperationsMonitor = () => {
    const openAlerts = alerts.filter(a => a.status !== 'RESOLVED');
    const onlineDevices = devices.filter(d => d.status === 'ONLINE').length;

    return (
      <div className="space-y-6">
        {/* Banner Alert for Critical Exceptions */}
        {criticalAlertsCount > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-700 dark:text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-6 h-6 text-red-600 dark:text-red-400 animate-bounce" />
              <div>
                <h4 className="font-semibold text-sm">Critical Threshold Violations Active</h4>
                <p className="text-xs opacity-90">{criticalAlertsCount} critical alert(s) require immediate supervisor acknowledgment and triage.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('alerts')}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition"
            >
              Review Alerts
            </button>
          </div>
        )}

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Open Alerts</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{openAlerts.length}</h3>
              <p className="text-xs text-red-500 font-medium mt-1">{criticalAlertsCount} Critical</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Events (Last Hour)</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{events.length}</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">100% Ingested</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Unread Notifications</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{unreadNotifCount}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">In-App Channel</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <Bell className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Stationed Phones</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{onlineDevices} / {devices.length}</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">Online & Active</p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Smartphone className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Dashboard Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Alerts */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Latest Alerts Activity
              </h3>
              <button onClick={() => setActiveTab('alerts')} className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {alerts.slice(0, 4).map(alert => (
                <div key={alert.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <SeverityBadge level={alert.severity} />
                      <StatusBadge status={alert.status} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{alert.siteName}</span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{alert.message}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedAlertId(alert.id); setActiveTab('alerts'); }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Stationed Device Health Snapshot */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Stationed Edge Nodes
              </h3>
              <button onClick={() => setActiveTab('devices')} className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium flex items-center gap-1">
                Manage <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {devices.map(dev => (
                <div key={dev.deviceId} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white">{dev.deviceName}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{dev.locationName}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                      <span>Batt: {dev.batteryLevel}%</span>
                      <span>Queue: {dev.queueSize}</span>
                    </div>
                  </div>
                  <StatusBadge status={dev.status} type="device" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- 2. AUTOMATION RULES & EDITOR ---
  const renderRulesView = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Automation Rules (M5-01)</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Configure conditional field threshold rules for automated real-time alert generation.</p>
          </div>
          <button
            onClick={() => { setSelectedRuleId('NEW'); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create New Rule
          </button>
        </div>

        {/* Rules Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Rule Name & Scope</th>
                  <th className="p-3.5">Condition Expression</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Cooldown</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                {rules.map(rule => (
                  <tr key={rule.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition">
                    <td className="p-3.5">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{rule.name}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">{rule.siteName} &bull; {rule.locationName}</div>
                    </td>
                    <td className="p-3.5 font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 px-2 py-1 rounded w-fit">
                      {rule.fieldKey} {rule.operator} {rule.thresholdValue} {rule.operator === 'BETWEEN' ? `AND ${rule.thresholdMax}` : ''}
                    </td>
                    <td className="p-3.5"><SeverityBadge level={rule.severity} /></td>
                    <td className="p-3.5">{rule.cooldownMinutes} min</td>
                    <td className="p-3.5">
                      <button
                        onClick={() => {
                          const updated = { ...rule, enabled: !rule.enabled };
                          setRules(prev => prev.map(r => r.id === rule.id ? updated : r));
                          showToast(`Rule '${rule.name}' ${!rule.enabled ? 'Enabled' : 'Disabled'}.`);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                          rule.enabled
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedRuleId(rule.id)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                        title="Edit Rule"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- RULE FORM EDITOR MODAL / VIEW ---
  const renderRuleEditor = () => {
    const existingRule = rules.find(r => r.id === selectedRuleId);

    const [form, setForm] = useState(existingRule || {
      name: '',
      description: '',
      siteName: 'Main Plant Colombo',
      locationName: 'Stamping Press 1',
      templateId: 'tmpl-press-insp',
      fieldKey: 'temperature',
      operator: 'GT',
      thresholdValue: 80,
      thresholdMax: 100,
      severity: 'CRITICAL',
      cooldownMinutes: 15,
      enabled: true
    });

    const livePreviewSentence = useMemo(() => {
      const opObj = OPERATORS.find(o => o.value === form.operator);
      const opStr = opObj ? opObj.label : form.operator;
      let condStr = `${form.fieldKey || '[field]'} ${opStr} ${form.thresholdValue ?? '[val]'}`;
      if (form.operator === 'BETWEEN') {
        condStr += ` and ${form.thresholdMax ?? '[max]'}`;
      }
      return `If (${condStr}) then raise a ${form.severity || '[severity]'} alert (repeat cooldown: ${form.cooldownMinutes || 0} min).`;
    }, [form]);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {existingRule ? 'Edit Automation Rule' : 'Create New Automation Rule'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Define field triggers and logic sentence</p>
          </div>
          <button onClick={() => setSelectedRuleId(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Sentence Preview Widget */}
        <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Logic Evaluation Preview
          </p>
          <p className="text-sm font-mono text-indigo-800 dark:text-indigo-200 font-medium">
            "{livePreviewSentence}"
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSaveRule(form); }} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Rule Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Press Temp Critical"
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Field Key (Payload Parameter) *</label>
              <input
                type="text"
                required
                value={form.fieldKey}
                onChange={e => setForm({ ...form, fieldKey: e.target.value })}
                placeholder="e.g. temperature"
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Operator *</label>
              <select
                value={form.operator}
                onChange={e => setForm({ ...form, operator: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {OPERATORS.map(op => (
                  <option key={op.value} value={op.value}>{op.label} ({op.value})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Threshold Value *</label>
              <input
                type="number"
                step="any"
                required
                value={form.thresholdValue}
                onChange={e => setForm({ ...form, thresholdValue: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {form.operator === 'BETWEEN' && (
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Threshold Max *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={form.thresholdMax || ''}
                  onChange={e => setForm({ ...form, thresholdMax: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Severity *</label>
              <select
                value={form.severity}
                onChange={e => setForm({ ...form, severity: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {SEVERITIES.map(sev => (
                  <option key={sev} value={sev}>{sev}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Cooldown Minutes</label>
              <input
                type="number"
                value={form.cooldownMinutes}
                onChange={e => setForm({ ...form, cooldownMinutes: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={e => setForm({ ...form, enabled: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-semibold text-gray-700 dark:text-gray-300">Enable Rule Immediately</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedRuleId(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm"
              >
                Save Rule
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };

  // --- 3. OPERATIONAL EVENTS LOG ---
  const renderEventsView = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Operational Events Stream (M5-02)</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ingested edge data telemetry and worker inspection submission stream.</p>
          </div>

          <button
            onClick={() => {
              // Simulate Ingesting a Hot Reading
              const simulatedEvt = {
                id: `evt-${Date.now()}`,
                sourceType: 'STATIONED_TELEMETRY',
                deviceId: 'dev-phone-01',
                deviceName: 'Stationed Phone - Press 1',
                siteName: 'Main Plant Colombo',
                locationName: 'Stamping Press 1',
                payload: { temperature: 86.2, pressurePsi: 195 },
                occurredAt: new Date().toISOString()
              };
              processIncomingEvent(simulatedEvt);
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition shadow-sm"
          >
            <Radio className="w-4 h-4 animate-pulse" /> Simulate Telemetry (Temp 86.2°C)
          </button>
        </div>

        {/* Events Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Source Type</th>
                <th className="p-3.5">Site & Device</th>
                <th className="p-3.5">Payload Excerpt</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
              {events.map(evt => (
                <tr key={evt.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition">
                  <td className="p-3.5 font-mono text-[11px] text-gray-500">{new Date(evt.occurredAt).toLocaleTimeString()}</td>
                  <td className="p-3.5 font-semibold text-indigo-600 dark:text-indigo-400">{evt.sourceType}</td>
                  <td className="p-3.5">
                    <div className="font-semibold text-gray-900 dark:text-white">{evt.deviceName || evt.userName}</div>
                    <div className="text-[11px] text-gray-500">{evt.siteName}</div>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] max-w-xs truncate text-gray-600 dark:text-gray-400">
                    {JSON.stringify(evt.payload)}
                  </td>
                  <td className="p-3.5"><StatusBadge status={evt.status} type="event" /></td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedEventId(evt.id)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected Event Payload Drawer / Modal */}
        {selectedEventId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full p-6 space-y-4 shadow-xl overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                <h3 className="font-bold text-gray-900 dark:text-white">Event Detail Drawer</h3>
                <button onClick={() => setSelectedEventId(null)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {(() => {
                const evt = events.find(e => e.id === selectedEventId);
                if (!evt) return null;
                return (
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-gray-500">Event ID:</span>
                      <p className="font-mono font-semibold">{evt.id}</p>
                    </div>

                    <div>
                      <span className="text-gray-500">Source:</span>
                      <p className="font-semibold">{evt.sourceType}</p>
                    </div>

                    <div>
                      <span className="text-gray-500">JSON Payload:</span>
                      <pre className="mt-1 p-3 bg-gray-900 text-green-400 rounded-lg font-mono text-[11px] overflow-x-auto">
                        {JSON.stringify(evt.payload, null, 2)}
                      </pre>
                    </div>

                    {evt.error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg">
                        <span className="font-semibold">Processing Error:</span>
                        <p>{evt.error}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- 4. ALERTS LIST & LIFECYCLE DETAILS ---
  const renderAlertsView = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Alerts Lifecycle Management (M5-03)</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Review, acknowledge, escalate, and resolve automated operational exceptions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Alerts List */}
          <div className="lg:col-span-1 space-y-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlertId(alert.id)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedAlertId === alert.id
                    ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <SeverityBadge level={alert.severity} />
                  <StatusBadge status={alert.status} />
                </div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{alert.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{alert.message}</p>
                <div className="flex items-center justify-between mt-3 text-[11px] text-gray-400 border-t border-gray-100 dark:border-gray-700/50 pt-2">
                  <span>{alert.siteName}</span>
                  <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Alert Detail View & Actions Timeline */}
          <div className="lg:col-span-2">
            {selectedAlertId ? (
              (() => {
                const alert = alerts.find(a => a.id === selectedAlertId);
                if (!alert) return null;

                return (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6 shadow-sm">
                    {/* Header Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <SeverityBadge level={alert.severity} />
                          <StatusBadge status={alert.status} />
                          {alert.escalationLevel > 0 && (
                            <span className="text-xs font-semibold text-red-600 dark:text-red-400">Escalated Level {alert.escalationLevel}</span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{alert.title}</h3>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          disabled={alert.status !== 'NEW'}
                          onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
                        >
                          Acknowledge
                        </button>
                        <button
                          disabled={alert.status === 'RESOLVED'}
                          onClick={() => setActionReasonModal({ open: true, type: 'escalate', alertId: alert.id, note: '' })}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
                        >
                          Escalate
                        </button>
                        <button
                          disabled={alert.status === 'RESOLVED'}
                          onClick={() => setActionReasonModal({ open: true, type: 'resolve', alertId: alert.id, note: '' })}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div>
                        <span className="text-gray-500">Site Facility:</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{alert.siteName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{alert.locationName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Edge Device:</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{alert.deviceName}</p>
                      </div>
                    </div>

                    {/* Timeline of Actions */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Audit Timeline History</h4>
                      <div className="space-y-3 relative pl-4 border-l-2 border-indigo-200 dark:border-indigo-900">
                        {alert.actions.map(act => (
                          <div key={act.id} className="relative">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-gray-900 dark:text-white">{act.action} by {act.actorName}</span>
                              <span className="text-gray-400">{new Date(act.createdAt).toLocaleTimeString()}</span>
                            </div>
                            {act.note && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">"{act.note}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select an alert from the list to view triggering payload telemetry and timeline.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- 5. NOTIFICATIONS & PREFERENCES ---
  const renderNotificationsView = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">In-App Notifications (M5-04)</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Targeted supervisor escalation notices and status delivery logs.</p>
          </div>

          <button
            onClick={() => {
              setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })));
              showToast('All notifications marked as read.');
            }}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold"
          >
            Mark All as Read
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                !notif.readAt
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {!notif.readAt && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
                  {notif.severity && <SeverityBadge level={notif.severity} />}
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">{notif.title}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">{notif.body}</p>
                <div className="text-[11px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</div>
              </div>

              <div className="text-right space-y-2">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  notif.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                  notif.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {notif.status}
                </span>

                {notif.alertId && (
                  <div>
                    <button
                      onClick={() => { setSelectedAlertId(notif.alertId); setActiveTab('alerts'); }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      View Alert
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- 6. AUDIT HISTORY LOG ---
  const renderAuditView = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Audit Trail & Governance (M5-05)</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Append-only immutable record of system actions, rules modifications, and alert state transitions.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5">Resource</th>
                <th className="p-3.5">Outcome</th>
                <th className="p-3.5 text-right">State Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition">
                  <td className="p-3.5 font-mono text-[11px] text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</td>
                  <td className="p-3.5">
                    <div className="font-semibold text-gray-900 dark:text-white">{log.actorName}</div>
                    <div className="text-[10px] text-gray-400">{log.actorRole}</div>
                  </td>
                  <td className="p-3.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">{log.action}</td>
                  <td className="p-3.5">{log.resourceType} ({log.resourceId})</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {log.outcome}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedAuditId(log.id)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Audit Diff Modal */}
        {selectedAuditId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 max-w-lg w-full rounded-xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                <h3 className="font-bold text-gray-900 dark:text-white">Audit State Diff Viewer</h3>
                <button onClick={() => setSelectedAuditId(null)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {(() => {
                const log = auditLogs.find(a => a.id === selectedAuditId);
                if (!log) return null;
                return (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold text-gray-500">Before State:</span>
                        <pre className="mt-1 p-3 bg-gray-900 text-red-400 rounded-lg font-mono text-[11px] overflow-x-auto">
                          {log.before ? JSON.stringify(log.before, null, 2) : 'null'}
                        </pre>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-500">After State:</span>
                        <pre className="mt-1 p-3 bg-gray-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto">
                          {log.after ? JSON.stringify(log.after, null, 2) : 'null'}
                        </pre>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- 7. STATIONED DEVICES HEALTH & PAIRING ---
  const renderDevicesView = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Stationed Phone Health & Pairing</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Monitor edge telemetry phones running unattended foreground captures.</p>
          </div>
        </div>

        {/* Device Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {devices.map(dev => (
            <div key={dev.deviceId} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <StatusBadge status={dev.status} type="device" />
                <button
                  onClick={() => handleGeneratePairingCode(dev.deviceId)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5" /> Pair Code
                </button>
              </div>

              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">{dev.deviceName}</h3>
                <p className="text-xs text-gray-500">{dev.siteName} &bull; {dev.locationName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-900/40 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <div>
                  <span className="text-gray-400">Battery:</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{dev.batteryLevel}%</p>
                </div>
                <div>
                  <span className="text-gray-400">Network:</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{dev.networkType}</p>
                </div>
                <div>
                  <span className="text-gray-400">SQLite Queue:</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{dev.queueSize} items</p>
                </div>
                <div>
                  <span className="text-gray-400">Interval:</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{dev.intervalMinutes} min</p>
                </div>
              </div>

              <div className="text-[11px] text-gray-400">
                Last Heartbeat: {new Date(dev.lastHeartbeatAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        {/* Pairing Code Dialog */}
        {pairingCodeModal && pairingCodeData && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 max-w-sm w-full rounded-2xl p-6 space-y-4 text-center shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 w-fit mx-auto rounded-full">
                <Smartphone className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Edge Pairing Code</h3>
                <p className="text-xs text-gray-500 mt-1">Enter code into Expo Stationed phone app activation screen.</p>
              </div>

              <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-xl font-mono text-3xl font-bold tracking-widest text-indigo-600 dark:text-indigo-400">
                {pairingCodeData.code}
              </div>

              <div className="text-xs text-gray-400">
                Expires in: <span className="font-semibold text-gray-700 dark:text-gray-300">{Math.floor(pairingCountdown / 60)}m {pairingCountdown % 60}s</span>
              </div>

              <button
                onClick={() => setPairingCodeModal(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // LAYOUT & HEADER RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      {/* Toast Render */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg bg-gray-900 text-white text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Info className="w-4 h-4 text-indigo-400" />
          {toast.message}
        </div>
      )}

      {/* Top Application Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-gray-900 dark:text-white">SiteTrace</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                M5 Engine
              </span>
            </div>
            <p className="text-[11px] text-gray-500">245057J &bull; Nelithma Liyanage</p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">
          {/* Mock Toggle Switch */}
          <button
            onClick={() => { setUseMock(!useMock); showToast(`Data Source: ${!useMock ? 'Mock State' : 'Live Endpoint API'}`); }}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Server className="w-3.5 h-3.5 text-indigo-500" />
            {useMock ? 'Mock Data' : 'Live API'}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Quick Dropdown */}
            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold">Recent Escalations</span>
                  <button onClick={() => { setActiveTab('notifications'); setNotifDropdownOpen(false); }} className="text-indigo-600 hover:underline">View All</button>
                </div>
                {notifications.slice(0, 3).map(n => (
                  <div key={n.id} className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <p className="font-semibold text-gray-900 dark:text-white">{n.title}</p>
                    <p className="text-gray-500 text-[11px]">{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Chip */}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              NL
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">{currentUser.name}</p>
              <p className="text-[10px] text-gray-500">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-8 overflow-x-auto">
        <div className="flex gap-1">
          {[
            { id: 'operations', label: 'Monitor', icon: Activity },
            { id: 'rules', label: 'Rules Engine', icon: SlidersIcon },
            { id: 'events', label: 'Events Stream', icon: Radio },
            { id: 'alerts', label: 'Alerts Triage', icon: AlertTriangle },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'audit', label: 'Audit Log', icon: Shield },
            { id: 'devices', label: 'Stationed Devices', icon: Smartphone },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedRuleId(null); }}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Screen Content Body */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
        {selectedRuleId !== null ? (
          renderRuleEditor()
        ) : (
          <>
            {activeTab === 'operations' && renderOperationsMonitor()}
            {activeTab === 'rules' && renderRulesView()}
            {activeTab === 'events' && renderEventsView()}
            {activeTab === 'alerts' && renderAlertsView()}
            {activeTab === 'notifications' && renderNotificationsView()}
            {activeTab === 'audit' && renderAuditView()}
            {activeTab === 'devices' && renderDevicesView()}
          </>
        )}
      </main>

      {/* Action Reason Note Modal (For Alert Resolution & Escalation) */}
      {actionReasonModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-base text-gray-900 dark:text-white capitalize">
              {actionReasonModal.type} Alert Action
            </h3>
            <p className="text-xs text-gray-500">Please provide a reason or supervisory note for this action record.</p>

            <textarea
              rows={3}
              required
              value={actionReasonModal.note}
              onChange={e => setActionReasonModal({ ...actionReasonModal, note: e.target.value })}
              placeholder="Enter mandatory supervisory note..."
              className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setActionReasonModal({ open: false, type: null, alertId: null, note: '' })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold"
              >
                Cancel
              </button>

              <button
                disabled={!actionReasonModal.note.trim()}
                onClick={() => handleAlertAction(actionReasonModal.alertId, actionReasonModal.type, actionReasonModal.note)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold"
              >
                Confirm {actionReasonModal.type}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}