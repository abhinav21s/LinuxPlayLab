import React, { useState } from 'react';
import { Check, Copy, Heart, Play } from 'lucide-react';
import { Command } from '../types';

interface CommandCardProps { command: Command; onTry?: (command: Command) => void; onCopy?: (text: string) => void; onFavorite?: (id: string) => void; isFavorited?: boolean; }

export const CommandCard: React.FC<CommandCardProps> = ({ command, onTry, onCopy, onFavorite, isFavorited }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { onCopy?.(command.example); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  return (
    <article className="group flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm transition-colors hover:border-slate-600">
      <div className="mb-6 flex items-start justify-between gap-4"><div className="flex-1"><h3 className="font-mono text-lg font-bold text-slate-100">{command.name}</h3><p className="mt-2.5 text-sm leading-6 text-slate-400">{command.description}</p></div>
        <div className="flex shrink-0 gap-1">{onCopy && <button onClick={copy} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200" title={copied ? 'Copied' : 'Copy command'} aria-label={copied ? 'Copied command' : 'Copy command'}>{copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}</button>}{onFavorite && <button onClick={() => onFavorite(command.id)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800" title={isFavorited ? 'Remove from favorites' : 'Add to favorites'} aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}><Heart size={16} className={isFavorited ? 'fill-rose-500 text-rose-500' : ''} /></button>}</div>
      </div>
      <div className="mb-6 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm leading-6 text-slate-300"><span className="mr-2 select-none text-emerald-400">$</span>{command.example}</div>
      {onTry && <button onClick={() => onTry(command)} className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-blue-700 hover:bg-blue-950/40 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"><Play size={12} fill="currentColor" /> Run example</button>}
    </article>
  );
};
