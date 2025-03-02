import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Download, X, Plus, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Trustee {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  photo_url: string;
  categories: string[];
  government_id_url: string;
  approval_type: string;
}

interface SuccessMessageProps {
  message: string;
  onClose: () => void;
}

function SuccessMessage({ message, onClose }: SuccessMessageProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center max-w-sm">
        <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <Check className="h-6 w-6 text-emerald-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">{message}</h3>
        <button
          onClick={onClose}
          className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center max-w-sm">
        <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">{message}</h3>
        <div className="mt-4 flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

interface TrusteeFormProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
  trustee?: Trustee;
  isView?: boolean;
}

function TrusteeForm({ onClose, onSuccess, trustee, isView }: TrusteeFormProps) {
  const [formData, setFormData] = useState({
    name: trustee?.name || '',
    email: trustee?.email || '',
    phone: trustee?.phone || '',
    relationship: trustee?.relationship || '',
    categories: trustee?.categories || [],
    photo_url: trustee?.photo_url || '',
    government_id_url: trustee?.government_id_url || '',
    approval_type: trustee?.approval_type || 'Group Request',
  });
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(trustee?.photo_url || null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const govIdInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const trusteeData = {
        ...formData,
        user_id: user.id,
      };

      if (trustee) {
        // Update existing trustee
        const { error } = await supabase
          .from('trustees')
          .update(trusteeData)
          .eq('id', trustee.id);
          
        if (error) throw error;
        onSuccess('Changes Added Successfully');
      } else {
        // Add new trustee
        const { error } = await supabase
          .from('trustees')
          .insert([trusteeData]);
          
        if (error) throw error;
        onSuccess('Trustee added Successfully');
      }
      
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `trustees/${fileName}`;
      
      // Create a URL for preview
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);
        
      setFormData({
        ...formData,
        photo_url: data.publicUrl,
      });
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError(error instanceof Error ? error.message : 'Error uploading photo');
    } finally {
      setUploading(false);
    }
  };

  const handleGovIdUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `government-ids/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('government-ids')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('government-ids')
        .getPublicUrl(filePath);
        
      setFormData({
        ...formData,
        government_id_url: data.publicUrl,
      });
      
    } catch (error) {
      console.error('Error uploading government ID:', error);
      setError(error instanceof Error ? error.message : 'Error uploading government ID');
    } finally {
      setUploading(false);
    }
  };

  const categoryOptions = ['Finance', 'Family', 'Financial Planning', 'Health', 'Insurance'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isView ? 'View Trustee' : trustee ? 'Edit Trustee' : 'Add Trustee'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Trustee Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isView}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Id
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isView}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Relationship
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                disabled={isView}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select</option>
                <option value="Sister">Sister</option>
                <option value="Brother">Brother</option>
                <option value="Parent">Parent</option>
                <option value="Child">Child</option>
                <option value="Spouse">Spouse</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone No
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isView}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access to Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  type="button"
                  disabled={isView}
                  onClick={() => {
                    const newCategories = formData.categories.includes(category)
                      ? formData.categories.filter((c) => c !== category)
                      : [...formData.categories, category];
                    setFormData({ ...formData, categories: newCategories });
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.categories.includes(category)
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {category}
                  {formData.categories.includes(category) && (
                    <X className="inline-block h-3 w-3 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <div className="mt-1 flex items-center">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                {!isView && (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploading}
                    className="ml-4 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Browse Files'}
                  </button>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isView || uploading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Government ID
              </label>
              <div className="mt-1 flex flex-col justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex flex-col items-center text-sm text-gray-600">
                    {formData.government_id_url ? (
                      <div className="text-xs text-green-600 mb-2">
                        Document uploaded successfully
                      </div>
                    ) : null}
                    {!isView && (
                      <button
                        type="button"
                        onClick={() => govIdInputRef.current?.click()}
                        disabled={uploading}
                        className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                      >
                        {uploading ? 'Uploading...' : 'Browse Files'}
                      </button>
                    )}
                    <input
                      ref={govIdInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleGovIdUpload}
                      className="hidden"
                      disabled={isView || uploading}
                    />
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approval Type
            </label>
            <div className="mt-1">
              <div className="text-xs text-gray-500 mb-2">
                This section outlines the individual request approval process. Access to specific user information can be granted to all the nominees of the user even if only one or some of the nominees requests for access.
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="group-request"
                    name="approval-type"
                    type="radio"
                    checked={formData.approval_type === 'Group Request'}
                    onChange={() => setFormData({ ...formData, approval_type: 'Group Request' })}
                    disabled={isView}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="group-request" className="ml-3 block text-sm font-medium text-gray-700">
                    Group Request
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="individual-request"
                    name="approval-type"
                    type="radio"
                    checked={formData.approval_type === 'Individual Request'}
                    onChange={() => setFormData({ ...formData, approval_type: 'Individual Request' })}
                    disabled={isView}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="individual-request" className="ml-3 block text-sm font-medium text-gray-700">
                    Individual Request
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="without-request"
                    name="approval-type"
                    type="radio"
                    checked={formData.approval_type === 'Without Request'}
                    onChange={() => setFormData({ ...formData, approval_type: 'Without Request' })}
                    disabled={isView}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="without-request" className="ml-3 block text-sm font-medium text-gray-700">
                    Without Request
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            {!isView && (
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : trustee ? 'Save Changes' : 'Submit'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export function Trustees() {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [selectedTrustee, setSelectedTrustee] = useState<Trustee | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [trustees, setTrustees] = useState<Trustee[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTrustees();
  }, []);

  const fetchTrustees = async () => {
    try {
      const { data, error } = await supabase
        .from('trustees')
        .select('*');

      if (error) throw error;
      setTrustees(data || []);
    } catch (error) {
      console.error('Error fetching trustees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrustee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trustees')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTrustees(trustees.filter(trustee => trustee.id !== id));
      setShowSuccess('Trustee deleted successfully');
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting trustee:', error);
    }
  };

  const filteredTrustees = trustees.filter(trustee => 
    trustee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trustee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trustee.relationship.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading trustees...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Trustees ({trustees.length})
          </h2>
          <div className="mt-1 flex items-center space-x-1">
            <span className="text-sm text-gray-500">Dashboard</span>
            <span className="text-sm text-gray-500">/</span>
            <span className="text-sm text-gray-700">Trustees</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setSelectedTrustee(null);
              setIsViewMode(false);
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Trustee
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email or relationship"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      {trustees.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No trustees yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first trustee.
          </p>
        </div>
      ) : filteredTrustees.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No matching trustees</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTrustees.map((trustee) => (
            <div
              key={trustee.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-end space-x-2 mb-4">
                <button
                  onClick={() => {
                    setSelectedTrustee(trustee);
                    setIsViewMode(false);
                    setShowForm(true);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-500"
                  title="Edit trustee"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setConfirmDelete(trustee.id)}
                  className="p-1 text-gray-400 hover:text-gray-500"
                  title="Delete trustee"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <img
                  src={trustee.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(trustee.name)}&background=random`}
                  alt={trustee.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {trustee.name}
                  </h3>
                  <p className="text-sm text-gray-500">{trustee.relationship}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="truncate">{trustee.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{trustee.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span>Approval: {trustee.approval_type}</span>
                </div>
                {trustee.categories && trustee.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {trustee.categories.map((category) => (
                      <span 
                        key={category} 
                        className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TrusteeForm
          onClose={() => {
            setShowForm(false);
            setSelectedTrustee(null);
            setIsViewMode(false);
            fetchTrustees(); // Refresh the list after form submission
          }}
          onSuccess={setShowSuccess}
          trustee={selectedTrustee || undefined}
          isView={isViewMode}
        />
      )}

      {showSuccess && (
        <SuccessMessage
          message={showSuccess}
          onClose={() => setShowSuccess(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Are you sure you want to delete this trustee? This action cannot be undone."
          onConfirm={() => handleDeleteTrustee(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}