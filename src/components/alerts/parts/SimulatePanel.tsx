import { useState } from 'react'
import { useIngestEvent, useLookups } from '../api/hooks'
import { errorMessage } from '../lib/errors'
import { uuid } from '../lib/hooks'
import { Field } from './Field'
import { showToast } from './toast'

/**
 * Demo tool. Plays the part of a stationed phone or a field submission by posting one event
 * to the same ingest function the real devices will call.
 */
export function SimulatePanel({ onOpenAlert }: { onOpenAlert: (id: string) => void }) {
  const { ref } = useLookups()
  const ingest = useIngestEvent()
  const [deviceId, setDeviceId] = useState('d-phone01')
  const [temperature, setTemperature] = useState('72')
  const [soundDb, setSoundDb] = useState('')
  const [battery, setBattery] = useState('')
  const [minutes, setMinutes] = useState('')

  const send = (overrides?: { temperature?: string }) => {
    const device = ref?.devices.find((d) => d.id === deviceId)
    if (!device) return
    const values: Record<string, string> = {
      temperature: overrides?.temperature ?? temperature, soundDb, battery, minutesSinceContact: minutes,
    }
    const payload: Record<string, number> = {}
    for (const [k, v] of Object.entries(values)) if (v.trim() !== '' && !Number.isNaN(Number(v))) payload[k] = Number(v)
    if (Object.keys(payload).length === 0) {
      showToast('error', 'Enter at least one reading to send.')
      return
    }

    ingest.mutate(
      {
        clientEventId: uuid(), sourceType: 'STATIONED_TELEMETRY', deviceId: device.id, siteId: device.siteId,
        locationId: device.locationId, payload, occurredAt: new Date().toISOString(),
      },
      {
        onSuccess: (r) => {
          if (r.failed) showToast('error', 'The event was saved but processing failed.')
          else if (r.duplicate) showToast('info', 'Duplicate event ignored.')
          else if (r.alertsCreated.length > 0) {
            const id = r.alertsCreated[0]
            showToast('success', `Reading processed. ${r.alertsCreated.length} alert${r.alertsCreated.length > 1 ? 's' : ''} raised.`, { label: 'View', run: () => onOpenAlert(id) })
          } else showToast('info', 'Reading processed. No rule matched, so no alert was raised.')
        },
        onError: (e) => showToast('error', errorMessage(e)),
      },
    )
  }

  return (
    <details className="card al-sim">
      <summary>Simulate a device reading</summary>
      <p className="al-hint">
        Sends one event through the rule engine. Try 85 °C for a critical alert. The temperature rule has a 1 minute
        cooldown, so a second hot reading from the same device right away will not raise another alert.
      </p>
      <div className="al-sim-grid">
        <Field label="Device">
          {(p) => (
            <select {...p} className="input" value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
              {ref?.devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}
        </Field>
        <Field label="Temperature (°C)">
          {(p) => <input {...p} className="input" inputMode="decimal" value={temperature} onChange={(e) => setTemperature(e.target.value)} />}
        </Field>
        <Field label="Sound level (dB)">
          {(p) => <input {...p} className="input" inputMode="decimal" value={soundDb} placeholder="optional" onChange={(e) => setSoundDb(e.target.value)} />}
        </Field>
        <Field label="Battery (%)">
          {(p) => <input {...p} className="input" inputMode="numeric" value={battery} placeholder="optional" onChange={(e) => setBattery(e.target.value)} />}
        </Field>
        <Field label="Minutes since contact">
          {(p) => <input {...p} className="input" inputMode="numeric" value={minutes} placeholder="optional" onChange={(e) => setMinutes(e.target.value)} />}
        </Field>
      </div>
      <div className="al-buttons">
        <button type="button" className="primary-btn" disabled={ingest.isPending} onClick={() => send()}>Send reading</button>
        <button type="button" className="secondary-btn" disabled={ingest.isPending} onClick={() => { setTemperature('85'); send({ temperature: '85' }) }}>
          Send hot reading (85 °C)
        </button>
      </div>
    </details>
  )
}
