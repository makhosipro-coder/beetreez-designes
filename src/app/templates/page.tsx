'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';

const TEMPLATE_CATEGORIES = ['All', 'Social Media', 'Presentations', 'Photobooks', 'Invitations', 'Tributes', 'Posters', 'Documents'];

interface TemplateInfo {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  width: number;
  height: number;
}

const FALLBACK_TEMPLATES: TemplateInfo[] = [
  { id: 'template-instagram', name: 'Instagram Post', category: 'Social Media', thumbnail: '', width: 1080, height: 1080 },
  { id: 'template-presentation', name: 'Presentation 16:9', category: 'Presentations', thumbnail: '', width: 1920, height: 1080 },
  { id: 'template-photobook', name: 'Photo Album', category: 'Photobooks', thumbnail: '', width: 1920, height: 1080 },
  { id: 'template-invitation', name: 'Wedding Invitation', category: 'Invitations', thumbnail: '', width: 1080, height: 1920 },
  { id: 'template-tribute', name: 'In Loving Memory', category: 'Tributes', thumbnail: '', width: 1080, height: 1080 },
];

const COLORS: Record<string, string> = {
  'Social Media': '#6c63ff',
  'Presentations': '#45eba5',
  'Photobooks': '#e84393',
  'Invitations': '#fdcb6e',
  'Tributes': '#a29bfe',
  'Posters': '#ffa502',
  'Documents': '#ff6584',
};

function TemplatePreview({ template, color }: { template: TemplateInfo; color: string }) {
  const ratio = template.width / template.height;
  const viewBox = ratio >= 1
    ? `0 0 ${Math.round(ratio * 100)} 100`
    : `0 0 100 ${Math.round(100 / ratio)}`;

  return (
    <svg
      viewBox={viewBox}
      className="mb-4 w-full rounded-md"
      style={{ aspectRatio: `${template.width}/${template.height}` }}
    >
      <rect width="100%" height="100%" fill={color} opacity={0.15} rx="4" />
      <rect x="10%" y="10%" width="80%" height="80%" fill="none" stroke={color} strokeOpacity={0.3} strokeWidth="1" rx="3" strokeDasharray="4 3" />
      <text x="50%" y="45%" textAnchor="middle" fill={color} fontSize="14" fontWeight="600" opacity={0.8}>
        {template.name}
      </text>
      <text x="50%" y="62%" textAnchor="middle" fill={color} fontSize="9" opacity={0.5}>
        {template.width} × {template.height}
      </text>
      <rect x="50%" y="72%" width="40" height="16" rx="8" fill={color} opacity={0.2} transform="translate(-20, 0)" />
      <text x="50%" y="84%" textAnchor="middle" fill={color} fontSize="7" fontWeight="500" opacity={0.7}>
        {template.category}
      </text>
    </svg>
  );
}

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/templates')
      .then((r) => r.ok ? r.json() : FALLBACK_TEMPLATES)
      .then((data) => {
        setTemplates(Array.isArray(data) && data.length > 0 ? data : FALLBACK_TEMPLATES);
        setLoading(false);
      })
      .catch(() => {
        setTemplates(FALLBACK_TEMPLATES);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const byCategory = activeCategory === 'All'
      ? templates
      : templates.filter((t) => t.category === activeCategory);
    if (!searchQuery.trim()) return byCategory;
    const q = searchQuery.toLowerCase();
    return byCategory.filter((t) => t.name.toLowerCase().includes(q));
  }, [templates, activeCategory, searchQuery]);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <h1 className="text-3xl font-bold text-text-primary">Templates</h1>
      <p className="mt-2 text-text-secondary">Start with a professionally designed template</p>

      <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-canvas-surface px-3 py-2">
        <Search size={16} className="text-text-tertiary" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-brand-primary text-white'
                : 'bg-canvas-grid text-text-secondary hover:text-text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full text-center text-text-secondary">Loading templates...</p>
        ) : filtered.length === 0 ? (
          <p className="col-span-full text-center text-text-secondary">No templates match your search</p>
        ) : (
          filtered.map((template) => (
            <Link
              key={template.id}
              href={`/design/${template.id}`}
              className="group rounded-lg border border-border bg-canvas-surface p-4 transition-colors hover:border-brand-primary"
            >
              <TemplatePreview template={template} color={COLORS[template.category] || '#6c63ff'} />
              <h3 className="text-sm font-medium text-text-primary">{template.name}</h3>
              <p className="mt-1 text-xs text-text-secondary">{template.category}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
