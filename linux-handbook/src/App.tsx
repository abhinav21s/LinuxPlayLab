import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Command as CommandIcon, Heart, Menu, Search, ShieldCheck, Terminal as TerminalIcon, X } from 'lucide-react';
import { CommandSection } from './components/CommandSection';
import { SearchBar } from './components/SearchBar';
import { SecurityStatus } from './components/SecurityStatus';
import { Terminal } from './components/Terminal';
import { commandSections } from './data/commands';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSearch } from './hooks/useSearch';
import { Command } from './types';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useLocalStorage<string[]>('linuxhandbook-favorites', []);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [prefilledCommand, setPrefilledCommand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(commandSections[0]?.id ?? 1);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const searchedSections = useSearch({ sections: commandSections, query: searchQuery });
  const isBrowsingAll = Boolean(searchQuery.trim()) || showFavoritesOnly;
  const filteredSections = isBrowsingAll
    ? searchedSections.map((section) => ({ ...section, commands: showFavoritesOnly ? section.commands.filter((command) => favoriteSet.has(command.id)) : section.commands })).filter((section) => section.commands.length > 0)
    : commandSections.filter((section) => section.id === selectedCategory);
  const resultCount = filteredSections.reduce((count, section) => count + section.commands.length, 0);

  useEffect(() => { document.documentElement.classList.add('dark'); }, []);
  const handleToggleFavorite = (id: string) => setFavorites(favorites.includes(id) ? favorites.filter((favorite) => favorite !== id) : [...favorites, id]);
  const handleCopyCommand = (text: string) => navigator.clipboard.writeText(text).catch((error) => console.error('Copy failed:', error));
  const handleTryCommand = (command: Command) => { setPrefilledCommand(command.example); setIsTerminalOpen(true); };
  const selectCategory = (id: number) => { setSelectedCategory(id); setSearchQuery(''); setShowFavoritesOnly(false); setMobileNavOpen(false); };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4"><div className="flex min-w-0 items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100"><BookOpen className="text-slate-900" size={18} /></div><div><h1 className="truncate text-base font-bold tracking-tight">Linux Playbook</h1><p className="hidden text-[11px] text-slate-500 sm:block">Command reference &amp; sandbox</p></div></div><button onClick={() => setIsTerminalOpen(!isTerminalOpen)} className={`ml-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isTerminalOpen ? 'bg-white text-slate-950' : 'border border-slate-700 text-slate-200 hover:bg-slate-800'}`} title="Toggle terminal"><TerminalIcon size={16} /><span className="hidden sm:inline">Terminal</span></button></div>
          <div className="mt-5 flex items-center gap-3"><div className="min-w-0 flex-1"><SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search commands, descriptions, or examples..." /></div><button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="rounded-lg border border-slate-700 p-2.5 text-slate-300 md:hidden" aria-label="Toggle categories">{mobileNavOpen ? <X size={18} /> : <Menu size={18} />}</button></div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className={`${mobileNavOpen ? 'block' : 'hidden'} lg:block`}><div className="lg:sticky lg:top-28"><div className="mb-5 flex items-center justify-between"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Categories</p><span className="text-[11px] text-slate-500">{commandSections.length}</span></div><nav className="space-y-1">{commandSections.map((section) => <button key={section.id} onClick={() => selectCategory(section.id)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${!isBrowsingAll && selectedCategory === section.id ? 'bg-slate-100 font-semibold text-slate-950' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'}`}><span className="truncate">{section.title}</span><span className="ml-2 text-[10px] text-slate-500">{section.commands.length}</span></button>)}</nav></div></aside>

        <section className="min-w-0"><div className="mb-9 flex flex-col gap-5 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue-400"><CommandIcon size={14} /> {isBrowsingAll ? 'Search results' : 'Reference'}</p><h2 className="text-2xl font-bold tracking-tight">{isBrowsingAll ? `${resultCount} commands found` : commandSections.find((section) => section.id === selectedCategory)?.title}</h2></div><div className="flex items-center gap-3"><button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${showFavoritesOnly ? 'border-rose-900 bg-rose-950/40 text-rose-300' : 'border-slate-700 text-slate-300 hover:bg-slate-900'}`}><Heart size={14} className={showFavoritesOnly ? 'fill-current' : ''} /> Favorites {favorites.length ? `(${favorites.length})` : ''}</button><SecurityStatus /></div></div>
          {filteredSections.length === 0 ? <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900 py-20 text-center"><Search className="mx-auto mb-4 text-slate-500" size={38} /><p className="font-semibold text-slate-200">{showFavoritesOnly ? 'No saved commands yet.' : 'No commands found'}</p><p className="mt-2 text-sm text-slate-500">{showFavoritesOnly ? 'Use the heart on a command to save it here.' : 'Try a different command name or description.'}</p></div> : filteredSections.map((section) => <CommandSection key={section.id} {...section} onTryCommand={handleTryCommand} onCopyCommand={handleCopyCommand} onFavorite={handleToggleFavorite} favorites={favoriteSet} />)}
        </section>
      </main>
      <Terminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} prefilledCommand={prefilledCommand} />
      <footer className="border-t border-slate-800 bg-slate-950 py-7"><div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><span>Linux Playbook · a practical command reference</span><span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-500" /> Restricted browser sandbox</span></div></footer>
    </div>
  );
}

export default App;
