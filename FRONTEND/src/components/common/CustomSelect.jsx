import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export const CustomSelect = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = '-- Select an option --',
  searchPlaceholder = 'Search...',
  required = false,
  renderOption,
  renderSelected,
  filterOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value || opt._id === value || opt.id === value);

  const filteredOptions = options.filter((opt) => {
    if (!search.trim()) return true;
    if (filterOption) return filterOption(opt, search.toLowerCase());
    const label = opt.label || opt.name || opt.title || '';
    const sub = opt.subtext || opt.patientId || opt.phone || opt.specialty || '';
    return (
      label.toLowerCase().includes(search.toLowerCase()) ||
      sub.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSelect = (opt) => {
    const optValue = opt.value !== undefined ? opt.value : (opt._id || opt.id);
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div className="custom-select-wrapper" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '700', fontSize: '0.85rem' }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      {/* Trigger Box */}
      <div
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 0.95rem',
          backgroundColor: '#ffffff',
          border: isOpen ? '2px solid #0891b2' : '1px solid #cbd5e1',
          borderRadius: '12px',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 4px rgba(8, 145, 178, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          minHeight: '44px',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0, overflow: 'hidden' }}>
          {selectedOption ? (
            renderSelected ? (
              renderSelected(selectedOption)
            ) : (
              <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                {selectedOption.label || selectedOption.name}
              </span>
            )
          ) : (
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{placeholder}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Clear selection"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={18}
            color="#64748b"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </div>
      </div>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          className="custom-select-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 18px 38px -10px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            zIndex: 9999,
            overflow: 'hidden',
            animation: 'fadeInScale 0.15s ease-out',
          }}
        >
          {/* Search Header */}
          <div
            style={{
              padding: '0.65rem 0.75rem',
              borderBottom: '1px solid #f1f5f9',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Search size={15} color="#0891b2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.85rem',
                color: '#0f172a',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearch('');
                }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div
            style={{
              maxHeight: '230px',
              overflowY: 'auto',
              padding: '0.35rem',
            }}
          >
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.825rem' }}>
                No matching results found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const optVal = opt.value !== undefined ? opt.value : (opt._id || opt.id);
                const isSelected = optVal === value;

                return (
                  <div
                    key={optVal}
                    onClick={() => handleSelect(opt)}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#ecfeff' : 'transparent',
                      color: isSelected ? '#0e7490' : '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background-color 0.12s ease',
                      marginBottom: '2px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {renderOption ? (
                        renderOption(opt, isSelected)
                      ) : (
                        <div>
                          <div style={{ fontWeight: isSelected ? '700' : '600', fontSize: '0.875rem' }}>
                            {opt.label || opt.name}
                          </div>
                          {opt.subtext && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{opt.subtext}</div>
                          )}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check size={16} color="#0891b2" style={{ flexShrink: 0, marginLeft: '8px' }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
