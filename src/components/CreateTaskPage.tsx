import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { LOCATIONS, TEMPLATES, WAREHOUSES, todayIso } from './taskTypes';
import type { NewTask } from './taskTypes';
import { warehouseService } from '../services/warehouseService';
import { locationService } from '../services/locationService';
import type { Warehouse, Location } from '../types';

interface Props {
  supervisors: string[];
  onBack: () => void;
  onCreate: (data: NewTask) => void;
}

export function CreateTaskPage({ supervisors, onBack, onCreate }: Props) {
  // Live warehouses & locations from PostgreSQL database
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [form, setForm] = useState<NewTask>({
    title: '',
    warehouse: WAREHOUSES[0],
    location: LOCATIONS[0],
    template: TEMPLATES[0],
    supervisor: supervisors[0] ?? '',
    dueDate: todayIso(),
    instructions: '',
  });

  // 1. Fetch live warehouses & initial locations on mount
  useEffect(() => {
    let isCancelled = false;

    warehouseService
      .getWarehouses('', 'Active', 1, 100)
      .then(async (res) => {
        if (isCancelled) return;
        if (res.items && res.items.length > 0) {
          setWarehouses(res.items);
          const firstWh = res.items[0];

          setForm((prev) => ({
            ...prev,
            warehouse: firstWh.name,
          }));

          // Fetch locations for the first warehouse
          try {
            const locs = await locationService.getLocations(firstWh.id);
            if (isCancelled) return;
            const activeLocs = locs.filter((l) => l.status === 'Active');
            setLocations(activeLocs);
            setForm((prev) => ({
              ...prev,
              location: activeLocs.length > 0 ? activeLocs[0].name : '',
            }));
          } catch {
            // Graceful fallback if locations fail
          }
        }
      })
      .catch(() => {
        // Graceful fallback to static WAREHOUSES if backend is offline
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const set = <K extends keyof NewTask>(key: K, value: NewTask[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // 2. Dynamically fetch locations when user selects a different warehouse
  const handleWarehouseChange = async (warehouseName: string) => {
    set('warehouse', warehouseName);

    const selectedWh = warehouses.find(
      (w) => w.name.toLowerCase() === warehouseName.toLowerCase(),
    );

    if (selectedWh) {
      try {
        const locs = await locationService.getLocations(selectedWh.id);
        const activeLocs = locs.filter((l) => l.status === 'Active');
        setLocations(activeLocs);
        set('location', activeLocs.length > 0 ? activeLocs[0].name : '');
      } catch {
        setLocations([]);
        set('location', '');
      }
    } else {
      setLocations([]);
      set('location', '');
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onCreate({ ...form, title: form.title.trim() });
  };

  return (
    <div className="page">
      <button type="button" className="back-link" onClick={onBack}>← Tasks</button>
      <h1 className="page-title">Create task</h1>
      <p className="page-sub">Assign a clear task to a Supervisor.</p>

      <form className="card form-card" onSubmit={submit}>
        <div className="field">
          <label>Task title</label>
          <input
            className="input"
            placeholder="e.g. Morning equipment check"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="field">
            <label>Warehouse</label>
            <select
              className="input"
              value={form.warehouse}
              onChange={(e) => void handleWarehouseChange(e.target.value)}
            >
              {warehouses.length > 0
                ? warehouses.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name.toLowerCase().endsWith('warehouse')
                        ? w.name
                        : `${w.name} warehouse`}
                    </option>
                  ))
                : WAREHOUSES.map((w) => (
                    <option key={w} value={w}>
                      {w} warehouse
                    </option>
                  ))}
            </select>
          </div>
          <div className="field">
            <label>Location</label>
            <select
              className="input"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
            >
              {warehouses.length > 0 ? (
                locations.length > 0 ? (
                  locations.map((l) => (
                    <option key={l.id} value={l.name}>
                      {l.name}
                    </option>
                  ))
                ) : (
                  <option value="">No locations in this warehouse</option>
                )
              ) : (
                LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label>Published template</label>
            <select className="input" value={form.template} onChange={(e) => set('template', e.target.value)}>
              {TEMPLATES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Supervisor</label>
            <select className="input" value={form.supervisor} onChange={(e) => set('supervisor', e.target.value)}>
              {supervisors.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label>Due date</label>
            <input type="date" className="input" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
          </div>
          <div className="field">
            <label>Instructions</label>
            <input
              className="input"
              placeholder="e.g. Read display and attach a clear photo."
              value={form.instructions}
              onChange={(e) => set('instructions', e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={onBack}>Cancel</button>
          <button type="submit" className="primary-btn">Create task</button>
        </div>
      </form>
    </div>
  );
}
