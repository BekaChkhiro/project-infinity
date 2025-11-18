'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { Search, FileText, User, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Project, Client } from '@/types/database.types';

type SearchResult = {
  type: 'project' | 'client';
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
};

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search when query changes
  useEffect(() => {
    if (query.length >= 2) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query, projects, clients]);

  async function loadData() {
    setLoading(true);
    const supabase = createClient();

    try {
      const [projectsData, clientsData] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('name', { ascending: true }),
      ]);

      if (projectsData.data) setProjects(projectsData.data);
      if (clientsData.data) setClients(clientsData.data);
    } catch (error) {
      console.error('Error loading search data:', error);
    } finally {
      setLoading(false);
    }
  }

  function performSearch(searchQuery: string) {
    const projectResults: SearchResult[] = [];
    const clientResults: SearchResult[] = [];

    // Search projects with Fuse.js
    const projectFuse = new Fuse(projects, {
      keys: ['title', 'description'],
      threshold: 0.3,
      includeScore: true,
    });

    const projectMatches = projectFuse.search(searchQuery);
    projectMatches.slice(0, 5).forEach((match) => {
      const project = match.item;
      projectResults.push({
        type: 'project',
        id: project.id,
        title: project.title,
        subtitle: project.current_stage,
        description: project.description || undefined,
        badge: 'პროექტი',
      });
    });

    // Search clients with Fuse.js
    const clientFuse = new Fuse(clients, {
      keys: ['name', 'company', 'email'],
      threshold: 0.3,
      includeScore: true,
    });

    const clientMatches = clientFuse.search(searchQuery);
    clientMatches.slice(0, 5).forEach((match) => {
      const client = match.item;
      clientResults.push({
        type: 'client',
        id: client.id,
        title: client.name,
        subtitle: client.company || client.email || undefined,
        badge: 'კლიენტი',
      });
    });

    // Combine results
    setResults([...projectResults, ...clientResults]);
  }

  function handleResultClick(result: SearchResult) {
    if (result.type === 'project') {
      router.push(`/dashboard/projects/${result.id}`);
    } else {
      router.push(`/dashboard/clients/${result.id}`);
    }
    setIsOpen(false);
    setQuery('');
  }

  function handleClear() {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="ძებნა... (Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-y-auto shadow-lg">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">იტვირთება...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              შედეგები არ მოიძებნა
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-start gap-3 border-b last:border-b-0"
                >
                  <div className="mt-1">
                    {result.type === 'project' ? (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{result.title}</span>
                      {result.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {result.badge}
                        </Badge>
                      )}
                    </div>
                    {result.subtitle && (
                      <p className="text-sm text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                    )}
                    {result.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {result.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
