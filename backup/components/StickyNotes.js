// components/StickyNotes.js - Notes Management Component
import React, { useState } from 'react';
import { StickyNote, Plus, Trash2, Edit3, X } from 'lucide-react';

const StickyNotes = ({ notes, onAddNote, onDeleteNote, onEditNote }) => {
  // State for add note modal
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState('#FEF3C7');
  
  // State for editing notes
  const [editingNote, setEditingNote] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Available colors for sticky notes
  const noteColors = [
    { color: '#FEF3C7', name: 'Yellow' },
    { color: '#DBEAFE', name: 'Blue' },
    { color: '#D1FAE5', name: 'Green' },
    { color: '#FCE7F3', name: 'Pink' },
    { color: '#F3E8FF', name: 'Purple' },
    { color: '#FED7D7', name: 'Red' }
  ];

  // Handle adding a new note
  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      onAddNote({
        content: newNoteContent.trim(),
        color: newNoteColor
      });
      // Reset form
      setNewNoteContent('');
      setNewNoteColor('#FEF3C7');
      setShowAddNote(false);
    }
  };

  // Handle starting edit mode
  const startEditing = (note) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  // Handle saving edited note
  const saveEdit = () => {
    if (editContent.trim()) {
      onEditNote(editingNote, { content: editContent.trim() });
    }
    setEditingNote(null);
    setEditContent('');
  };

  // Handle canceling edit
  const cancelEdit = () => {
    setEditingNote(null);
    setEditContent('');
  };

  // Handle key press in edit mode
  const handleEditKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <StickyNote className="w-5 h-5 mr-2 text-yellow-600" />
          Sticky Notes
        </h3>
        <button
          onClick={() => setShowAddNote(true)}
          className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 transition-colors shadow-md hover:shadow-lg"
          title="Add new note"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Add Sticky Note</h4>
              <button
                onClick={() => setShowAddNote(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="What do you want to remember?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4 resize-none"
              rows="3"
              maxLength="200"
              autoFocus
            />
            
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Choose a color:</p>
              <div className="flex flex-wrap gap-3">
                {noteColors.map(({ color, name }) => (
                  <button
                    key={color}
                    onClick={() => setNewNoteColor(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                      newNoteColor === color ? 'border-gray-800 shadow-md' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    title={name}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleAddNote}
                disabled={!newNoteContent.trim()}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  newNoteContent.trim()
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Add Note
              </button>
              <button
                onClick={() => setShowAddNote(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map(note => (
          <div 
            key={note.id} 
            className="rounded-lg p-4 shadow-sm border-l-4 relative group hover:shadow-md transition-shadow"
            style={{ 
              backgroundColor: note.color,
              borderLeftColor: note.color === '#FEF3C7' ? '#F59E0B' : 
                               note.color === '#DBEAFE' ? '#3B82F6' :
                               note.color === '#D1FAE5' ? '#10B981' :
                               note.color === '#FCE7F3' ? '#EC4899' :
                               note.color === '#F3E8FF' ? '#8B5CF6' : '#EF4444'
            }}
          >
            {editingNote === note.id ? (
              // Edit mode
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleEditKeyPress}
                  onBlur={saveEdit}
                  className="w-full bg-transparent resize-none border-none focus:outline-none text-sm p-0"
                  rows="3"
                  maxLength="200"
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    Press Enter to save, Esc to cancel
                  </span>
                </div>
              </div>
            ) : (
              // Display mode
              <div>
                <p className="text-sm text-gray-800 break-words leading-relaxed mb-3">
                  {note.content}
                </p>
                
                {/* Action buttons - show on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => startEditing(note)}
                      className="p-1 rounded bg-white bg-opacity-80 hover:bg-opacity-100 shadow-sm transition-colors"
                      title="Edit note"
                    >
                      <Edit3 className="w-3 h-3 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 rounded bg-white bg-opacity-80 hover:bg-opacity-100 shadow-sm transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Note metadata */}
                <div className="flex items-center justify-between mt-2">
                  <div className="w-2 h-2 rounded-full opacity-50"
                       style={{ backgroundColor: note.color === '#FEF3C7' ? '#F59E0B' : 
                                                  note.color === '#DBEAFE' ? '#3B82F6' :
                                                  note.color === '#D1FAE5' ? '#10B981' :
                                                  note.color === '#FCE7F3' ? '#EC4899' :
                                                  note.color === '#F3E8FF' ? '#8B5CF6' : '#EF4444' }}>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Empty state */}
        {notes.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <StickyNote className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h4 className="text-lg font-medium mb-2">No sticky notes yet</h4>
            <p className="text-sm mb-4">Create your first note to keep track of important reminders</p>
            <button
              onClick={() => setShowAddNote(true)}
              className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Note
            </button>
          </div>
        )}
      </div>

      {/* Notes count */}
      {notes.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {notes.length} note{notes.length !== 1 ? 's' : ''} total
          </p>
        </div>
      )}
    </div>
  );
};

export default StickyNotes;