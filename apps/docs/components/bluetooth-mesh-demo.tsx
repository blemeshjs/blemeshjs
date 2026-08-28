'use client';

import { useRef, useState } from 'react';
import {
  createMesh,
  MeshNetworkManager,
  SigModelId,
  type MeshNetworkManager as MeshManagerType,
} from '@blemeshjs/sdk-web';

type DemoState = {
  meshCreated: boolean;
  provisionerReady: boolean;
  sending: boolean;
  simulatedOn: boolean;
  transactionId: number;
  selectedTargetId: SimulatedTargetId;
  lastError: string | null;
  logs: string[];
};

type DemoPhase =
  | 'idle'
  | 'mesh ready'
  | 'provisioner ready'
  | 'simulating control'
  | 'control applied'
  | 'error';

type DemoUseCase = 'field-diagnostics' | 'installer-validation' | 'qa-smoke';
type SimulatedTargetId = 'lighting-zone-a' | 'fan-relay-b' | 'signage-circuit-c';

type SimulatedTarget = {
  id: SimulatedTargetId;
  label: string;
  elementAddressHex: string;
  modelId: number;
  description: string;
};

const simulatedTargets: SimulatedTarget[] = [
  {
    id: 'lighting-zone-a',
    label: 'Lighting Zone A',
    elementAddressHex: '0003',
    modelId: SigModelId.genericOnOffServerModelId,
    description: 'Open-office lights controlled by Generic OnOff Server.',
  },
  {
    id: 'fan-relay-b',
    label: 'Fan Relay B',
    elementAddressHex: '0004',
    modelId: SigModelId.genericOnOffServerModelId,
    description: 'Ventilation relay endpoint for installer validation.',
  },
  {
    id: 'signage-circuit-c',
    label: 'Signage Circuit C',
    elementAddressHex: '0005',
    modelId: SigModelId.genericOnOffServerModelId,
    description: 'Storefront signage power feed used in smoke tests.',
  },
];

const initialState: DemoState = {
  meshCreated: false,
  provisionerReady: false,
  sending: false,
  simulatedOn: false,
  transactionId: 0,
  selectedTargetId: simulatedTargets[0].id,
  lastError: null,
  logs: [],
};

function now(): string {
  return new Date().toLocaleTimeString();
}

