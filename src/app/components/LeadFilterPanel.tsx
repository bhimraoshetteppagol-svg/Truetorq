import { motion } from 'motion/react';
import type { LeadFilters } from '../../utils/leadFilters';

interface LeadFilterPanelProps {
  leadFilters: LeadFilters;
  filtersActive: boolean;
  onUpdate: (key: keyof LeadFilters, value: string) => void;
  onClear: () => void;
  showAssignedTo?: boolean;
}

const filterInputClass =
  'w-full border-2 border-black px-2 py-1.5 font-mono text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#30578e]';

export function LeadFilterPanel({
  leadFilters,
  filtersActive,
  onUpdate,
  onClear,
  showAssignedTo = true,
}: LeadFilterPanelProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="mb-4 sm:mb-5 overflow-hidden"
    >
      <div className="border-4 border-black p-3 sm:p-4 bg-neutral-50 shadow-[4px_4px_0px_0px_#30578e]">
        <div className="flex items-center justify-between mb-3">
          <span className="font-black uppercase text-xs sm:text-sm">Filter Leads</span>
          {filtersActive && (
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] sm:text-xs font-bold uppercase underline hover:text-[#30578e]"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          <label className="sm:col-span-2 lg:col-span-3">
            <span className="block font-bold uppercase text-[10px] mb-1">Search all fields</span>
            <input
              type="text"
              value={leadFilters.search}
              onChange={(e) => onUpdate('search', e.target.value)}
              placeholder="ID, product, email, company..."
              className={filterInputClass}
            />
          </label>
          <label>
            <span className="block font-bold uppercase text-[10px] mb-1">Status</span>
            <select
              value={leadFilters.status}
              onChange={(e) => onUpdate('status', e.target.value)}
              className={filterInputClass}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label>
            <span className="block font-bold uppercase text-[10px] mb-1">Has quotation</span>
            <select
              value={leadFilters.hasQuotation}
              onChange={(e) => onUpdate('hasQuotation', e.target.value)}
              className={filterInputClass}
            >
              <option value="">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label>
            <span className="block font-bold uppercase text-[10px] mb-1">Product name</span>
            <input
              type="text"
              value={leadFilters.productName}
              onChange={(e) => onUpdate('productName', e.target.value)}
              className={filterInputClass}
            />
          </label>
          <label>
            <span className="block font-bold uppercase text-[10px] mb-1">Requester email</span>
            <input
              type="text"
              value={leadFilters.requesterEmail}
              onChange={(e) => onUpdate('requesterEmail', e.target.value)}
              className={filterInputClass}
            />
          </label>
          <label>
            <span className="block font-bold uppercase text-[10px] mb-1">Contact number</span>
            <input
              type="text"
              value={leadFilters.contactNumber}
              onChange={(e) => onUpdate('contactNumber', e.target.value)}
              className={filterInputClass}
            />
          </label>
          {showAssignedTo && (
            <label>
              <span className="block font-bold uppercase text-[10px] mb-1">Assigned to</span>
              <input
                type="text"
                value={leadFilters.assignedTo}
                onChange={(e) => onUpdate('assignedTo', e.target.value)}
                className={filterInputClass}
              />
            </label>
          )}
          <label>
            <span className="block font-bold uppercase text-[10px] mb-1">Kind attn</span>
            <input
              type="text"
              value={leadFilters.kindAttn}
              onChange={(e) => onUpdate('kindAttn', e.target.value)}
              className={filterInputClass}
            />
          </label>
          <label>
            <span className="block font-bold uppercase text-[10px] mb-1">Reference</span>
            <input
              type="text"
              value={leadFilters.reference}
              onChange={(e) => onUpdate('reference', e.target.value)}
              className={filterInputClass}
            />
          </label>
          <label>
            <span className="block font-bold uppercase text-[10px] mb-1">Created from</span>
            <input
              type="date"
              value={leadFilters.createdFrom}
              onChange={(e) => onUpdate('createdFrom', e.target.value)}
              className={filterInputClass}
            />
          </label>
          <label>
            <span className="block font-bold uppercase text-[10px] mb-1">Created to</span>
            <input
              type="date"
              value={leadFilters.createdTo}
              onChange={(e) => onUpdate('createdTo', e.target.value)}
              className={filterInputClass}
            />
          </label>
        </div>
      </div>
    </motion.div>
  );
}
