import React, { useState, useEffect, useRef, useId } from 'react';
import { School, GraduationCap, Loader2, Check, Search, MapPin } from 'lucide-react';
import './InstitutionAutocomplete.css';

// Client-side session query cache to avoid refiring duplicate queries
const sessionQueryCache = new Map();

// Curated comprehensive fallback list of Universities & Colleges
const FALLBACK_COLLEGES = [
  { name: 'Indian Institute of Technology (IIT) Bombay', country: 'India', type: 'Engineering & Tech' },
  { name: 'Indian Institute of Technology (IIT) Delhi', country: 'India', type: 'Engineering & Tech' },
  { name: 'Indian Institute of Technology (IIT) Madras', country: 'India', type: 'Engineering & Tech' },
  { name: 'Indian Institute of Technology (IIT) Kharagpur', country: 'India', type: 'Engineering & Tech' },
  { name: 'Indian Institute of Technology (IIT) Kanpur', country: 'India', type: 'Engineering & Tech' },
  { name: 'Indian Institute of Technology (IIT) Roorkee', country: 'India', type: 'Engineering & Tech' },
  { name: 'Indian Institute of Technology (IIT) Guwahati', country: 'India', type: 'Engineering & Tech' },
  { name: 'BITS Pilani (Birla Institute of Technology and Science)', country: 'India', type: 'Engineering & Science' },
  { name: 'Indian Institute of Science (IISc) Bangalore', country: 'India', type: 'Research & Science' },
  { name: 'Delhi University (DU)', country: 'India', type: 'Central University' },
  { name: 'Jawaharlal Nehru University (JNU) New Delhi', country: 'India', type: 'Central University' },
  { name: 'National Institute of Technology (NIT) Trichy', country: 'India', type: 'Engineering & Tech' },
  { name: 'National Institute of Technology (NIT) Surathkal', country: 'India', type: 'Engineering & Tech' },
  { name: 'National Institute of Technology (NIT) Warangal', country: 'India', type: 'Engineering & Tech' },
  { name: 'All India Institute of Medical Sciences (AIIMS) New Delhi', country: 'India', type: 'Medical Sciences' },
  { name: 'Vellore Institute of Technology (VIT) Vellore', country: 'India', type: 'Private University' },
  { name: 'Manipal Academy of Higher Education (MAHE)', country: 'India', type: 'Private University' },
  { name: 'Anna University Chennai', country: 'India', type: 'State University' },
  { name: 'Jadavpur University Kolkata', country: 'India', type: 'State University' },
  { name: 'Ashoka University Sonipat', country: 'India', type: 'Liberal Arts & Sciences' },
  { name: 'SRM Institute of Science and Technology Chennai', country: 'India', type: 'Engineering & Tech' },
  { name: 'Amity University Noida', country: 'India', type: 'Private University' },
  { name: 'Indian Institute of Management (IIM) Ahmedabad', country: 'India', type: 'Management' },
  { name: 'Indian Institute of Management (IIM) Bangalore', country: 'India', type: 'Management' },
  { name: 'Indian Institute of Management (IIM) Calcutta', country: 'India', type: 'Management' },
  { name: 'Stanford University', country: 'United States', type: 'Global University' },
  { name: 'Massachusetts Institute of Technology (MIT)', country: 'United States', type: 'Global University' },
  { name: 'Harvard University', country: 'United States', type: 'Global University' },
  { name: 'University of Oxford', country: 'United Kingdom', type: 'Global University' },
  { name: 'University of Cambridge', country: 'United Kingdom', type: 'Global University' },
  { name: 'National University of Singapore (NUS)', country: 'Singapore', type: 'Global University' },
  { name: 'University of California, Berkeley (UC Berkeley)', country: 'United States', type: 'Global University' },
  { name: 'Princeton University', country: 'United States', type: 'Global University' },
  { name: 'Columbia University', country: 'United States', type: 'Global University' },
  { name: 'University of Toronto', country: 'Canada', type: 'Global University' },
];

