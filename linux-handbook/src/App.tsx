import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, BookOpen, Check, Command as CommandIcon, Heart, Menu, Search, ShieldCheck, Terminal as TerminalIcon, X, Move, PanelRight, PanelBottom } from 'lucide-react';
import { CommandSection } from './components/CommandSection';
import { SearchBar } from './components/SearchBar';
import { SecurityStatus } from './components/SecurityStatus';
import { Terminal } from './components/Terminal';
import { commandSections } from './data/commands';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSearch } from './hooks/useSearch';
import { Command } from './types';

function LandingPage({ onEnter }: { onEnter: () => void }) {
  return <div className="landing-shell">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(37,99,235,0.18),transparent_35%),radial-gradient(circle_at_15%_80%,rgba(14,165,233,0.1),transparent_30%)]" />
    <div className="landing-container">
      <header className="landing-header"><div className="landing-brand"><div className="landing-brand-mark"><BookOpen size={20} /></div><div><span>Linux Playbook</span><small>Command reference &amp; sandbox</small></div></div><span className="landing-status"><i /> Interactive command lab</span></header>
      <main className="landing-main">
        <section className="landing-copy"><div className="landing-eyebrow"><span /> Built for curious builders</div><h1>Learn Linux by <em>doing.</em></h1><p>A focused command reference and safe browser sandbox for mastering the terminal one command at a time.</p><div className="landing-actions"><button onClick={onEnter} className="landing-primary">Open the playbook <ArrowRight size={17} /></button><span>No setup · Runs in your browser</span></div><div className="landing-points"><span><Check size={15} /> Searchable reference</span><span><Check size={15} /> Safe sandbox</span><span><Check size={15} /> Practical examples</span></div></section>
        <section className="relative"><div className="absolute -inset-8 rounded-[2rem] bg-blue-500/10 blur-3xl" /><div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl shadow-black/40"><div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /><span className="ml-3 font-mono text-xs text-slate-500">linux-playbook ~ terminal</span></div><div className="space-y-5 p-6 font-mono text-sm leading-7 sm:p-8"><p className="text-slate-500"># explore the essentials</p><p><span className="text-emerald-400">$</span> <span className="text-slate-200">ls -la</span></p><p className="text-slate-400">Documents &nbsp; Downloads &nbsp; README.md</p><p><span className="text-emerald-400">$</span> <span className="text-slate-200">grep -r <span className="text-cyan-300">"learn"</span> .</span></p><p className="text-blue-300">./README.md: learn Linux by doing</p><p><span className="text-emerald-400">$</span> <span className="animate-pulse text-slate-200">_</span></p></div><div className="border-t border-slate-800 bg-slate-950/60 px-6 py-4 text-xs text-slate-500"><span className="text-emerald-400">●</span> Browser sandbox ready</div></div></section>
      </main>
      <footer className="landing-footer"><span>Linux Playbook · practical reference for modern Linux</span><span>Learn. Experiment. Build.</span></footer>
    </div>
  </div>;
}

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useLocalStorage<string[]>('linuxhandbook-favorites', []);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [prefilledCommand, setPrefilledCommand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(commandSections[0]?.id ?? 1);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [terminalPlacement, setTerminalPlacement] = useState<'floating' | 'right' | 'bottom'>('floating');
  const [terminalMenuOpen, setTerminalMenuOpen] = useState(false);
  const [rightCategoriesOpen, setRightCategoriesOpen] = useState(false);
  const [rightTerminalWidth, setRightTerminalWidth] = useState(Math.round(window.innerWidth * 0.36));
  const [bottomTerminalHeight, setBottomTerminalHeight] = useState(Math.round(window.innerHeight * 0.58));
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const searchedSections = useSearch({ sections: commandSections, query: searchQuery });
  const isBrowsingAll = Boolean(searchQuery.trim()) || showFavoritesOnly;
  const filteredSections = isBrowsingAll
    ? searchedSections.map((section) => ({ ...section, commands: showFavoritesOnly ? section.commands.filter((command) => favoriteSet.has(command.id)) : section.commands })).filter((section) => section.commands.length > 0)
    : commandSections.filter((section) => section.id === selectedCategory);
  const resultCount = filteredSections.reduce((count, section) => count + section.commands.length, 0);

  useEffect(() => { document.documentElement.classList.add('dark'); }, []);
  useEffect(() => {
    if (isBrowsingAll) return;
    const container = categoryScrollRef.current;
    const selected = container?.querySelector<HTMLElement>(`[data-category-id="${selectedCategory}"]`);
    if (container && selected) {
      // Scroll only the category rail; never move the document/commands pane.
      const targetTop = Math.max(0, selected.offsetTop - 8);
      container.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  }, [selectedCategory, isBrowsingAll]);
  const handleToggleFavorite = (id: string) => setFavorites(favorites.includes(id) ? favorites.filter((favorite) => favorite !== id) : [...favorites, id]);
  const handleCopyCommand = (text: string) => navigator.clipboard.writeText(text).catch((error) => console.error('Copy failed:', error));
  const handleTryCommand = (command: Command) => { setPrefilledCommand(command.example); setIsTerminalOpen(true); };
  const selectCategory = (id: number) => { setSelectedCategory(id); setSearchQuery(''); setShowFavoritesOnly(false); setMobileNavOpen(false); setRightCategoriesOpen(false); };
  const chooseTerminalPlacement = (placement: 'floating' | 'right' | 'bottom') => { setTerminalPlacement(placement); setTerminalMenuOpen(false); setIsTerminalOpen(true); if (placement !== 'right') setRightCategoriesOpen(false); };

  if (showLanding) return <LandingPage onEnter={() => setShowLanding(false)} />;

  return (
    <div style={{ '--right-terminal-width': `${rightTerminalWidth}px`, '--bottom-terminal-height': `${bottomTerminalHeight}px` } as CSSProperties} className={`min-h-screen bg-slate-950 text-slate-100 ${terminalPlacement === 'right' && isTerminalOpen ? 'terminal-right-layout' : ''} ${terminalPlacement === 'bottom' && isTerminalOpen ? 'terminal-bottom-layout' : ''}`}>
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4"><button type="button" onClick={() => setShowLanding(true)} className="flex min-w-0 items-center gap-3 text-left" aria-label="Return to Linux Playbook home"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100"><BookOpen className="text-slate-900" size={18} /></div><div><h1 className="truncate text-base font-bold tracking-tight">Linux Playbook</h1><p className="hidden text-[11px] text-slate-500 sm:block">Command reference &amp; sandbox</p></div></button><div className="relative ml-auto" onMouseEnter={() => setTerminalMenuOpen(true)} onMouseLeave={() => setTerminalMenuOpen(false)}><button onClick={() => setIsTerminalOpen(!isTerminalOpen)} className={`flex items-center gap-2 rounded-lg border-0 px-3 py-2 text-sm font-semibold transition-colors ${isTerminalOpen ? 'bg-white text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`} title="Toggle terminal"><TerminalIcon size={16} /><span className="hidden sm:inline">Terminal</span></button>{terminalMenuOpen && <div className="absolute right-0 top-full z-[60] mt-2 w-56 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl" onMouseEnter={() => setTerminalMenuOpen(true)}><p className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Terminal placement</p><button onClick={() => chooseTerminalPlacement('floating')} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-slate-300 hover:bg-slate-800"><Move size={14} /> Floating / draggable</button><button onClick={() => chooseTerminalPlacement('right')} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-slate-300 hover:bg-slate-800"><PanelRight size={14} /> Dock on right</button><button onClick={() => chooseTerminalPlacement('bottom')} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-slate-300 hover:bg-slate-800"><PanelBottom size={14} /> Dock on bottom</button></div>}</div></div>
          <div className="mt-5 flex items-center gap-3"><div className="min-w-0 flex-1"><SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search commands, descriptions, or examples..." /></div><button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="rounded-lg border border-slate-700 p-2.5 text-slate-300 md:hidden" aria-label="Toggle categories">{mobileNavOpen ? <X size={18} /> : <Menu size={18} />}</button></div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className={`${mobileNavOpen ? 'block' : 'hidden'} ${terminalPlacement === 'right' && isTerminalOpen && !rightCategoriesOpen ? 'terminal-categories-hidden' : ''} lg:block`}><div ref={categoryScrollRef} className="lg:sticky lg:top-28"><div className="mb-5 flex items-center justify-between"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Categories</p><span className="text-[11px] text-slate-500">{commandSections.length}</span></div><nav className="space-y-1">{commandSections.map((section) => <button data-category-id={section.id} key={section.id} onClick={() => selectCategory(section.id)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${!isBrowsingAll && selectedCategory === section.id ? 'bg-slate-100 font-semibold text-slate-950' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'}`}><span className="truncate">{section.title}</span><span className="ml-2 text-[10px] text-slate-500">{section.commands.length}</span></button>)}</nav></div></aside>

        <section className="min-w-0"><div className="mb-9 flex flex-col gap-5 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue-400"><CommandIcon size={14} /> {isBrowsingAll ? 'Search results' : 'Reference'}</p><h2 className="text-2xl font-bold tracking-tight">{isBrowsingAll ? `${resultCount} commands found` : commandSections.find((section) => section.id === selectedCategory)?.title}</h2></div><div className="flex items-center gap-3">{terminalPlacement === 'right' && isTerminalOpen && <button onClick={() => setRightCategoriesOpen(!rightCategoriesOpen)} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700">{rightCategoriesOpen ? 'Hide categories' : 'Categories'}</button>}<button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className={`inline-flex items-center gap-2 rounded-lg border-0 px-3 py-2 text-xs font-semibold transition-colors ${showFavoritesOnly ? 'bg-rose-950/50 text-rose-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}><Heart size={14} className={showFavoritesOnly ? 'fill-current' : ''} /> Favorites {favorites.length ? `(${favorites.length})` : ''}</button><SecurityStatus /></div></div>
          {filteredSections.length === 0 ? <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900 py-20 text-center"><Search className="mx-auto mb-4 text-slate-500" size={38} /><p className="font-semibold text-slate-200">{showFavoritesOnly ? 'No saved commands yet.' : 'No commands found'}</p><p className="mt-2 text-sm text-slate-500">{showFavoritesOnly ? 'Use the heart on a command to save it here.' : 'Try a different command name or description.'}</p></div> : filteredSections.map((section) => <CommandSection key={section.id} {...section} onTryCommand={handleTryCommand} onCopyCommand={handleCopyCommand} onFavorite={handleToggleFavorite} favorites={favoriteSet} />)}
        </section>
      </main>
      <Terminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} prefilledCommand={prefilledCommand} placement={terminalPlacement} onRightDockResize={setRightTerminalWidth} onBottomDockResize={setBottomTerminalHeight} />
      <footer className="border-t border-slate-800 bg-slate-950 py-7"><div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><span>Linux Playbook · a practical command reference</span><span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-500" /> Restricted browser sandbox</span></div></footer>
    </div>
  );
}

export default App;
