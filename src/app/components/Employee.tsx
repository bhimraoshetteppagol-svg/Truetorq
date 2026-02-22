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
  Eye, 
  X,
  MessageSquare,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Minus,
  Upload,
  Send,
  Edit,
  Plus
} from 'lucide-react';
import { API_URL } from '../../config/api';

interface User {
  _id: string;
  email: string;
  role: string;
}

interface QuotationProduct {
  id: string;
  productName: string;
  description: string;
  quantity: number;
  price: string;
  unit: string;
  image: File | null;
  selected: boolean;
}

interface Lead {
  _id: string;
  productName: string;
  requesterEmail: string;
  contactNumber: string;
  quantity: number;
  quantityRequested?: number;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed';
  assignedTo?: string;
  assignedEmployee?: string;
  createdAt: string;
  updatedAt?: string;
  quotation?: any;
  comments?: any[];
}

export function Employee() {
  const navigate = useNavigate();
  
  // Authentication & User State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // UI State
  const [activeSection, setActiveSection] = useState<'leads' | 'tasks' | 'profile'>('leads');
  const [activeNavButton, setActiveNavButton] = useState<'home' | 'ai' | 'documents' | 'settings' | 'profile'>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  
  // Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [error, setError] = useState('');
  
  // Quotation Generation State
  const [currentStep, setCurrentStep] = useState(1);
  const [currency, setCurrency] = useState<'₹' | '$'>('₹');
  const [quotationExists, setQuotationExists] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
  // Products State
  const [products, setProducts] = useState<QuotationProduct[]>([]);
  
  // Terms & Conditions State
  const [termsData, setTermsData] = useState({
    discount: '5',
    applicableTaxes: '',
    taxesIncluded: false,
    shippingCharges: '100',
    shippingIncluded: false,
    deliveryPeriod: '1',
    deliveryUnit: 'Days' as 'Days' | 'Weeks' | 'Months',
    paymentTerms: '',
    additionalInformation: '',
    documents: [] as File[]
  });
  
  // Verification Details State
  const [verifyData, setVerifyData] = useState({
    primaryEmail: '',
    alternateEmail: '',
    primaryPhone: '',
    alternatePhone: '',
    pnsPhone: '',
    primaryPhoneSelected: false,
    alternatePhoneSelected: false,
    pnsPhoneSelected: true,
    addressType: 'Primary' as 'Primary' | 'Alternate' | 'Billing',
    addressLine1: '',
    addressLine2: '',
    addressPhone: ''
  });
  
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
      if (parsedUser.role?.toLowerCase() === 'employee') {
        setUser(parsedUser);
        setVerifyData(prev => ({ ...prev, primaryEmail: parsedUser.email }));
        fetchLeads(parsedUser.email);
      } else if (parsedUser.role?.toLowerCase() === 'admin') {
        navigate('/admin');
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
  const fetchLeads = async (email: string) => {
    try {
      const token = localStorage.getItem('token');
      // Backend will automatically filter by assignedEmployee for employees
      const response = await axios.get(`${API_URL}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Additional client-side filtering as fallback (check both assignedEmployee and assignedTo)
      const assignedLeads = response.data.filter((lead: Lead) => {
        const assignedEmployeeMatch = lead.assignedEmployee?.toLowerCase() === email.toLowerCase();
        const assignedToMatch = lead.assignedTo?.toLowerCase() === email.toLowerCase();
        return assignedEmployeeMatch || assignedToMatch;
      });
      const sortedLeads = assignedLeads.sort((a: Lead, b: Lead) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setLeads(sortedLeads);
      console.log(`Fetched ${sortedLeads.length} leads assigned to employee ${email}`);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Section Management
  const handleSectionClick = (section: 'leads' | 'tasks' | 'profile') => {
    setActiveSection(section);
    setError('');
    if (section === 'leads' && user) {
      fetchLeads(user.email);
    }
  };
  
  // Lead Actions
  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDetailsModal(true);
  };
  
  const handleGenerateQuotation = async (lead: Lead) => {
    setSelectedLead(lead);
    setError('');
    
    // Check if quotation exists
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/quotation/${lead._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Quotation exists
      setQuotationExists(true);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfGenerated(true);
      setCurrentStep(4);
      
      // Try to load quotation data
      try {
        const dataResponse = await axios.get(`${API_URL}/api/quotation/${lead._id}/data`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = dataResponse.data;
        if (data.products) setProducts(data.products);
        if (data.terms) setTermsData(data.terms);
        if (data.verify) setVerifyData(data.verify);
        if (data.currency) setCurrency(data.currency);
      } catch (err) {
        // Data not available, use defaults
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No quotation exists
        setQuotationExists(false);
        setProducts([{
          id: Date.now().toString(),
          productName: lead.productName || '',
          description: '',
          quantity: lead.quantityRequested || lead.quantity || 1,
          price: '',
          unit: 'Unit',
          image: null,
          selected: true
        }]);
        setCurrentStep(1);
        resetQuotationData();
      } else {
        // Error loading, start fresh
        setQuotationExists(false);
        setProducts([{
          id: Date.now().toString(),
          productName: lead.productName || '',
          description: '',
          quantity: lead.quantityRequested || lead.quantity || 1,
          price: '',
          unit: 'Unit',
          image: null,
          selected: true
        }]);
        setCurrentStep(1);
        resetQuotationData();
      }
    }
    
    setShowQuotationModal(true);
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
  
  // Quotation Workflow
  const resetQuotationData = () => {
    setTermsData({
      discount: '5',
      applicableTaxes: '',
      taxesIncluded: false,
      shippingCharges: '100',
      shippingIncluded: false,
      deliveryPeriod: '1',
      deliveryUnit: 'Days',
      paymentTerms: '',
      additionalInformation: '',
      documents: []
    });
    setVerifyData(prev => ({
      ...prev,
      alternateEmail: '',
      primaryPhone: '',
      alternatePhone: '',
      pnsPhone: '',
      primaryPhoneSelected: false,
      alternatePhoneSelected: false,
      pnsPhoneSelected: true,
      addressType: 'Primary',
      addressLine1: '',
      addressLine2: '',
      addressPhone: ''
    }));
    setPdfGenerated(false);
    setPdfUrl(null);
  };
  
  const handleNextStep = () => {
    if (currentStep < 4) {
      if (currentStep === 3) {
        handleGeneratePdf();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };
  
  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleStepClick = (step: number) => {
    if (quotationExists && step < 4) {
      return; // Disable steps 1-3 when quotation exists
    }
    setCurrentStep(step);
    if (step === 4) {
      handleGeneratePdf();
    }
  };
  
  // Product Management
  const handleAddProduct = () => {
    setProducts([...products, {
      id: Date.now().toString(),
      productName: '',
      description: '',
      quantity: 1,
      price: '',
      unit: 'Unit',
      image: null,
      selected: true
    }]);
  };
  
  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };
  
  const handleProductChange = (id: string, field: keyof QuotationProduct, value: any) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };
  
  const handleSelectAll = () => {
    const allSelected = products.every(p => p.selected);
    setProducts(products.map(p => ({ ...p, selected: !allSelected })));
  };
  
  const handleClearAll = () => {
    setProducts([]);
  };
  
  // Terms Management
  const handleTermsChange = (field: string, value: any) => {
    setTermsData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (termsData.documents.length + files.length > 4) {
      alert('Maximum 4 documents allowed');
      return;
    }
    setTermsData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };
  
  const handleRemoveDocument = (index: number) => {
    setTermsData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };
  
  // Verification Management
  const handleVerifyChange = (field: string, value: any) => {
    setVerifyData(prev => ({ ...prev, [field]: value }));
  };
  
  // PDF Generation
  const handleGeneratePdf = async () => {
    if (!selectedLead) return;
    
    setGeneratingPdf(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const selectedProducts = products.filter(p => p.selected);
      
      const payload = {
        leadId: selectedLead._id,
        products: selectedProducts,
        terms: termsData,
        verify: verifyData,
        currency,
        requesterEmail: selectedLead.requesterEmail,
        requesterNumber: selectedLead.contactNumber
      };
      
      const response = await axios.post(`${API_URL}/api/quotation/generate`, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfGenerated(true);
      setQuotationExists(true);
      
      if (user) {
        fetchLeads(user.email);
      }
    } catch (err: any) {
      let errorMessage = 'Failed to generate PDF';
      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please make sure the backend server is running.';
      } else if (err.response) {
        if (err.response.data instanceof Blob) {
          const text = await err.response.data.text();
          try {
            const json = JSON.parse(text);
            errorMessage = json.message || errorMessage;
          } catch {
            errorMessage = 'Server error occurred';
          }
        } else {
          errorMessage = err.response.data?.message || errorMessage;
        }
      }
      alert(errorMessage);
    } finally {
      setGeneratingPdf(false);
    }
  };
  
  const handleModify = () => {
    setQuotationExists(false);
    setCurrentStep(1);
    setPdfGenerated(false);
    setPdfUrl(null);
    if (selectedLead) {
      setProducts([{
        id: Date.now().toString(),
        productName: selectedLead.productName || '',
        description: '',
        quantity: selectedLead.quantityRequested || selectedLead.quantity || 1,
        price: '',
        unit: 'Unit',
        image: null,
        selected: true
      }]);
    }
    resetQuotationData();
  };
  
  const handleSendQuotation = async () => {
    if (!selectedLead || !pdfGenerated) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/quotation/send`, {
        leadId: selectedLead._id,
        requesterEmail: selectedLead.requesterEmail
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Quotation sent successfully!');
      setShowQuotationModal(false);
      if (user) {
        fetchLeads(user.email);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send quotation');
    }
  };
  
  const handleCloseQuotationModal = () => {
    setShowQuotationModal(false);
    setSelectedLead(null);
    setProducts([]);
    setCurrentStep(1);
    setQuotationExists(false);
    resetQuotationData();
    setPdfGenerated(false);
    setPdfUrl(null);
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
    inProgress: leads.filter(l => l.status === 'in-progress').length,
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
              <span className="text-[#30578e]">TT</span> Employee
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
              disabled
              className="px-3 sm:px-5 py-1.5 sm:py-2.5 border-2 border-black font-black uppercase text-[10px] sm:text-xs bg-neutral-200 text-neutral-500 cursor-not-allowed opacity-50 whitespace-nowrap"
            >
              User Management
            </button>
            <button
              onClick={() => handleSectionClick('tasks')}
              className={`px-3 sm:px-5 py-1.5 sm:py-2.5 border-2 border-black font-black uppercase text-[10px] sm:text-xs transition-all whitespace-nowrap ${
                activeSection === 'tasks'
                  ? 'bg-black text-white shadow-[3px_3px_0px_0px_#30578e]'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => handleSectionClick('profile')}
              className={`px-3 sm:px-5 py-1.5 sm:py-2.5 border-2 border-black font-black uppercase text-[10px] sm:text-xs transition-all whitespace-nowrap ${
                activeSection === 'profile'
                  ? 'bg-black text-white shadow-[3px_3px_0px_0px_#30578e]'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              Profile
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
                      Total: {leadStats.total} | Pending: {leadStats.pending} | In Progress: {leadStats.inProgress} | Completed: {leadStats.completed}
                    </div>
                  </div>
                </div>
                
                {leads.length === 0 ? (
                  <div className="text-center py-8 sm:py-10 border-4 border-black">
                    <p className="font-mono text-sm sm:text-base">No leads assigned to you yet</p>
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
                                onClick={() => handleViewDetails(lead)}
                                className="p-1 sm:p-1.5 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
                                title="View Details"
                              >
                                <Eye size={12} className="sm:w-[13px] sm:h-[13px]" />
                              </button>
                              <button
                                onClick={() => handleGenerateQuotation(lead)}
                                className="p-1 sm:p-1.5 border-2 border-black bg-white hover:bg-[#30578e] hover:text-white transition-colors"
                                title="Generate Quotation"
                              >
                                <FileCheck size={12} className="sm:w-[13px] sm:h-[13px]" />
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
            
            {activeSection === 'tasks' && (
              <div className="text-center py-8 sm:py-10 border-4 border-black">
                <p className="font-mono text-sm sm:text-base">No tasks assigned yet</p>
              </div>
            )}
            
            {activeSection === 'profile' && user && (
              <div className="border-4 border-black p-4 sm:p-6 md:p-8 bg-white max-w-2xl">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase mb-4 sm:mb-5">Profile</h2>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <div className="font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Email</div>
                    <div className="font-mono text-sm sm:text-base break-words">{user.email}</div>
                  </div>
                  <div>
                    <div className="font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Role</div>
                    <div className="font-mono text-sm sm:text-base">{user.role}</div>
                  </div>
                </div>
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
                onClick={() => { setActiveNavButton('home'); handleSectionClick('leads'); }}
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
                onClick={() => { setActiveNavButton('profile'); handleSectionClick('profile'); }}
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
                
                {selectedLead.quantity && (
                  <div className="p-3 sm:p-4 border-2 border-black">
                    <div className="font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Quantity Requested</div>
                    <div className="font-mono text-sm sm:text-base">{selectedLead.quantity}</div>
                  </div>
                )}
                
                {selectedLead.requesterEmail && (
                  <div className="p-3 sm:p-4 border-2 border-black">
                    <div className="font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Requester Email</div>
                    <div className="font-mono text-sm sm:text-base break-words">{selectedLead.requesterEmail}</div>
                  </div>
                )}
                
                {selectedLead.contactNumber && (
                  <div className="p-3 sm:p-4 border-2 border-black">
                    <div className="font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Contact Number</div>
                    <div className="font-mono text-sm sm:text-base">{formatPhone(selectedLead.contactNumber)}</div>
                  </div>
                )}
                
                {selectedLead.status && (
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
                )}
                
                {selectedLead.createdAt && (
                  <div className="p-3 sm:p-4 border-2 border-black">
                    <div className="font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Created At</div>
                    <div className="font-mono text-xs sm:text-sm">{formatDate(selectedLead.createdAt)}</div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quotation Generation Modal */}
      <AnimatePresence>
        {showQuotationModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => handleCloseQuotationModal()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-6xl w-full mx-2 sm:mx-4 md:mx-0 max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-2 sm:p-2.5 md:p-3 lg:p-4 border-b-4 border-black">
                <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-black uppercase pr-1 sm:pr-2 break-words flex-1">Create your customized quotation for requirement</h2>
                <div className="flex gap-1 sm:gap-1.5 flex-shrink-0 ml-2">
                  <button
                    onClick={() => handleCloseQuotationModal()}
                    className="p-1 sm:p-1.5 md:p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                    aria-label="Minimize"
                  >
                    <Minus size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  </button>
                  <button
                    onClick={() => handleCloseQuotationModal()}
                    className="p-1 sm:p-1.5 md:p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                    aria-label="Close"
                  >
                    <X size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">
                {/* Left Panel - Step Navigation */}
                <div className="w-full lg:w-48 xl:w-52 2xl:w-64 border-r-0 lg:border-r-4 border-b-4 lg:border-b-0 border-black bg-neutral-50 p-2 sm:p-2.5 md:p-3 lg:p-4 overflow-x-auto lg:overflow-y-auto flex-shrink-0">
                  <div className="flex lg:flex-col gap-1 sm:gap-1.5 lg:space-y-1 sm:lg:space-y-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <button
                        key={step}
                        onClick={() => handleStepClick(step)}
                        disabled={quotationExists && step < 4}
                        className={`text-left p-1.5 sm:p-2 md:p-2.5 lg:p-3 border-2 border-black font-bold uppercase transition-all text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs whitespace-normal break-words leading-tight ${
                          currentStep === step
                            ? 'bg-black text-white shadow-[3px_3px_0px_0px_#30578e]'
                            : quotationExists && step < 4
                            ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed opacity-50'
                            : 'bg-white text-black hover:bg-neutral-100'
                        }`}
                      >
                        Step {step}: {
                          step === 1 ? 'Select Product' :
                          step === 2 ? 'Terms & Conditions' :
                          step === 3 ? 'Verify Details' :
                          'Generate PDF'
                        }
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Right Panel - Step Content */}
                <div className="flex-1 p-2 sm:p-3 md:p-4 lg:p-5 overflow-y-auto min-h-0">
                  {/* Step 1: Select Product */}
                  {currentStep === 1 && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase">Select Product</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCurrency(currency === '₹' ? '$' : '₹')}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-black font-bold uppercase text-xs sm:text-sm ${
                              currency === '₹' ? 'bg-black text-white' : 'bg-white text-black'
                            }`}
                          >
                            ₹
                          </button>
                          <button
                            onClick={() => setCurrency(currency === '$' ? '₹' : '$')}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-black font-bold uppercase text-xs sm:text-sm ${
                              currency === '$' ? 'bg-black text-white' : 'bg-white text-black'
                            }`}
                          >
                            $
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                        <button
                          onClick={handleSelectAll}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors font-bold uppercase text-xs sm:text-sm"
                        >
                          Select All
                        </button>
                        <button
                          onClick={handleClearAll}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors font-bold uppercase text-xs sm:text-sm"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={handleAddProduct}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors font-bold uppercase text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                        >
                          <Plus size={14} className="sm:w-4 sm:h-4" />
                          Add Product
                        </button>
                      </div>
                      
                      <div className="space-y-3 sm:space-y-4">
                        {products.map((product) => (
                          <div key={product.id} className="border-4 border-black p-3 sm:p-4 md:p-6 bg-white">
                            <div className="flex items-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                              <input
                                type="checkbox"
                                checked={product.selected}
                                onChange={(e) => handleProductChange(product.id, 'selected', e.target.checked)}
                                className="mt-1 w-4 h-4 sm:w-5 sm:h-5 border-2 border-black"
                              />
                              <button
                                onClick={() => handleRemoveProduct(product.id)}
                                className="ml-auto p-1.5 sm:p-2 border-2 border-black hover:bg-red-600 hover:text-white transition-colors"
                              >
                                <X size={14} className="sm:w-4 sm:h-4" />
                              </button>
                            </div>
                            
                            <div className="mb-3 sm:mb-4 w-24 h-24 sm:w-32 sm:h-32 border-2 border-black bg-neutral-100 flex items-center justify-center">
                              <Upload size={18} className="sm:w-6 sm:h-6 text-neutral-400" />
                            </div>
                            
                            <div className="space-y-3 sm:space-y-4">
                              <div>
                                <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Product Name</label>
                                <input
                                  type="text"
                                  value={product.productName}
                                  onChange={(e) => handleProductChange(product.id, 'productName', e.target.value)}
                                  placeholder="Search product"
                                  className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                                />
                              </div>
                              
                              <div>
                                <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Description</label>
                                <textarea
                                  value={product.description}
                                  onChange={(e) => handleProductChange(product.id, 'description', e.target.value)}
                                  rows={3}
                                  className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors resize-none"
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                  <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Quantity</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={product.quantity}
                                    onChange={(e) => handleProductChange(product.id, 'quantity', parseInt(e.target.value) || 1)}
                                    className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                                  />
                                </div>
                                <div>
                                  <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Price</label>
                                  <div className="flex">
                                    <span className="border-2 border-r-0 border-black p-2 sm:p-3 font-bold text-xs sm:text-sm">{currency}</span>
                                    <input
                                      type="number"
                                      value={product.price}
                                      onChange={(e) => handleProductChange(product.id, 'price', e.target.value)}
                                      className="flex-1 border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                                    />
                                    <span className="border-2 border-l-0 border-black p-2 sm:p-3 font-bold text-xs sm:text-sm">{currency}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Unit</label>
                                <input
                                  type="text"
                                  value={product.unit}
                                  onChange={(e) => handleProductChange(product.id, 'unit', e.target.value)}
                                  className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                                />
                                <span className="text-xs sm:text-sm font-mono text-neutral-500">/ Unit</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Terms & Conditions */}
                  {currentStep === 2 && (
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase mb-4 sm:mb-6">Terms & Conditions</h3>
                      
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Discount</label>
                          <div className="flex">
                            <input
                              type="number"
                              value={termsData.discount}
                              onChange={(e) => handleTermsChange('discount', e.target.value)}
                              className="flex-1 border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                            />
                            <span className="border-2 border-l-0 border-black p-2 sm:p-3 font-bold text-xs sm:text-sm">%</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Applicable Taxes</label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={termsData.applicableTaxes}
                              onChange={(e) => handleTermsChange('applicableTaxes', e.target.value)}
                              placeholder="eg. 15"
                              className="flex-1 border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                            />
                            <span className="border-2 border-l-0 border-black p-2 sm:p-3 font-bold text-xs sm:text-sm">%</span>
                          </div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={termsData.taxesIncluded}
                              onChange={(e) => handleTermsChange('taxesIncluded', e.target.checked)}
                              className="w-4 h-4 border-2 border-black"
                            />
                            <span className="font-mono text-xs sm:text-sm">Included in product price</span>
                          </label>
                        </div>
                        
                        <div>
                          <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Shipping Charges (Incl. GST)</label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="number"
                              value={termsData.shippingCharges}
                              onChange={(e) => handleTermsChange('shippingCharges', e.target.value)}
                              className="flex-1 border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                            />
                            <span className="border-2 border-l-0 border-black p-2 sm:p-3 font-bold text-xs sm:text-sm">{currency}</span>
                          </div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={termsData.shippingIncluded}
                              onChange={(e) => handleTermsChange('shippingIncluded', e.target.checked)}
                              className="w-4 h-4 border-2 border-black"
                            />
                            <span className="font-mono text-xs sm:text-sm">Included in product price</span>
                          </label>
                        </div>
                        
                        <div>
                          <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Delivery Period</label>
                          <div className="flex gap-2">
                            <select
                              value={termsData.deliveryPeriod}
                              onChange={(e) => handleTermsChange('deliveryPeriod', e.target.value)}
                              className="border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                            >
                              {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num.toString()}>{num}</option>
                              ))}
                            </select>
                            <select
                              value={termsData.deliveryUnit}
                              onChange={(e) => handleTermsChange('deliveryUnit', e.target.value as 'Days' | 'Weeks' | 'Months')}
                              className="flex-1 border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                            >
                              <option>Days</option>
                              <option>Weeks</option>
                              <option>Months</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Payment Terms</label>
                          <input
                            type="text"
                            value={termsData.paymentTerms}
                            onChange={(e) => handleTermsChange('paymentTerms', e.target.value)}
                            placeholder="e.g Advance Payment"
                            className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Additional Information</label>
                          <textarea
                            value={termsData.additionalInformation}
                            onChange={(e) => handleTermsChange('additionalInformation', e.target.value)}
                            placeholder="Share More Details"
                            rows={5}
                            className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors resize-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Attach Documents (Max 4)</label>
                          <input
                            type="file"
                            multiple
                            accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg,.jpeg,.png,.ppt,.pptx"
                            onChange={handleDocumentUpload}
                            className="w-full border-2 border-black p-2 sm:p-3 font-mono text-xs sm:text-sm"
                          />
                          {termsData.documents.length > 0 && (
                            <div className="mt-3 sm:mt-4 space-y-2">
                              {termsData.documents.map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 border-2 border-black bg-neutral-50">
                                  <span className="font-mono text-xs sm:text-sm break-words">{doc.name}</span>
                                  <button
                                    onClick={() => handleRemoveDocument(idx)}
                                    className="p-1 border-2 border-black hover:bg-red-600 hover:text-white transition-colors flex-shrink-0 ml-2"
                                  >
                                    <X size={12} className="sm:w-[14px] sm:h-[14px]" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 3: Verify Details */}
                  {currentStep === 3 && (
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase mb-4 sm:mb-6">Verify Details</h3>
                      
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2">Primary Email</label>
                          <input
                            type="email"
                            value={verifyData.primaryEmail}
                            disabled
                            className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm bg-neutral-100"
                          />
                        </div>
                        
                        <div>
                          <label className="block font-bold uppercase text-xs sm:text-sm mb-1 sm:mb-2 flex items-center gap-2">
                            Alternate Email
                            <Edit size={12} className="sm:w-[14px] sm:h-[14px]" />
                          </label>
                          <input
                            type="email"
                            value={verifyData.alternateEmail}
                            onChange={(e) => handleVerifyChange('alternateEmail', e.target.value)}
                            className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block font-bold uppercase text-xs sm:text-sm">Phone Numbers</label>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={verifyData.primaryPhoneSelected}
                                onChange={(e) => handleVerifyChange('primaryPhoneSelected', e.target.checked)}
                                className="w-4 h-4 border-2 border-black"
                              />
                              <input
                                type="tel"
                                value={verifyData.primaryPhone}
                                onChange={(e) => handleVerifyChange('primaryPhone', e.target.value)}
                                placeholder="Primary Phone"
                                className="flex-1 border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={verifyData.alternatePhoneSelected}
                                onChange={(e) => handleVerifyChange('alternatePhoneSelected', e.target.checked)}
                                className="w-4 h-4 border-2 border-black"
                              />
                              <input
                                type="tel"
                                value={verifyData.alternatePhone}
                                onChange={(e) => handleVerifyChange('alternatePhone', e.target.value)}
                                placeholder="Alternate Phone"
                                className="flex-1 border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={verifyData.pnsPhoneSelected}
                                onChange={(e) => handleVerifyChange('pnsPhoneSelected', e.target.checked)}
                                className="w-4 h-4 border-2 border-black"
                              />
                              <input
                                type="tel"
                                value={verifyData.pnsPhone}
                                onChange={(e) => handleVerifyChange('pnsPhone', e.target.value)}
                                placeholder="PNS Phone"
                                className="flex-1 border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block font-bold uppercase text-xs sm:text-sm">Address</label>
                          <select
                            value={verifyData.addressType}
                            onChange={(e) => handleVerifyChange('addressType', e.target.value)}
                            className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                          >
                            <option>Primary</option>
                            <option>Alternate</option>
                            <option>Billing</option>
                          </select>
                          <input
                            type="text"
                            value={verifyData.addressLine1}
                            onChange={(e) => handleVerifyChange('addressLine1', e.target.value)}
                            placeholder="Address Line 1"
                            className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                          />
                          <input
                            type="text"
                            value={verifyData.addressLine2}
                            onChange={(e) => handleVerifyChange('addressLine2', e.target.value)}
                            placeholder="Address Line 2"
                            className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                          />
                          <input
                            type="tel"
                            value={verifyData.addressPhone}
                            onChange={(e) => handleVerifyChange('addressPhone', e.target.value)}
                            placeholder="Address Phone"
                            className="w-full border-2 border-black p-2 sm:p-3 font-mono text-sm focus:outline-none focus:bg-black focus:text-white transition-colors"
                          />
                        </div>
                        
                        <div className="p-3 sm:p-4 border-2 border-black bg-neutral-50">
                          <p className="font-mono text-xs sm:text-sm">Note: Above details will be displayed in the quotation</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 4: Generate PDF */}
                  {currentStep === 4 && (
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase mb-4 sm:mb-6">Generate PDF</h3>
                      
                      {pdfGenerated && pdfUrl ? (
                        <div className="border-4 border-black">
                          <iframe
                            src={pdfUrl}
                            className="w-full h-[400px] sm:h-[500px] md:h-[600px]"
                            title="Quotation PDF"
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8 sm:py-10 md:py-12 border-4 border-black">
                          <button
                            onClick={handleGeneratePdf}
                            disabled={generatingPdf}
                            className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors font-bold uppercase text-xs sm:text-sm disabled:opacity-50"
                          >
                            {generatingPdf ? 'Generating PDF...' : 'Generate PDF'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-2.5 sm:p-3 md:p-4 lg:p-5 border-t-4 border-black bg-neutral-50">
                <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 md:gap-3 items-center justify-between w-full">
                  {currentStep > 1 && (
                    <button
                      onClick={handleBackStep}
                      disabled={pdfGenerated && currentStep === 4}
                      className={`px-2.5 sm:px-3 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-2.5 border-2 border-black font-bold uppercase flex items-center gap-1 sm:gap-1.5 transition-colors text-[10px] sm:text-xs md:text-sm w-full sm:w-auto justify-center ${
                        pdfGenerated && currentStep === 4
                          ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed opacity-50'
                          : 'bg-white text-black hover:bg-black hover:text-white'
                      }`}
                    >
                      <ChevronLeft size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                      Back
                    </button>
                  )}
                  {currentStep < 4 && (
                    <button
                      onClick={handleNextStep}
                      className="px-2.5 sm:px-3 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-2.5 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors font-bold uppercase flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs md:text-sm w-full sm:w-auto justify-center"
                    >
                      Next
                      <ChevronRight size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                    </button>
                  )}
                  {currentStep === 4 && (
                    <>
                      <button
                        onClick={handleModify}
                        className="px-2.5 sm:px-3 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-2.5 border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors font-bold uppercase text-[10px] sm:text-xs md:text-sm w-full sm:w-auto"
                      >
                        Modify
                      </button>
                      <div className="font-mono text-[10px] sm:text-xs md:text-sm flex-1 text-center break-words px-1 sm:px-2">
                        Notification will be sent to: {selectedLead.requesterEmail}
                      </div>
                      <button
                        onClick={handleSendQuotation}
                        disabled={!pdfGenerated}
                        className="px-2.5 sm:px-3 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-2.5 border-2 border-black bg-[#30578e] text-white hover:bg-white hover:text-[#30578e] transition-colors font-bold uppercase flex items-center gap-1 sm:gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] sm:text-xs md:text-sm w-full sm:w-auto justify-center sm:ml-auto"
                      >
                        <Send size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                        Send
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

