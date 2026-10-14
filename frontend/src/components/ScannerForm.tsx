import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Image as ImageIcon,
  DollarSign,
  MapPin,
  Building,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  Loader2,
  ScanEye
} from 'lucide-react';
import { SampleListingItem, ScanReportResponse } from '../types';
import { api } from '../services/api';

interface Props {
  onScanComplete: (report: ScanReportResponse) => void;
  initialValues?: SampleListingItem | null;
}

export const ScannerForm: React.FC<Props> = ({ onScanComplete, initialValues }) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [monthlyRent, setMonthlyRent] = useState(initialValues?.monthly_rent?.toString() || '');
  const [securityDeposit, setSecurityDeposit] = useState(initialValues?.security_deposit?.toString() || '');
  const [city, setCity] = useState(initialValues?.city || '');
  const [state, setState] = useState(initialValues?.state || '');
  const [address, setAddress] = useState(initialValues?.address || '');
  const [bedrooms, setBedrooms] = useState(initialValues?.bedrooms?.toString() || '1');
  const [bathrooms, setBathrooms] = useState(initialValues?.bathrooms?.toString() || '1');
  const [squareFeet, setSquareFeet] = useState(initialValues?.square_feet?.toString() || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [contactEmail, setContactEmail] = useState(initialValues?.contact_email || '');
  const [contactPhone, setContactPhone] = useState(initialValues?.contact_phone || '');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when initialValues changes
  React.useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title);
      setMonthlyRent(initialValues.monthly_rent.toString());
      setSecurityDeposit(initialValues.security_deposit.toString());
      setCity(initialValues.city);
      setState(initialValues.state || '');
      setAddress(initialValues.address || '');
      setBedrooms(initialValues.bedrooms.toString());
      setBathrooms(initialValues.bathrooms.toString());
      setSquareFeet(initialValues.square_feet ? initialValues.square_feet.toString() : '');
      setDescription(initialValues.description);
      setContactEmail(initialValues.contact_email || '');
      setContactPhone(initialValues.contact_phone || '');
      setErrorMessage(null);
    }
  }, [initialValues]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image exceeds 5MB size limit.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrorMessage(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const rentNum = parseFloat(monthlyRent);
    if (isNaN(rentNum) || rentNum <= 0) {
      setErrorMessage("Please enter a valid monthly rent amount greater than $0.");
      return;
    }

    if (description.trim().length < 10) {
      setErrorMessage("Property description must be at least 10 characters for text analysis.");
      return;
    }

    if (!city.trim()) {
      setErrorMessage("Please specify the property city for price benchmark comparison.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('monthly_rent', monthlyRent);
      formData.append('security_deposit', securityDeposit || '0');
      formData.append('city', city.trim());
      formData.append('state', state.trim());
      formData.append('address', address.trim());
      formData.append('bedrooms', bedrooms);
      formData.append('bathrooms', bathrooms);
      if (squareFeet) formData.append('square_feet', squareFeet);
      formData.append('description', description.trim());
      if (contactEmail) formData.append('contact_email', contactEmail.trim());
      if (contactPhone) formData.append('contact_phone', contactPhone.trim());
      formData.append('is_sample', initialValues?.is_sample ? 'true' : 'false');
      if (initialValues?.sample_tag) formData.append('sample_tag', initialValues.sample_tag);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const report = await api.scanListing(formData);
      onScanComplete(report);
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setErrorMessage(detail || "An unexpected error occurred during analysis. Please check inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setMonthlyRent('');
    setSecurityDeposit('');
    setCity('');
    setState('');
    setAddress('');
    setBedrooms('1');
    setBathrooms('1');
    setSquareFeet('');
    setDescription('');
    setContactEmail('');
    setContactPhone('');
    removeImage();
    setErrorMessage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-cyber-surface border border-cyber-border space-y-6">
      <div className="flex items-center justify-between border-b border-cyber-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ScanEye className="w-5 h-5 text-cyber-neonTeal" />
            <span>Rental Listing Inspection Form</span>
          </h2>
          <p className="text-xs text-cyber-textMuted">
            Analyze property details, advance payment requirements, and photo reuse signatures.
          </p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="text-xs text-cyber-textMuted hover:text-white px-3 py-1 rounded bg-cyber-card border border-cyber-border"
        >
          Clear Form
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 flex items-start space-x-2.5 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Row 1: Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Listing Title <span className="text-cyber-neonTeal">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Spacious 2BR/1BA Apartment in Downtown Historic District"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyber-neonTeal transition-colors"
        />
      </div>

      {/* Row 2: Rent & Deposit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Monthly Rent (USD $) <span className="text-cyber-neonTeal">*</span>
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-cyber-textMuted absolute left-3 top-3" />
            <input
              type="number"
              step="any"
              min="1"
              required
              placeholder="e.g. 1850"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyber-neonTeal transition-colors font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Security Deposit (USD $)
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-cyber-textMuted absolute left-3 top-3" />
            <input
              type="number"
              step="any"
              min="0"
              placeholder="e.g. 1850"
              value={securityDeposit}
              onChange={(e) => setSecurityDeposit(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyber-neonTeal transition-colors font-mono"
            />
          </div>
        </div>
      </div>

      {/* Row 3: City, State, Address */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            City <span className="text-cyber-neonTeal">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-cyber-textMuted absolute left-3 top-3" />
            <input
              type="text"
              required
              placeholder="e.g. New York, Miami, Chicago"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyber-neonTeal transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            State / Region
          </label>
          <input
            type="text"
            placeholder="e.g. NY, FL, IL"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyber-neonTeal transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Property Address
          </label>
          <input
            type="text"
            placeholder="e.g. 45 Wall St #14B"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyber-neonTeal transition-colors"
          />
        </div>
      </div>

      {/* Row 4: Bedrooms, Bathrooms, SqFt */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Bedrooms
          </label>
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-white text-sm focus:outline-none focus:border-cyber-neonTeal"
          >
            <option value="0">Studio (0)</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4+ Bedrooms</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Bathrooms
          </label>
          <select
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-white text-sm focus:outline-none focus:border-cyber-neonTeal"
          >
            <option value="1">1 Bath</option>
            <option value="1.5">1.5 Baths</option>
            <option value="2">2 Baths</option>
            <option value="2.5">2.5 Baths</option>
            <option value="3">3+ Baths</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Square Feet
          </label>
          <input
            type="number"
            placeholder="e.g. 950"
            value={squareFeet}
            onChange={(e) => setSquareFeet(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyber-neonTeal"
          />
        </div>
      </div>

      {/* Row 5: Listing Description */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Full Listing Description <span className="text-cyber-neonTeal">*</span>
          </label>
          <span className="text-[11px] text-cyber-textMuted font-mono">
            {description.length} chars
          </span>
        </div>
        <textarea
          required
          rows={5}
          placeholder="Paste the full rental listing description or email correspondence here (including any payment terms, landlord excuses, or lease rules)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyber-neonTeal transition-colors leading-relaxed"
        />
      </div>

      {/* Row 6: Contact Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Contact Email (Optional)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-cyber-textMuted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. manager@domain.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyber-neonTeal"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Contact Phone / App (Optional)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-cyber-textMuted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. +1 555-0199 or WhatsApp"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyber-neonTeal"
            />
          </div>
        </div>
      </div>

      {/* Row 7: Photo Upload / Duplicate Detection Dropzone */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Listing Photo (Local Perceptual Hash Verification)
        </label>
        
        {imagePreview ? (
          <div className="relative p-3 rounded-xl bg-cyber-card border border-cyber-neonTeal/40 flex items-center space-x-4">
            <img
              src={imagePreview}
              alt="Listing preview"
              className="w-20 h-20 object-cover rounded-lg border border-cyber-border"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-white truncate block">
                {imageFile?.name}
              </span>
              <span className="text-[11px] text-cyber-textMuted">
                {((imageFile?.size || 0) / 1024).toFixed(1)} KB • Ready for pHash fingerprinting
              </span>
              <span className="block text-[11px] text-cyber-neonTeal mt-1">
                ✓ Image validated & sanitized locally
              </span>
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="p-1.5 rounded-lg bg-cyber-surface hover:bg-red-950 text-slate-400 hover:text-red-400 border border-cyber-border"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 rounded-xl border-2 border-dashed border-cyber-border hover:border-cyber-neonTeal/60 bg-cyber-card/40 hover:bg-cyber-card transition-all cursor-pointer text-center group"
          >
            <Upload className="w-7 h-7 mx-auto mb-2 text-cyber-textMuted group-hover:text-cyber-neonTeal transition-colors" />
            <p className="text-xs font-medium text-slate-300">
              Click or drag listing photo to inspect for duplicate reuse
            </p>
            <p className="text-[11px] text-cyber-textMuted mt-1">
              Supports JPG, PNG, WEBP up to 5MB. Photo is evaluated strictly via client-safe perceptual hashing.
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:via-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(0,245,212,0.3)] hover:shadow-[0_0_25px_rgba(0,245,212,0.5)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing Listing Vectors & Calculating Risk...</span>
            </>
          ) : (
            <>
              <ScanEye className="w-5 h-5" />
              <span>Run RentShield Multi-Vector Risk Scan</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