export function BluetoothMeshDemo() {
  const [state, setState] = useState<DemoState>(initialState);
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [provisionerLabel, setProvisionerLabel] = useState('none');
  const [provisionerUuid, setProvisionerUuid] = useState('none');
  const [useCase, setUseCase] = useState<DemoUseCase>('field-diagnostics');

  const meshRef = useRef<MeshManagerType | null>(null);

  const activeTarget =
    simulatedTargets.find((candidate) => candidate.id === state.selectedTargetId) ??
    simulatedTargets[0];

  const appendLog = (message: string) => {
    setState((prev) => ({
      ...prev,
      logs: [`[${now()}] ${message}`, ...prev.logs].slice(0, 80),
    }));
  };

  const setError = (message: string) => {
    setPhase('error');
    setState((prev) => ({
      ...prev,
      sending: false,
      lastError: message,
    }));
    appendLog(`Error: ${message}`);
  };

  const loadProvisioner = (mesh: MeshManagerType): boolean => {
    const provisionerNode = mesh.provisionerNode;
    if (!provisionerNode) {
      setError('Provisioner node is missing from this mesh network.');
      return false;
    }

    const addressHex = provisionerNode.primaryUnicastAddress?.hex ?? 'unknown';
    const name = provisionerNode.name || 'Local Provisioner';
    const uuid = provisionerNode.uuid.uuidString;

    setProvisionerLabel(`${name} (0x${addressHex})`);
    setProvisionerUuid(uuid);
    setState((prev) => ({ ...prev, provisionerReady: true }));
    setPhase('provisioner ready');
    appendLog(`Loaded provisioner node: ${name}, uuid=${uuid}, unicast=0x${addressHex}.`);
    return true;
  };

  const onInitializeMesh = async () => {
    setState((prev) => ({ ...prev, lastError: null }));
    appendLog('Initialize Offline Mesh clicked.');

    try {
      const mesh = await createMesh({
        meshNetworkManager: MeshNetworkManager.instance,
      });

      if (!mesh.isNetworkCreated) {
        await mesh.createNewMeshNetwork();
        appendLog('Created a new local mesh network profile.');
      }

      mesh.connection.isConnectionAutomatic = false;
      mesh.connection.close();

      meshRef.current = mesh;
      setState((prev) => ({
        ...prev,
        meshCreated: true,
        provisionerReady: false,
        sending: false,
      }));
      setPhase('mesh ready');
      appendLog('Offline mesh runtime initialized (Bluetooth scanning disabled).');
      loadProvisioner(mesh);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  const onReloadProvisioner = () => {
    const mesh = meshRef.current;
    if (!mesh) {
      setError('Initialize mesh first.');
      return;
    }
    setState((prev) => ({ ...prev, lastError: null }));
    loadProvisioner(mesh);
  };

  const onSimulateSet = () => {
    const mesh = meshRef.current;
    if (!mesh) {
      setError('Initialize mesh first.');
      return;
    }
    if (!state.provisionerReady) {
      setError('Load the provisioner node first.');
      return;
    }

    setState((prev) => ({ ...prev, sending: true, lastError: null }));
    setPhase('simulating control');

    try {
      const provisioner = mesh.provisionerNode;
      if (!provisioner) {
        throw new Error('Provisioner node is unavailable.');
      }

      const nextTid = (state.transactionId + 1) % 256;
      const nextState = !state.simulatedOn;
      const sourceAddress = provisioner.primaryUnicastAddress?.hex ?? 'unknown';
      const modelIdHex = activeTarget.modelId.toString(16).toUpperCase();

      setState((prev) => ({
        ...prev,
        sending: false,
        simulatedOn: nextState,
        transactionId: nextTid,
      }));
      setPhase('control applied');
      appendLog(
        `Simulated GenericOnOffSet from 0x${sourceAddress} -> 0x${activeTarget.elementAddressHex} (model 0x${modelIdHex}, tid ${nextTid}, state ${nextState ? 'on' : 'off'}).`,
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  const onSimulateGet = () => {
    const mesh = meshRef.current;
    if (!mesh || !state.provisionerReady) {
      setError('Initialize mesh and load provisioner first.');
      return;
    }

    appendLog(
      `Simulated GenericOnOffGet for 0x${activeTarget.elementAddressHex} -> current state ${
        state.simulatedOn ? 'on' : 'off'
      } (tid ${state.transactionId}).`,
    );
  };

  const onSelectTarget = (targetId: SimulatedTargetId) => {
    setState((prev) => ({ ...prev, selectedTargetId: targetId }));
    const target = simulatedTargets.find((candidate) => candidate.id === targetId);
    if (target) {
      appendLog(`Selected target: ${target.label} (element 0x${target.elementAddressHex}).`);
    }
  };

  const onUseCaseChange = (value: DemoUseCase) => {
    setUseCase(value);
    if (value === 'field-diagnostics') {
      onSelectTarget('lighting-zone-a');
      return;
    }
    if (value === 'installer-validation') {
      onSelectTarget('fan-relay-b');
      return;
    }
    onSelectTarget('signage-circuit-c');
  };

  const onClearErrors = () => {
    setState((prev) => ({ ...prev, lastError: null }));
    appendLog('Cleared error state.');
    if (phase === 'error') {
      setPhase(state.provisionerReady ? 'provisioner ready' : state.meshCreated ? 'mesh ready' : 'idle');
    }
  };

  const canInitializeMesh = !state.meshCreated && !state.sending;
  const canReloadProvisioner = state.meshCreated && !state.sending;
  const canSimulate = state.provisionerReady && !state.sending;

  const nextAction = (() => {
    if (phase === 'error') return 'Clear Errors and retry the suggested step below.';
    if (!state.meshCreated) return 'Initialize Offline Mesh';
    if (!state.provisionerReady) return 'Load Provisioner Node';
    if (phase === 'control applied') return 'Send Simulated Set again to toggle state.';
    return 'Send Simulated Set';
  })();

  const useCaseLabel = {
    'field-diagnostics': 'Field Diagnostics',
    'installer-validation': 'Installer Validation',
    'qa-smoke': 'QA Smoke Test',
  } as const;

  const useCaseHint = {
    'field-diagnostics': 'Mimics quick command checks from the local provisioner in service mode.',
    'installer-validation': 'Validates target addressing and model intent before live commissioning.',
    'qa-smoke': 'Runs repeatable control intent logs for release verification.',
  } as const;

  const onResetDemo = () => {
    try {
      meshRef.current?.connection.close();
    } catch {
      // ignore cleanup errors in reset flow
    }
    meshRef.current = null;
    setState(initialState);
    setPhase('idle');
    setProvisionerLabel('none');
    setProvisionerUuid('none');
  };

  return (
    <div className="border rounded-xl p-4 md:p-5 bg-fd-card text-fd-card-foreground not-prose space-y-4">
      <div className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm">
        <strong>Offline simulation mode:</strong> this panel uses <code>@blemeshjs/sdk-web</code> and
        the mesh provisioner node only. No Bluetooth scanning is required.
      </div>

      <section aria-labelledby="demo-use-case" className="space-y-2">
        <h3 id="demo-use-case" className="text-sm font-semibold">
          0. Use Case
        </h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(useCaseLabel) as DemoUseCase[]).map((candidate) => (
            <button
              key={candidate}
              type="button"
              onClick={() => onUseCaseChange(candidate)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                useCase === candidate ? 'bg-fd-accent text-fd-accent-foreground' : ''
              }`}
            >
              {useCaseLabel[candidate]}
            </button>
          ))}
        </div>
        <p className="text-sm text-fd-muted-foreground">{useCaseHint[useCase]}</p>
      </section>

      <section aria-labelledby="demo-next-step" className="space-y-2">
        <h3 id="demo-next-step" className="text-sm font-semibold">
          Next Step
        </h3>
        <p aria-live="polite" className="text-sm">
          <strong>{nextAction}</strong>
        </p>
      </section>

      <section aria-labelledby="demo-runtime" className="space-y-2">
        <h3 id="demo-runtime" className="text-sm font-semibold">
          1. Runtime
        </h3>
        <p className="text-sm">
          Bluetooth requirement: <strong>none (offline simulation)</strong>
        </p>
        <p className="text-sm">
          Mesh initialized: <strong>{state.meshCreated ? 'yes' : 'no'}</strong>
        </p>
      </section>

      <section aria-labelledby="demo-status" className="space-y-2">
        <h3 id="demo-status" className="text-sm font-semibold">
          2. Mesh Status
        </h3>
        <p aria-live="polite" className="text-sm">
          Current state: <strong>{phase}</strong>
        </p>
        <p className="text-sm">
          Provisioner loaded: <strong>{state.provisionerReady ? 'yes' : 'no'}</strong>
        </p>
        <p className="text-sm">
          Provisioner: <strong>{provisionerLabel}</strong>
        </p>
        <p className="text-sm">
          Provisioner UUID: <strong>{provisionerUuid}</strong>
        </p>
        {state.lastError ? (
          <p aria-live="polite" className="text-sm text-red-600 dark:text-red-400">
            Last error: {state.lastError}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="demo-actions" className="space-y-2">
        <h3 id="demo-actions" className="text-sm font-semibold">
          3. Actions
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onInitializeMesh}
            disabled={!canInitializeMesh}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Initialize Offline Mesh
          </button>
          <button
            type="button"
            onClick={onReloadProvisioner}
            disabled={!canReloadProvisioner}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Load Provisioner Node
          </button>
          <button
            type="button"
            onClick={onSimulateGet}
            disabled={!canSimulate}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Simulate Get
          </button>
          <button
            type="button"
            onClick={onSimulateSet}
            disabled={!canSimulate}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Simulated Set
          </button>
          <button
            type="button"
            onClick={onClearErrors}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            Clear Errors
          </button>
          <button
            type="button"
            onClick={onResetDemo}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            Reset Demo
          </button>
        </div>
      </section>

      <section aria-labelledby="demo-target" className="space-y-2">
        <h3 id="demo-target" className="text-sm font-semibold">
          4. nRF-Style Target Selection
        </h3>
        <div className="flex flex-wrap gap-2">
          {simulatedTargets.map((target) => (
            <button
              key={target.id}
              type="button"
              onClick={() => onSelectTarget(target.id)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                target.id === state.selectedTargetId ? 'bg-fd-accent text-fd-accent-foreground' : ''
              }`}
            >
              {target.label}
            </button>
          ))}
        </div>
        <p className="text-sm">
          Element address: <strong>0x{activeTarget.elementAddressHex}</strong>
        </p>
        <p className="text-sm">
          Model: <strong>Generic OnOff Server (0x{activeTarget.modelId.toString(16).toUpperCase()})</strong>
        </p>
        <p className="text-sm text-fd-muted-foreground">{activeTarget.description}</p>
      </section>

      <section aria-labelledby="demo-control-state" className="space-y-2">
        <h3 id="demo-control-state" className="text-sm font-semibold">
          5. Simulated Control State
        </h3>
        <p className="text-sm">
          Generic OnOff: <strong>{state.simulatedOn ? 'on' : 'off'}</strong>
        </p>
        <p className="text-sm">
          Transaction ID (TID): <strong>{state.transactionId}</strong>
        </p>
      </section>

      <section aria-labelledby="demo-log" className="space-y-2">
        <h3 id="demo-log" className="text-sm font-semibold">
          6. Event Log
        </h3>
        <div className="rounded-md border p-2 max-h-60 overflow-y-auto">
          {state.logs.length === 0 ? (
            <p className="text-sm text-fd-muted-foreground">No logs yet.</p>
          ) : (
            <ul aria-live="polite" className="space-y-1">
              {state.logs.map((log, index) => (
                <li key={`${log}-${index}`} className="text-xs leading-5 font-mono break-words">
                  {log}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
