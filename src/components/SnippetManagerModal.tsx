import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, Scissors } from 'lucide-react';
import { Modal } from './Modal';
import { useSnippetStore } from '../store/useSnippetStore';

interface SnippetManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SnippetManagerModal = ({ isOpen, onClose }: SnippetManagerModalProps) => {
    const { snippets, addSnippet, updateSnippet, deleteSnippet } = useSnippetStore();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');

    const handleAdd = () => {
        if (newKey.trim() && newValue.trim()) {
            addSnippet(newKey.trim(), newValue.trim());
            setNewKey('');
            setNewValue('');
            setIsAdding(false);
        }
    };

    const handleUpdate = (id: string) => {
        if (newKey.trim() && newValue.trim()) {
            updateSnippet(id, newKey.trim(), newValue.trim());
            setEditingId(null);
            setNewKey('');
            setNewValue('');
        }
    };

    const startEdit = (id: string, key: string, value: string) => {
        setEditingId(id);
        setNewKey(key);
        setNewValue(value);
        setIsAdding(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage Snippets">
            <div className="space-y-4">
                {!isAdding && !editingId && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-control border border-dashed border-border-element hover:border-interactive-primary/50 hover:bg-bg-wash transition-all text-text-secondary hover:text-interactive-primary"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-value font-medium">Add New Snippet</span>
                    </button>
                )}

                {(isAdding || editingId) && (
                    <div className="p-3 rounded-control border border-interactive-primary/20 bg-interactive-primary/5 space-y-3 animate-scale-in">
                        <div className="space-y-1">
                            <label className="text-accent text-text-placeholder px-1">Search Key</label>
                            <input
                                type="text"
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                                placeholder="e.g. email, iban, address"
                                className="w-full px-3 py-2 bg-bg-content border border-border-element rounded-control text-value focus:border-interactive-primary focus:ring-1 focus:ring-interactive-primary/20 outline-none transition-all"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-accent text-text-placeholder px-1">Value to Copy</label>
                            <textarea
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                placeholder="The text that will be copied to clipboard"
                                className="w-full px-3 py-2 bg-bg-content border border-border-element rounded-control text-value focus:border-interactive-primary focus:ring-1 focus:ring-interactive-primary/20 outline-none transition-all min-h-[80px] resize-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsAdding(false);
                                    setEditingId(null);
                                    setNewKey('');
                                    setNewValue('');
                                }}
                                className="flex-1 px-3 py-2 text-value font-medium text-text-secondary bg-bg-wash hover:bg-bg-content rounded-control transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                                disabled={!newKey.trim() || !newValue.trim()}
                                className="flex-1 px-3 py-2 text-value font-medium text-white bg-interactive-primary hover:bg-interactive-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-control transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                {editingId ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {snippets.map((snippet) => (
                        <div
                            key={snippet.id}
                            className="group flex items-center justify-between p-3 rounded-control border border-border-element hover:bg-bg-wash transition-colors"
                        >
                            <div className="flex-1 min-w-0 mr-4">
                                <p className="text-value font-medium text-text-primary truncate">{snippet.key}</p>
                                <p className="text-sm text-text-placeholder truncate">{snippet.value}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => startEdit(snippet.id, snippet.key, snippet.value)}
                                    className="p-1.5 text-text-placeholder hover:text-interactive-primary hover:bg-bg-content rounded-control transition-all"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => deleteSnippet(snippet.id)}
                                    className="p-1.5 text-text-placeholder hover:text-accent-danger hover:bg-bg-content rounded-control transition-all"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {snippets.length === 0 && !isAdding && (
                        <div className="py-12 text-center text-text-placeholder">
                            <Scissors className="w-12 h-12 mx-auto mb-3 opacity-10" />
                            <p className="text-value">No snippets yet</p>
                            <p className="text-sm">Create one to quickly copy text from search</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

