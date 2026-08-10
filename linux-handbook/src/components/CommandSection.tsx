import React from 'react';
import { CommandCard } from './CommandCard';
import { Command } from '../types';

interface CommandSectionProps { id: number; title: string; commands: Command[]; onTryCommand?: (command: Command) => void; onCopyCommand?: (text: string) => void; onFavorite?: (id: string) => void; favorites?: Set<string>; }

export const CommandSection: React.FC<CommandSectionProps> = ({ id, title, commands, onTryCommand, onCopyCommand, onFavorite, favorites = new Set() }) => (
  <section className="mb-12 scroll-mt-24">
    <div className="mb-7 flex items-end justify-between gap-4"><div className="flex items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-800 text-sm font-bold text-blue-300">{id}</div><div><h2 className="text-xl font-bold tracking-tight text-slate-100">{title}</h2><div className="mt-2 h-px w-10 bg-blue-500" /></div></div><span className="hidden rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400 sm:block">{commands.length} commands</span></div>
    <div className="grid gap-3 xl:grid-cols-2">{commands.map((command) => <CommandCard key={command.id} command={command} onTry={onTryCommand} onCopy={onCopyCommand} onFavorite={onFavorite} isFavorited={favorites.has(command.id)} />)}</div>
  </section>
);