// Curated comprehensive dataset of major Schools & Boards
const BUNDLED_SCHOOLS = [
  { name: 'Delhi Public School (DPS) R.K. Puram, New Delhi', board: 'CBSE', tag: 'School' },
  { name: 'Delhi Public School (DPS) Mathura Road, New Delhi', board: 'CBSE', tag: 'School' },
  { name: 'Delhi Public School (DPS) Sector 30, Noida', board: 'CBSE', tag: 'School' },
  { name: 'Delhi Public School (DPS) Bangalore South', board: 'CBSE', tag: 'School' },
  { name: 'Delhi Public School (DPS) Sector 45, Gurgaon', board: 'CBSE', tag: 'School' },
  { name: 'Delhi Public School (DPS) Vasant Kunj, New Delhi', board: 'CBSE', tag: 'School' },
  { name: 'Delhi Public School (DPS) Ruby Park, Kolkata', board: 'CBSE', tag: 'School' },
  { name: 'Kendriya Vidyalaya (KV) IIT Delhi', board: 'CBSE', tag: 'Central School' },
  { name: 'Kendriya Vidyalaya (KV) IIT Bombay, Powai', board: 'CBSE', tag: 'Central School' },
  { name: 'Kendriya Vidyalaya (KV) ASC Centre, Bangalore', board: 'CBSE', tag: 'Central School' },
  { name: 'Kendriya Vidyalaya (KV) Andrews Ganj, New Delhi', board: 'CBSE', tag: 'Central School' },
  { name: 'Kendriya Vidyalaya (KV) Fort William, Kolkata', board: 'CBSE', tag: 'Central School' },
  { name: 'DAV Public School Sector 14, Gurgaon', board: 'CBSE', tag: 'School' },
  { name: 'DAV Public School Dayanand Vihar, Delhi', board: 'CBSE', tag: 'School' },
  { name: 'DAV Public School Chandrasekharpur, Bhubaneswar', board: 'CBSE', tag: 'School' },
  { name: 'Army Public School (APS) Dhaula Kuan, New Delhi', board: 'CBSE', tag: 'Army School' },
  { name: 'Army Public School (APS) Shankar Vihar, Delhi Cantt', board: 'CBSE', tag: 'Army School' },
  { name: 'Army Public School (APS) Pune', board: 'CBSE', tag: 'Army School' },
  { name: 'St. Xavier\'s Collegiate School, Kolkata', board: 'ICSE / ISC', tag: 'School' },
  { name: 'St. Xavier\'s High School, Fort, Mumbai', board: 'State Board / ICSE', tag: 'School' },
  { name: 'St. Xavier\'s High School, Loyola Hall, Ahmedabad', board: 'CBSE', tag: 'School' },
  { name: 'The Doon School, Dehradun', board: 'IB / ICSE', tag: 'Boarding School' },
  { name: 'Mayo College, Ajmer', board: 'CBSE', tag: 'Boarding School' },
  { name: 'Modern School, Barakhamba Road, New Delhi', board: 'CBSE', tag: 'School' },
  { name: 'Springdales School, Pusa Road, New Delhi', board: 'CBSE', tag: 'School' },
  { name: 'Springdales School, Dhaula Kuan, New Delhi', board: 'CBSE', tag: 'School' },
  { name: 'The Mother\'s International School, Sri Aurobindo Marg, New Delhi', board: 'CBSE', tag: 'School' },
  { name: 'Sanskriti School, Chanakyapuri, New Delhi', board: 'CBSE', tag: 'School' },
  { name: 'Cathedral and John Connon School, Mumbai', board: 'ICSE / IB', tag: 'School' },
  { name: 'Campion School, Fort, Mumbai', board: 'ICSE', tag: 'School' },
  { name: 'Bombay Scottish School, Mahim, Mumbai', board: 'ICSE', tag: 'School' },
  { name: 'National Public School (NPS) Indiranagar, Bangalore', board: 'CBSE', tag: 'School' },
  { name: 'National Public School (NPS) Koramangala, Bangalore', board: 'CBSE', tag: 'School' },
  { name: 'National Public School (NPS) Rajajinagar, Bangalore', board: 'CBSE', tag: 'School' },
  { name: 'Dhirubhai Ambani International School (DAIS), Mumbai', board: 'IB / IGCSE', tag: 'International School' },
  { name: 'The Shri Ram School, Moulsari / Aravali, Gurgaon', board: 'ICSE / IB', tag: 'School' },
  { name: 'Ryan International School, Greater Noida', board: 'CBSE / ICSE', tag: 'School' },
  { name: 'Ryan International School, Kundalahalli, Bangalore', board: 'CBSE', tag: 'School' },
  { name: 'Don Bosco School, Park Circus, Kolkata', board: 'ICSE / ISC', tag: 'School' },
  { name: 'Don Bosco High School, Matunga, Mumbai', board: 'State Board', tag: 'School' },
  { name: 'Podar International School, Mumbai / Pune', board: 'CBSE / IGCSE', tag: 'School' },
  { name: 'Oakridge International School, Hyderabad', board: 'IB / CBSE', tag: 'International School' },
  { name: 'Oakridge International School, Bengaluru', board: 'IB', tag: 'International School' },
  { name: 'Bishop Cotton Boys\' School, Bangalore', board: 'ICSE / ISC', tag: 'School' },
  { name: 'Bishop Cotton Girls\' School, Bangalore', board: 'ICSE / ISC', tag: 'School' },
  { name: 'La Martiniere for Boys, Kolkata', board: 'ICSE / ISC', tag: 'School' },
  { name: 'La Martiniere for Girls, Kolkata', board: 'ICSE / ISC', tag: 'School' },
  { name: 'St. Joseph\'s Boys\' High School, Bangalore', board: 'ICSE / ISC', tag: 'School' },
  { name: 'Loreto Convent School, Delhi / Kolkata', board: 'ICSE / CBSE', tag: 'School' },
  { name: 'GD Goenka Public School, Vasant Kunj, New Delhi', board: 'CBSE', tag: 'School' },
  { name: 'Apeejay School, Sheikh Sarai / Noida', board: 'CBSE', tag: 'School' },
  { name: 'Pathways World School, Gurgaon', board: 'IB', tag: 'International School' },
  { name: 'Woodstock School, Mussoorie', board: 'IB', tag: 'International School' },
  { name: 'Indus International School, Bangalore', board: 'IB', tag: 'International School' },
  { name: 'Jawahar Navodaya Vidyalaya (JNV)', board: 'CBSE', tag: 'Navodaya School' },
  { name: 'Chinmaya Vidyalaya', board: 'CBSE', tag: 'School' },
  { name: 'Bharatiya Vidya Bhavan (Bhavan\'s School)', board: 'CBSE', tag: 'School' },
];

