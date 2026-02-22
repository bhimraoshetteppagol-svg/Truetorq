import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { 
  Sun, 
  Moon, 
  LogOut, 
  Home, 
  Bot, 
  FileText, 
  Settings, 
  User, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  UserPlus,
  X,
  MessageSquare
} from 'lucide-react';
import { API_URL } from '../../config/api';

interface User {
  _id: string;
  email: string;
  role: string;
}

interface Employee {
  _id: string;
  email: string;
  role: string;
}

interface Product {
  _id: string;
  name?: string;
  productName?: string;
  description?: string;
  productDescription?: string;
  price: number;
  category: string;
}

interface Comment {
  comment: string;
  authorType: 'admin' | 'employee';
  createdAt: string;
}

interface Lead {
  _id: string;
  productName: string;
  requesterEmail: string;
  contactNumber: string;
  quantity: number;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed';
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
  quotation?: any;
  comments?: Comment[];
}

export function Admin() {
  const navigate = useNavigate();
  
  // Authentication & User State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // UI State
  const [activeSection, setActiveSection] = useState<'users' | 'employees' | 'products' | 'leads'>('leads');
  const [activeNavButton, setActiveNavButton] = useState<'home' | 'ai' | 'documents' | 'settings' | 'profile'>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [assignFormData, setAssignFormData] = useState({ employeeEmail: '', comment: '' });
  const [error, setError] = useState('');
  
  // Authentication Check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role?.toLowerCase() === 'admin') {
        setUser(parsedUser);
        fetchLeads();
      } else if (parsedUser.role?.toLowerCase() === 'employee') {
        navigate('/employee');
      } else if (parsedUser.role?.toLowerCase() === 'user') {
        navigate('/user');
      } else {
        navigate('/login');
      }
    } catch (err) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  // Theme Management
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  // Data Fetching
  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sortedLeads = response.data.sort((a: Lead, b: Lead) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLeads(sortedLeads);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    }
  };
  
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    }
  };
  
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    }
  };
  
  // Section Management
  const handleSectionClick = (section: 'users' | 'employees' | 'products' | 'leads') => {
    setActiveSection(section);
    setError('');
    
    if (section === 'users') fetchUsers();
    else if (section === 'employees') fetchEmployees();
    else if (section === 'products') fetchProducts();
    else if (section === 'leads') {
      fetchLeads();
      fetchEmployees();
    }
  };
  
  // CRUD Operations
  const handleAdd = () => {
    setEditingItem(null);
    if (activeSection === 'users') {
      setFormData({ email: '', password: '', role: 'user' });
    } else if (activeSection === 'employees') {
      setFormData({ email: '', password: '', role: 'employee' });
    } else if (activeSection === 'products') {
      setFormData({ name: '', description: '', price: '', category: 'Couplings' });
    }
    setShowModal(true);
    setError('');
  };
  
  const handleEdit = (item: any) => {
    setEditingItem(item);
    if (activeSection === 'users' || activeSection === 'employees') {
      setFormData({ email: item.email, password: '', role: item.role });
    } else if (activeSection === 'products') {
      setFormData({ 
        name: item.name, 
        description: item.description, 
        price: item.price.toString(), 
        category: item.category 
      });
    }
    setShowModal(true);
    setError('');
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeSection === 'users' ? 'users' : 
                      activeSection === 'employees' ? 'employees' : 'products';
      
      await axios.delete(`${API_URL}/api/${endpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (activeSection === 'users') fetchUsers();
      else if (activeSection === 'employees') fetchEmployees();
      else if (activeSection === 'products') fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeSection === 'users' ? 'users' : 
                      activeSection === 'employees' ? 'employees' : 'products';
      
      const payload: any = { ...formData };
      
      if (activeSection === 'users' || activeSection === 'employees') {
        if (editingItem) {
          // Update - only send password if provided
          if (!payload.password) {
            delete payload.password;
          }
          await axios.put(`${API_URL}/api/${endpoint}/${editingItem._id}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          // Create
          await axios.post(`${API_URL}/api/${endpoint}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } else if (activeSection === 'products') {
        payload.price = parseFloat(payload.price);
        if (editingItem) {
          await axios.put(`${API_URL}/api/${endpoint}/${editingItem._id}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          await axios.post(`${API_URL}/api/${endpoint}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }
      
      setShowModal(false);
      if (activeSection === 'users') fetchUsers();
      else if (activeSection === 'employees') fetchEmployees();
      else if (activeSection === 'products') fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save item');
    }
  };
  
  // Lead Management
  const handleAssign = (lead: Lead) => {
    setSelectedLead(lead);
    setAssignFormData({ employeeEmail: '', comment: '' });
    setShowAssignModal(true);
    if (employees.length === 0) fetchEmployees();
  };
  
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignFormData.employeeEmail) {
      setError('Please select an employee');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const payload: any = {
        assignedEmployee: assignFormData.employeeEmail
      };
      
      if (assignFormData.comment) {
        payload.comment = assignFormData.comment;
      }
      
      await axios.put(`${API_URL}/api/leads/${selectedLead?._id}/assign`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowAssignModal(false);
      fetchLeads();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign lead');
    }
  };
  
  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDetailsModal(true);
  };
  
  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeads();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete lead');
    }
  };
  
  const handleViewQuotation = async (leadId: string) => {
    try {
      setError(''); // Clear any previous errors
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }
      
      console.log('Generating PDF for lead:', leadId);
      console.log('API URL:', `${API_URL}/api/quotation/${leadId}`);
      
      const response = await fetch(`${API_URL}/api/quotation/${leadId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `Failed to generate PDF: ${response.status} ${response.statusText}`);
      }
      
      // Check if response is actually a PDF
      const contentType = response.headers.get('content-type');
      console.log('Content type:', contentType);
      
      if (!contentType || !contentType.includes('application/pdf')) {
        const text = await response.text();
        console.error('Expected PDF but got:', text);
        throw new Error('Server did not return a PDF file');
      }
      
      const blob = await response.blob();
      console.log('Blob size:', blob.size);
      
      if (blob.size === 0) {
        throw new Error('PDF file is empty');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotation-${leadId}.pdf`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      console.log('PDF downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      const errorMessage = error.message || 'Failed to download quotation PDF. Please try again.';
      setError(errorMessage);
      
      // Show error for 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };
  
  // Utility Functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${month} ${day}, ${year}, ${hours}:${minutes} ${ampm}`;
  };
  
  const formatPhone = (phone: string | undefined) => {
    if (!phone) return 'N/A';
    if (phone.startsWith('+91')) return phone;
    if (phone.length === 10) return `+91-${phone}`;
    return phone;
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'assigned': return '#007bff';
      case 'in-progress': return '#ffc107';
      case 'pending': return '#6c757d';
      default: return '#6c757d';
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  // Statistics
  const leadStats = {
    total: leads.length,
    pending: leads.filter(l => l.status === 'pending').length,
    assigned: leads.filter(l => l.status === 'assigned').length,
    completed: leads.filter(l => l.status === 'completed').length
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-black uppercase mb-4">Loading...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen font-sans ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b-4 border-black bg-white">
        <div className="container mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-lg sm:text-xl md:text-2xl font-black uppercase">
              <span className="text-[#30578e]">TT</span> Admin
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleLogout}
              className="px-2 sm:px-4 py-1.5 sm:py-2 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors font-bold uppercase text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
            >
              <LogOut size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="pt-14 sm:pt-16 pb-20 sm:pb-24">
        <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6">
          {/* Section Navigation */}
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-3 border-b-4 border-black pb-2 sm:pb-3 overflow-x-auto">
            <button
              onClick={() => handleSectionClick('leads')}
              className={`px-3 sm:px-5 py-1.5 sm:py-2.5 border-2 border-black font-black uppercase text-[10px] sm:text-xs transition-all whitespace-nowrap ${
                activeSection === 'leads'
                  ? 'bg-black text-white shadow-[3px_3px_0px_0px_#30578e]'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              Lead Management
            </button>
            <button
              onClick={() => handleSectionClick('users')}
              className={`px-3 sm:px-5 py-1.5 sm:py-2.5 border-2 border-black font-black uppercase text-[10px] sm:text-xs transition-all whitespace-nowrap ${
                activeSection === 'users'
                  ? 'bg-black text-white shadow-[3px_3px_0px_0px_#30578e]'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => handleSectionClick('employees')}
              className={`px-3 sm:px-5 py-1.5 sm:py-2.5 border-2 border-black font-black uppercase text-[10px] sm:text-xs transition-all whitespace-nowrap ${
                activeSection === 'employees'
                  ? 'bg-black text-white shadow-[3px_3px_0px_0px_#30578e]'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              Employee Management
            </button>
            <button
              onClick={() => handleSectionClick('products')}
              className={`px-3 sm:px-5 py-1.5 sm:py-2.5 border-2 border-black font-black uppercase text-[10px] sm:text-xs transition-all whitespace-nowrap ${
                activeSection === 'products'
                  ? 'bg-black text-white shadow-[3px_3px_0px_0px_#30578e]'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              Product Management
            </button>
          </div>
          
          {/* Content Area */}
          <div className="mt-4 sm:mt-6">
            {activeSection === 'leads' && (
              <div>
                <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase mb-1 sm:mb-1.5">Lead Management</h2>
                    <div className="font-mono text-[10px] sm:text-xs whitespace-nowrap overflow-x-auto">
                      Total: {leadStats.total} | Pending: {leadStats.pending} | Assigned: {leadStats.assigned} | Completed: {leadStats.completed}
                    </div>
                  </div>
                </div>
                
                {leads.length === 0 ? (
                  <div className="text-center py-8 sm:py-10 border-4 border-black">
                    <p className="font-mono text-sm sm:text-base">No leads found</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {leads.map((lead) => (
                      <div key={lead._id} className="border-4 border-black p-3 sm:p-5 bg-white shadow-[6px_6px_0px_0px_#30578e]">
                        <div className="flex flex-col md:flex-row justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-1.5">
                              <span className="font-mono text-[9px] sm:text-[10px]">{formatDate(lead.createdAt)}</span>
                              <span
                                className="px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase"
                                style={{ 
                                  backgroundColor: getStatusColor(lead.status),
                                  color: 'white'
                                }}
                              >
                                {lead.status}
                              </span>
                            </div>
                            <div className="font-black text-sm sm:text-base mb-1 sm:mb-1.5 break-words">{lead.productName}</div>
                            <div className="font-mono text-[10px] sm:text-xs space-y-0.5">
                              <div className="break-words">Requester: {lead.requesterEmail}</div>
                              <div>Contact: {formatPhone(lead.contactNumber)}</div>
                              <div>Quantity: {lead.quantity}</div>
                              {lead.assignedTo && <div className="break-words">Assigned To: {lead.assignedTo}</div>}
                            </div>
                          </div>
                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1.5">
                            <div className="font-mono text-[9px] sm:text-[10px] text-neutral-500 break-all">{lead._id.substring(0, 8)}...</div>
                            {lead.quotation && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleViewQuotation(lead._id);
                                }}
                                className="text-[9px] sm:text-[10px] font-bold text-[#30578e] hover:underline cursor-pointer whitespace-nowrap"
                                type="button"
                              >
                                ✓ Quotation
                              </button>
                            )}
                            <div className="flex gap-1 sm:gap-1.5">
                              <button
                                onClick={() => handleAssign(lead)}
                                disabled={lead.status !== 'pending'}
                                className={`p-1 sm:p-1.5 border-2 border-black ${
                                  lead.status === 'pending'
                                    ? 'bg-white hover:bg-black hover:text-white'
                                    : 'bg-neutral-200 opacity-50 cursor-not-allowed'
                                } transition-colors`}
                                title="Assign Lead"
                              >
                                <UserPlus size={12} className="sm:w-[13px] sm:h-[13px]" />
                              </button>
                              <button
                                onClick={() => handleViewDetails(lead)}
                                className="p-1 sm:p-1.5 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
                                title="View Details"
                              >
                                <Eye size={12} className="sm:w-[13px] sm:h-[13px]" />
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead._id)}
                                className="p-1 sm:p-1.5 border-2 border-black bg-white hover:bg-red-600 hover:text-white transition-colors"
                                title="Delete Lead"
                              >
                                <Trash2 size={12} className="sm:w-[13px] sm:h-[13px]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeSection === 'users' && (
              <div>
                <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h2 className="text-xl sm:text-2xl font-black uppercase">User Management</h2>
                  <button
                    onClick={handleAdd}
                    className="px-3 sm:px-5 py-1.5 sm:py-2.5 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors font-bold uppercase text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-center"
                  >
                    <Plus size={12} className="sm:w-[13px] sm:h-[13px]" />
                    Add User
                  </button>
                </div>
                
                {users.length === 0 ? (
                  <div className="text-center py-8 sm:py-10 border-4 border-black">
                    <p className="font-mono text-sm sm:text-base">No users found</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {users.map((userItem) => (
                      <div key={userItem._id} className="border-4 border-black p-3 sm:p-5 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-sm sm:text-base break-words">{userItem.email}</div>
                          <div className="font-mono text-[10px] sm:text-xs text-neutral-500">{userItem.role}</div>
                        </div>
                        <div className="flex gap-1 sm:gap-1.5 justify-end sm:justify-start">
                          <button
                            onClick={() => handleEdit(userItem)}
                            className="p-1 sm:p-1.5 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
                          >
                            <Edit size={12} className="sm:w-[13px] sm:h-[13px]" />
                          </button>
                          <button
                            onClick={() => handleDelete(userItem._id)}
                            className="p-1 sm:p-1.5 border-2 border-black bg-white hover:bg-red-600 hover:text-white transition-colors"
                          >
                            <Trash2 size={12} className="sm:w-[13px] sm:h-[13px]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeSection === 'employees' && (
              <div>
                <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h2 className="text-xl sm:text-2xl font-black uppercase">Employee Management</h2>
                  <button
                    onClick={handleAdd}
                    className="px-3 sm:px-5 py-1.5 sm:py-2.5 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors font-bold uppercase text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-center"
                  >
                    <Plus size={12} className="sm:w-[13px] sm:h-[13px]" />
                    Add Employee
                  </button>
                </div>
                
                {employees.length === 0 ? (
                  <div className="text-center py-8 sm:py-10 border-4 border-black">
                    <p className="font-mono text-sm sm:text-base">No employees found</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {employees.map((employee) => (
                      <div key={employee._id} className="border-4 border-black p-3 sm:p-5 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-sm sm:text-base break-words">{employee.email}</div>
                          <div className="font-mono text-[10px] sm:text-xs text-neutral-500">{employee.role}</div>
                        </div>
                        <div className="flex gap-1 sm:gap-1.5 justify-end sm:justify-start">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="p-1 sm:p-1.5 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
                          >
                            <Edit size={12} className="sm:w-[13px] sm:h-[13px]" />
                          </button>
                          <button
                            onClick={() => handleDelete(employee._id)}
                            className="p-1 sm:p-1.5 border-2 border-black bg-white hover:bg-red-600 hover:text-white transition-colors"
                          >
                            <Trash2 size={12} className="sm:w-[13px] sm:h-[13px]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeSection === 'products' && (
              <div>
                <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h2 className="text-xl sm:text-2xl font-black uppercase">Product Management</h2>
                  <button
                    onClick={handleAdd}
                    className="px-3 sm:px-5 py-1.5 sm:py-2.5 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors font-bold uppercase text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-center"
                  >
                    <Plus size={12} className="sm:w-[13px] sm:h-[13px]" />
                    Add Product
                  </button>
                </div>
                
                {products.length === 0 ? (
                  <div className="text-center py-8 sm:py-10 border-4 border-black">
                    <p className="font-mono text-sm sm:text-base">No products found</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {products.map((product) => {
                      const productName = product.productName || product.name || 'N/A';
                      const productDescription = product.productDescription || product.description || 'No description available';
                      const price = product.price || 0;
                      const category = product.category || 'Uncategorized';
                      
                      return (
                        <div key={product._id} className="border-4 border-black p-3 sm:p-5 bg-white">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                            <div className="flex-1 space-y-2 sm:space-y-2.5 min-w-0">
                              <div>
                                <div className="font-mono text-[9px] sm:text-[10px] text-neutral-500 uppercase mb-0.5">Product Name</div>
                                <div className="font-black text-sm sm:text-base break-words">{productName}</div>
                              </div>
                              <div>
                                <div className="font-mono text-[9px] sm:text-[10px] text-neutral-500 uppercase mb-0.5">Category</div>
                                <div className="font-mono text-[10px] sm:text-xs font-bold">{category}</div>
                              </div>
                              <div>
                                <div className="font-mono text-[9px] sm:text-[10px] text-neutral-500 uppercase mb-0.5">Price</div>
                                <div className="font-mono text-[10px] sm:text-xs font-bold">₹{price.toFixed(2)}</div>
                              </div>
                              <div>
                                <div className="font-mono text-[9px] sm:text-[10px] text-neutral-500 uppercase mb-0.5">Product Description</div>
                                <div className="font-mono text-[10px] sm:text-xs break-words">{productDescription}</div>
                              </div>
                            </div>
                            <div className="flex gap-1 sm:gap-1.5 sm:ml-3 justify-end sm:justify-start">
                              <button
                                onClick={() => handleEdit(product)}
                                className="p-1 sm:p-1.5 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
                              >
                                <Edit size={12} className="sm:w-[13px] sm:h-[13px]" />
                              </button>
                              <button
                                onClick={() => handleDelete(product._id)}
                                className="p-1 sm:p-1.5 border-2 border-black bg-white hover:bg-red-600 hover:text-white transition-colors"
                              >
                                <Trash2 size={12} className="sm:w-[13px] sm:h-[13px]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-4 border-black bg-white">
        <div className="container mx-auto px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between mb-1 sm:mb-1.5">
            <div className="flex gap-1 sm:gap-1.5 flex-1 justify-center sm:justify-start">
              <button
                onClick={() => setActiveNavButton('home')}
                className={`p-2 sm:p-2.5 border-2 border-black transition-all ${
                  activeNavButton === 'home'
                    ? 'bg-black text-white shadow-[3px_3px_0px_0px_#30578e]'
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                <Home size={14} className="sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setActiveNavButton('ai')}
                className={`p-2 sm:p-2.5 border-2 border-black transition-all ${
                  activeNavButton === 'ai'
                    ? 'bg-black text-white shadow-[3px_3px_0px_0px_#30578e]'
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                <Bot size={14} className="sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setActiveNavButton('documents')}
                className={`p-2 sm:p-2.5 border-2 border-black transition-all ${
                  activeNavButton === 'documents'
                    ? 'bg-black text-white shadow-[3px_3px_0px_0px_#30578e]'
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                <FileText size={14} className="sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setActiveNavButton('settings')}
                className={`p-2 sm:p-2.5 border-2 border-black transition-all ${
                  activeNavButton === 'settings'
                    ? 'bg-black text-white shadow-[3px_3px_0px_0px_#30578e]'
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                <Settings size={14} className="sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setActiveNavButton('profile')}
                className={`p-2 sm:p-2.5 border-2 border-black transition-all ${
                  activeNavButton === 'profile'
                    ? 'bg-black text-white shadow-[3px_3px_0px_0px_#30578e]'
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                <User size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
          <div className="text-center font-mono text-[9px] sm:text-[10px] text-neutral-500">
            Your LeadsCruise AI is working 24x7!
          </div>
        </div>
      </nav>
      
      {/* Chat Button - Positioned so its bottom aligns with top of bottom nav */}
      <button className="fixed bottom-[70px] sm:bottom-[86px] right-3 sm:right-6 z-40 p-2 sm:p-3 border-4 border-black bg-[#30578e] text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all">
        <MessageSquare size={16} className="sm:w-[19px] sm:h-[19px]" />
      </button>
      
      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full mx-4 sm:mx-0 p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase">
                  {editingItem ? 'Edit' : 'Add'} {activeSection === 'users' ? 'User' : activeSection === 'employees' ? 'Employee' : 'Product'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 sm:p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
              
              {error && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border-2 border-red-500 text-red-700 font-mono text-xs sm:text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {(activeSection === 'users' || activeSection === 'employees') ? (
                  <>
                    <div>
                      <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">
                        Password {editingItem && <span className="text-[10px]">(leave empty to keep existing)</span>}
                      </label>
                      <input
                        type="password"
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingItem}
                        className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Role</label>
                      <input
                        type="text"
                        value={formData.role || ''}
                        disabled
                        className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm bg-neutral-100"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Product Name</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={4}
                        className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors resize-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Category</label>
                      <select
                        value={formData.category || 'Couplings'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                      >
                        <option>Couplings</option>
                        <option>Gear pump</option>
                        <option>Torque Limiters</option>
                      </select>
                    </div>
                  </>
                )}
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border-2 border-black bg-white text-black hover:bg-neutral-100 transition-colors font-bold uppercase text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors font-bold uppercase text-xs sm:text-sm"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Assign Lead Modal */}
      <AnimatePresence>
        {showAssignModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full mx-4 sm:mx-0 p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase">Assign Lead</h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-1.5 sm:p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 border-2 border-black bg-neutral-50">
                <div className="font-black text-base sm:text-lg mb-1 sm:mb-2 break-words">{selectedLead.productName}</div>
                <div className="font-mono text-xs sm:text-sm space-y-1">
                  <div>Quantity: {selectedLead.quantity}</div>
                  <div className="break-words">Requester: {selectedLead.requesterEmail}</div>
                </div>
              </div>
              
              {error && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border-2 border-red-500 text-red-700 font-mono text-xs sm:text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleAssignSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Select Employee</label>
                  {employees.length === 0 ? (
                    <div className="p-3 sm:p-4 border-2 border-black bg-neutral-100 font-mono text-xs sm:text-sm">
                      {employees.length === 0 ? 'Loading employees...' : 'No employees found'}
                    </div>
                  ) : (
                    <select
                      value={assignFormData.employeeEmail}
                      onChange={(e) => setAssignFormData({ ...assignFormData, employeeEmail: e.target.value })}
                      required
                      className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                    >
                      <option value="">Select an employee</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp.email}>
                          {emp.email}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div>
                  <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Additional Comment (Optional)</label>
                  <textarea
                    value={assignFormData.comment}
                    onChange={(e) => setAssignFormData({ ...assignFormData, comment: e.target.value })}
                    rows={4}
                    className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors resize-none"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border-2 border-black bg-white text-black hover:bg-neutral-100 transition-colors font-bold uppercase text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors font-bold uppercase text-xs sm:text-sm"
                  >
                    Assign
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Lead Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-3xl w-full mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase">Lead Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1.5 sm:p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 border-2 border-black">
                  <div className="font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Lead ID</div>
                  <div className="font-mono text-[10px] sm:text-xs break-all">{selectedLead._id}</div>
                </div>
                
                <div className="p-3 sm:p-4 border-2 border-black">
                  <div className="font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Product Name</div>
                  <div className="font-black text-base sm:text-lg break-words">{selectedLead.productName}</div>
                </div>
                
                <div className="p-3 sm:p-4 border-2 border-black">
                  <div className="font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Quantity Requested</div>
                  <div className="font-mono text-sm sm:text-base">{selectedLead.quantity}</div>
                </div>
                
                <div className="p-3 sm:p-4 border-2 border-black">
                  <div className="font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Requester Email</div>
                  <div className="font-mono text-sm sm:text-base break-words">{selectedLead.requesterEmail}</div>
                </div>
                
                <div className="p-3 sm:p-4 border-2 border-black">
                  <div className="font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Contact Number</div>
                  <div className="font-mono text-sm sm:text-base">{formatPhone(selectedLead.contactNumber)}</div>
                </div>
                
                <div className="p-3 sm:p-4 border-2 border-black">
                  <div className="font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Status</div>
                  <span
                    className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold uppercase"
                    style={{ 
                      backgroundColor: getStatusColor(selectedLead.status),
                      color: 'white'
                    }}
                  >
                    {selectedLead.status}
                  </span>
                </div>
                
                {selectedLead.assignedTo && (
                  <div className="p-3 sm:p-4 border-2 border-black">
                    <div className="font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Assigned To</div>
                    <div className="font-mono text-sm sm:text-base break-words">{selectedLead.assignedTo}</div>
                  </div>
                )}
                
                <div className="p-3 sm:p-4 border-2 border-black">
                  <div className="font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Created At</div>
                  <div className="font-mono text-xs sm:text-sm">{formatDate(selectedLead.createdAt)}</div>
                </div>
                
                {selectedLead.updatedAt && (
                  <div className="p-3 sm:p-4 border-2 border-black">
                    <div className="font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Last Updated</div>
                    <div className="font-mono text-xs sm:text-sm">{formatDate(selectedLead.updatedAt)}</div>
                  </div>
                )}
                
                {selectedLead.quotation && (
                  <div className="p-3 sm:p-4 border-2 border-black">
                    <div className="font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Quotation Status</div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleViewQuotation(selectedLead._id);
                      }}
                      className="text-xs sm:text-sm font-bold text-[#30578e] hover:underline cursor-pointer break-words"
                      type="button"
                    >
                      ✓ Quotation Generated - Click to View
                    </button>
                  </div>
                )}
                
                {selectedLead.comments && selectedLead.comments.length > 0 && (
                  <div className="p-3 sm:p-4 border-2 border-black">
                    <div className="font-bold uppercase text-xs sm:text-sm mb-3 sm:mb-4">Comments</div>
                    <div className="space-y-2 sm:space-y-3">
                      {selectedLead.comments.map((comment, idx) => (
                        <div key={idx} className="p-2 sm:p-3 border-2 border-neutral-300 bg-neutral-50">
                          <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
                            <span className={`px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold uppercase ${
                              comment.authorType === 'admin' 
                                ? 'bg-[#30578e] text-white' 
                                : 'bg-neutral-600 text-white'
                            }`}>
                              {comment.authorType === 'admin' ? 'Admin' : 'Employee'}
                            </span>
                            <span className="font-mono text-[10px] sm:text-xs text-neutral-500">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <div className="font-mono text-xs sm:text-sm break-words">{comment.comment}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


