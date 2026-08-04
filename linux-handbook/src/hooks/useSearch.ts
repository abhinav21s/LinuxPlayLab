import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { Command, CommandSection } from '../types';

interface UseSearchProps {
  sections: CommandSection[];
  query: string;
}

export const useSearch = ({ sections, query }: UseSearchProps) => {
  const allCommands = useMemo(() => {
    return sections.flatMap(section => section.commands);
  }, [sections]);

  const filteredSections = useMemo(() => {
    if (!query.trim()) {
      return sections;
    }

    const fuse = new Fuse(allCommands, {
      keys: ['name', 'description', 'example'],
      threshold: 0.3,
      minMatchCharLength: 1,
    });

    const results = fuse.search(query);
    const matchedIds = new Set(results.map(r => r.item.id));

    return sections
      .map(section => ({
        ...section,
        commands: section.commands.filter(cmd => matchedIds.has(cmd.id)),
      }))
      .filter(section => section.commands.length > 0);
  }, [sections, query]);

  return filteredSections;
};