/**
 * Highlights all matching substrings in suggestion name
 */
function HighlightMatch({ text, query }) {
  if (!query || !query.trim()) return <span>{text}</span>;

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark key={i} className="autocomplete-match-highlight">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export default function InstitutionAutocomplete({
  type = 'college', // 'college' | 'school'
  value = '',
  onChange,
  placeholder,
  id,
  name,
  required = false,
  className = '',
  onSelect,
}) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const listboxId = useId();

  // Sync internal input value when external value changes
  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    setInputValue(value || '');
  }, [value]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch or filter suggestions with debounce
  useEffect(() => {
    const trimmed = inputValue.trim();

    if (trimmed.length < 2) {
      const timer = setTimeout(() => {
        setSuggestions([]);
        setIsOpen(false);
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const cacheKey = `${type}:${trimmed.toLowerCase()}`;
    if (sessionQueryCache.has(cacheKey)) {
      const cached = sessionQueryCache.get(cacheKey);
      // eslint-disable-next-line react/set-state-in-effect
      setSuggestions(cached);
      // eslint-disable-next-line react/set-state-in-effect
      setIsOpen(cached.length > 0);
      // eslint-disable-next-line react/set-state-in-effect
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const timeoutId = setTimeout(async () => {
      let results = [];

      try {
        if (type === 'college') {
          // 1. Try public Hipolabs API with 2.5s timeout for fast response
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 2500);

          try {
            const res = await fetch(
              `https://universities.hipolabs.com/search?name=${encodeURIComponent(trimmed)}`,
              { signal: controller.signal }
            );
            clearTimeout(timer);

            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data) && data.length > 0) {
                results = data.slice(0, 8).map((item) => ({
                  name: item.name,
                  subtitle: item.country ? `${item.country}${item['state-province'] ? ` • ${item['state-province']}` : ''}` : 'University',
                  badge: item.country === 'India' ? '🇮🇳 India' : item.country || 'College',
                }));
              }
            }
          } catch {
            // Hipolabs network error or timeout -> graceful fallback
          }

          // 2. Supplement or Fallback with curated colleges
          const queryLower = trimmed.toLowerCase();
          const localMatches = FALLBACK_COLLEGES.filter((c) =>
            c.name.toLowerCase().includes(queryLower)
          ).map((c) => ({
            name: c.name,
            subtitle: `${c.country} • ${c.type}`,
            badge: c.country === 'India' ? '🇮🇳 India' : c.country,
          }));

          // Merge without exact duplicates
          const seen = new Set(results.map((r) => r.name.toLowerCase()));
          for (const item of localMatches) {
            if (!seen.has(item.name.toLowerCase()) && results.length < 8) {
              results.push(item);
              seen.add(item.name.toLowerCase());
            }
          }
        } else {
          // School suggestions from bundled dataset
          const queryLower = trimmed.toLowerCase();
          const schoolMatches = BUNDLED_SCHOOLS.filter(
            (s) =>
              s.name.toLowerCase().includes(queryLower) ||
              s.board.toLowerCase().includes(queryLower)
          ).slice(0, 8).map((s) => ({
            name: s.name,
            subtitle: `${s.board} Board • ${s.tag}`,
            badge: s.board,
          }));

          results = schoolMatches;
        }

        // Cache for session
        sessionQueryCache.set(cacheKey, results);

        if (!abortController.signal.aborted) {
          setSuggestions(results);
          setIsOpen(results.length > 0);
          setIsLoading(false);
          setSelectedIndex(-1);
        }
      } catch {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [inputValue, type]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (onChange) {
      onChange({ target: { name, value: val } });
    }
  };

  const handleSelect = (item) => {
    const chosen = item.name;
    setInputValue(chosen);
    setIsOpen(false);
    setSelectedIndex(-1);

    if (onChange) {
      onChange({ target: { name, value: chosen } });
    }
    if (onSelect) {
      onSelect(item);
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const isSchool = type === 'school';
  const defaultPlaceholder = isSchool
    ? 'Search school (e.g. Delhi Public School, St. Xavier\'s)'
    : 'Search university (e.g. IIT Bombay, Stanford, DU)';

  return (
    <div ref={containerRef} className="institution-autocomplete-container">
      <div className="input-with-icon autocomplete-input-wrapper">
        <div className="input-icon autocomplete-lead-icon">
          {isSchool ? <School size={18} /> : <GraduationCap size={18} />}
        </div>

        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          autoComplete="off"
          className={`form-input with-padding autocomplete-text-input ${className}`}
          placeholder={placeholder || defaultPlaceholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          required={required}
        />

        {/* Dynamic Trailing Loading / Search Indicator */}
        <div className="autocomplete-trailing-icon">
          {isLoading ? (
            <Loader2 size={16} className="autocomplete-spinner spin" />
          ) : inputValue ? (
            <Search size={15} className="autocomplete-search-icon" />
          ) : null}
        </div>
      </div>

      {/* Google-Style Dropdown Menu */}
      {isOpen && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="autocomplete-dropdown glass-card animate-fade-in"
        >
          <div className="autocomplete-dropdown-header">
            <span>Suggestions for "{inputValue}"</span>
            <span className="autocomplete-hint-tag">Use ↑ ↓ and Enter</span>
          </div>

          {suggestions.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <li
                key={idx}
                role="option"
                aria-selected={isSelected}
                className={`autocomplete-item ${isSelected ? 'autocomplete-item--selected' : ''}`}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => handleSelect(item)}
              >
                <div className="autocomplete-item-icon">
                  <MapPin size={16} />
                </div>

                <div className="autocomplete-item-content">
                  <span className="autocomplete-item-name">
                    <HighlightMatch text={item.name} query={inputValue} />
                  </span>
                  {item.subtitle && (
                    <span className="autocomplete-item-sub">{item.subtitle}</span>
                  )}
                </div>

                {item.badge && (
                  <span className="autocomplete-item-badge">{item.badge}</span>
                )}

                {isSelected && (
                  <div className="autocomplete-item-check">
                    <Check size={14} />
                  </div>
                )}
              </li>
            );
          })}

          <div className="autocomplete-dropdown-footer">
            <span>Don't see your institution? Free typing is completely allowed!</span>
          </div>
        </ul>
      )}
    </div>
  );
}
