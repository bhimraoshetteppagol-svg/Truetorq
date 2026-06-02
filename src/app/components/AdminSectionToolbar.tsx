import { ListFilter, Download } from 'lucide-react';

interface AdminSectionToolbarProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  filtersActive: boolean;
  onDownload: () => void;
  downloadDisabled: boolean;
  filterTitle?: string;
  downloadTitle?: string;
}

export function AdminSectionToolbar({
  showFilters,
  onToggleFilters,
  filtersActive,
  onDownload,
  downloadDisabled,
  filterTitle = 'Filter',
  downloadTitle = 'Download Excel',
}: AdminSectionToolbarProps) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={onToggleFilters}
        className={`p-2 sm:p-2.5 border-2 border-black transition-colors ${
          showFilters || filtersActive
            ? 'bg-[#30578e] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
            : 'bg-white hover:bg-black hover:text-white'
        }`}
        title={filterTitle}
        aria-expanded={showFilters}
        aria-label={filterTitle}
      >
        <ListFilter size={18} className="sm:w-5 sm:h-5" />
      </button>
      <button
        type="button"
        onClick={onDownload}
        disabled={downloadDisabled}
        className="px-3 sm:px-4 py-2 border-2 border-black bg-black text-white font-bold uppercase text-[10px] sm:text-xs flex items-center gap-1.5 hover:bg-[#30578e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black"
        title={downloadTitle}
      >
        <Download size={14} className="sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Excel</span>
      </button>
    </div>
  );
}
