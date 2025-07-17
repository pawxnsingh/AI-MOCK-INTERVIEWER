"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface LlmConfig {
  temperature: number;
  model: string;
  provider: string;
}

interface AgentVersion {
  version: string;
  prompt: string;
  config: LlmConfig;
  agentId: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface AgentsData {
  [agentName: string]: AgentVersion[];
}


const api = {
  getAllAgents: async (): Promise<AgentsData> => {
    console.log("Fetching all agents...");
    const res = await fetch("/api/agents/");
    if (!res.ok) throw new Error("Failed to fetch agents");
    return res.json();
  },
  createAgent: async (data: { name: string, version?: string, prompt: string, llmConfig?: Partial<LlmConfig> }) => {
    console.log("Creating agent:", data);
    const res = await fetch("/api/agents/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create agent");
    return res.json();
  },
  updateAgent: async (data: { name: string, version: string, prompt?: string, llmConfig?: Partial<LlmConfig> }) => {
    console.log("Updating agent:", data);
    const res = await fetch("/api/agents/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update agent");
    return res.json();
  },
  deleteAgent: async (agentUuid: string) => {
    console.log("Deleting agent:", agentUuid);
    const res = await fetch("/api/agents/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentUuid }),
    });
    if (!res.ok) throw new Error("Failed to delete agent");
    return res.json();
  },
  setAgentAsActive: async (agentUuid: string) => {
    console.log("Setting agent as active:", agentUuid);
    const res = await fetch(`/api/agents/set-active/${agentUuid}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to set agent as active");
    return res.json();
  }
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};


const AgentForm = ({
  agent,
  agentName,
  onSave,
  onCancel,
  onDelete,
  onSetActive,
}: {
  agent?: AgentVersion;
  agentName?: string;
  onSave: (data: any) => void;
  onCancel: () => void;
  onDelete?: (agentId: string) => void;
  onSetActive?: (agentId: string) => void;
}) => {
  const isCreateMode = !agent;
  const originalVersion = agent?.version; // storing teh original version for fallback
  const [formData, setFormData] = useState({
    name: agentName || (isCreateMode ? '' : ''),
    version: agent?.version || (isCreateMode ? '1.0.0' : ''),
    prompt: agent?.prompt || '',
    temperature: agent?.config?.temperature || 0.7,
    model: agent?.config?.model || '',
    provider: agent?.config?.provider || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreateMode && (!formData.name || !formData.prompt)) {
      toast.error("Agent Name and Prompt are required.");
      return;
    }

    // using original version if the field is empty in edit mode
    const versionToUse = !isCreateMode && !formData.version.trim()
      ? originalVersion
      : formData.version;

    setIsLoading(true);
    const payload = {
      name: formData.name,
      version: versionToUse,
      prompt: formData.prompt,
      llmConfig: {
        temperature: parseFloat(String(formData.temperature)),
        model: formData.model,
        provider: formData.provider,
      }
    };
    await onSave(payload);
    setIsLoading(false);
  };

  const handleAction = async (action?: (id: string) => void) => {
    if (agent && action) {
      setIsLoading(true);
      await action(agent.agentId);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-lg shadow-md w-full max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-white">{isCreateMode ? 'Create New Agent' : `Editing: ${agentName} - v${agent?.version}`}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-1">Agent Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} disabled={!isCreateMode} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:border-red-500" />
          </div>
          <div>
            <label htmlFor="version" className="block text-sm font-medium text-white mb-1">Version</label>
            <input
              type="text"
              name="version"
              id="version"
              value={formData.version}
              onChange={handleChange}
              placeholder={originalVersion}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-white mb-1">Prompt</label>
          <textarea name="prompt" id="prompt" value={formData.prompt} onChange={handleChange} required rows={8} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <fieldset className="border border-gray-300 p-4 rounded-md">
          <legend className="text-lg font-semibold text-white px-2">LLM Configuration</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-white mb-1">Temperature</label>
              <input type="number" step="0.1" name="temperature" id="temperature" value={formData.temperature} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-white mb-1">Model</label>
              <input type="text" name="model" id="model" value={formData.model} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-white mb-1">Provider</label>
              <input type="text" name="provider" id="provider" value={formData.provider} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </fieldset>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-white hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition">Cancel</button>
          {isCreateMode ? (
            <button type="submit" disabled={isLoading} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition">{isLoading ? 'Creating...' : 'Create Agent'}</button>
          ) : (
            <>
              {onDelete && !agent?.isActive && <button type="button" onClick={() => handleAction(onDelete)} disabled={isLoading} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 transition">{isLoading ? 'Deleting...' : 'Delete Agent'}</button>}
              {onSetActive && !agent?.isActive && <button type="button" onClick={() => handleAction(onSetActive)} disabled={isLoading} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 transition">{isLoading ? 'Setting Active...' : 'Set as Active'}</button>}
              <button type="submit" disabled={isLoading} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition">{isLoading ? 'Updating...' : 'Update Agent'}</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

const VersionCard = ({ version, onSelect }: { version: AgentVersion, onSelect: (v: AgentVersion) => void }) => (
  <div className="relative">
    {version.isActive && (
      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
        ACTIVE
      </span>
    )}
    <button onClick={() => onSelect(version)} className="w-full h-full p-4 rounded-lg shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left border border-gray-200 flex flex-col justify-between">
      <div>
        <p className="font-bold text-lg text-blue-600">v{version.version}</p>
      </div>
      <div className="text-xs text-gray-500 mt-4">
        <p>Created: {formatDate(version.createdAt)}</p>
        <p>Updated: {formatDate(version.updatedAt)}</p>
      </div>
    </button>
  </div>
);


// main component
export default function App() {
  const [agents, setAgents] = useState<AgentsData | null>(null);
  const [selectedAgentName, setSelectedAgentName] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<AgentVersion | null>(null);
  const [view, setView] = useState<'welcome' | 'versions' | 'form'>('welcome'); // 'welcome', 'versions', 'form'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true);
      try {
        const data = await api.getAllAgents();
        setAgents(data);
      } catch (error) {
        console.error("Failed to fetch agents:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const refreshAgents = async () => {
    setIsLoading(true);
    const data = await api.getAllAgents();
    setAgents(data);
    setIsLoading(false);
    handleAgentSelect(selectedAgentName);
  };

  const handleAgentSelect = (agentName: string | null) => {
    setSelectedAgentName(agentName);
    setSelectedVersion(null);
    if (agentName) {
      setView('versions');
    } else {
      setView('welcome');
    }
  };

  const handleCreateClick = () => {
    setSelectedAgentName(null);
    setSelectedVersion(null);
    setView('form');
  };

  const handleVersionSelect = (version: AgentVersion) => {
    setSelectedVersion(version);
    setView('form');
  };

  const handleCancelForm = () => {
    setSelectedVersion(null);
    if (selectedAgentName) {
      setView('versions');
    } else {
      setView('welcome');
    }
  };

  const handleSave = async (data: any) => {
    if (view === 'form' && !selectedVersion) { // for create mode
      await api.createAgent(data);
    } else { // for update mode
      await api.updateAgent({ name: selectedAgentName!, version: selectedVersion!.version, ...data });
    }
    await refreshAgents();
  };

  const handleDelete = async (agentId: string) => {
    if (window.confirm("Are you sure you want to delete this agent version?")) {
      await api.deleteAgent(agentId);
      await refreshAgents();
    }
  };

  const handleSetActive = async (agentId: string) => {
    await api.setAgentAsActive(agentId);
    await refreshAgents();
  };


  return (
    <div className="flex h-screen font-sans">
      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Left Panel */}
      <aside className="w-[20%] border-r border-gray-200 p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-white px-2">Available Agents</h2>
        <div className="flex-grow overflow-y-auto">
          {isLoading ? (
            <div className="text-center p-4">Loading...</div>
          ) : (
            <ul className="space-y-1">
              {agents && Object.keys(agents).map(name => (
                <li key={name}>
                  <button
                    onClick={() => handleAgentSelect(name)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition ${selectedAgentName === name
                        ? 'text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Right Panel */}
      <main className="w-[80%] p-8 overflow-y-auto">
        <div className="w-full h-full flex flex-col items-center justify-center">
          {view === 'welcome' && (
            <div className="text-center animate-fade-in">
              <h1 className="text-3xl font-bold text-white mb-4">Agent Management</h1>
              <p className="text-white mb-8">Select an agent from the left panel to view its versions, or create a new one.</p>
              <button
                onClick={handleCreateClick}
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
              >
                Create New Agent
              </button>
            </div>
          )}

          {view === 'versions' && selectedAgentName && agents && agents[selectedAgentName] && (
            <div>
              <button
                onClick={handleCreateClick}
                className="bg-blue-600 text-white font-bold py-2 px-5 mb-6 rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
              >
                Create New Agent
              </button>
              <div className="w-full animate-fade-in">
                <div className="flex flex-col mb-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-white ml-4">Versions for: {selectedAgentName}</h2>
                    <div /> {/* Spacer for alignment */}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {agents[selectedAgentName].map(version => (
                    <VersionCard key={version.agentId} version={version} onSelect={handleVersionSelect} />
                  ))}
                </div>
              </div>
            </div>)}

          {view === 'form' && (
            <AgentForm
              key={selectedVersion?.agentId || 'create'}
              agent={selectedVersion || undefined}
              agentName={selectedAgentName || undefined}
              onCancel={handleCancelForm}
              onSave={handleSave}
              onDelete={handleDelete}
              onSetActive={handleSetActive}
            />
          )}

        </div>
      </main>
    </div>
  );
}
