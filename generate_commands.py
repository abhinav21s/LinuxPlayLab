#!/usr/bin/env python3
"""Generate TypeScript commands.ts from Linux Commands Handbook"""

import re

# Read the handbook file
with open(r'c:\Users\abhin\Desktop\ALLFOLDER\projects\linuxplaylab\linux_commands_handbook.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Split into lines
lines = content.splitlines()

# Categories that should be marked as blocked
BLOCKED_CATEGORIES = {
    'Networking': True,
    'SSH': True,
    'Docker': True,
    'Git': True,
    'Cron': True,
    'Services': True,
}

# Parse sections
sections = []
current_section_num = None
current_section_title = None
current_commands = []

for line in lines:
    # Skip separator lines
    if line.startswith("================"):
        continue
    
    # Match section headers like "1. FILE & DIRECTORY MANAGEMENT"
    section_match = re.match(r'^(\d+)\.\s+(.+?)$', line.strip())
    if section_match:
        # Save previous section
        if current_section_title:
            sections.append({
                'num': current_section_num,
                'title': current_section_title,
                'commands': current_commands
            })
        
        current_section_num = int(section_match.group(1))
        current_section_title = section_match.group(2).strip()
        current_commands = []
    elif current_section_title and line.strip() and '--' in line:
        # Parse command line
        current_commands.append(line.strip())

# Add last section
if current_section_title:
    sections.append({
        'num': current_section_num,
        'title': current_section_title,
        'commands': current_commands
    })

# Helper function to check if command should be blocked
def should_block(section_title, command_text):
    section_title_upper = section_title.upper()
    
    if 'NETWORKING' in section_title_upper:
        return True
    if 'SSH' in section_title_upper:
        return True
    if 'DOCKER' in section_title_upper:
        return True
    if 'GIT' in section_title_upper:
        return True
    if 'CRON' in section_title_upper or 'SCHEDULING' in section_title_upper:
        return True
    if 'SERVICES' in section_title_upper or 'SYSTEMD' in section_title_upper:
        return True
    
    return False

def get_block_reason(section_title):
    section_title_upper = section_title.upper()
    
    if 'NETWORKING' in section_title_upper:
        return 'Network operations are restricted'
    if 'SSH' in section_title_upper:
        return 'SSH operations are restricted'
    if 'DOCKER' in section_title_upper:
        return 'Docker operations are restricted'
    if 'GIT' in section_title_upper:
        return 'Git operations are restricted'
    if 'CRON' in section_title_upper or 'SCHEDULING' in section_title_upper:
        return 'Cron/Scheduling operations are restricted'
    if 'SERVICES' in section_title_upper or 'SYSTEMD' in section_title_upper:
        return 'Service management operations are restricted'
    
    return 'Command is restricted'

# Parse command details
def parse_command(line):
    """Parse a command line into components"""
    parts = line.split('--')
    
    if len(parts) < 2:
        return None, None, None
    
    # Command name/usage
    command_full = parts[0].strip()
    
    # Description
    description = parts[1].strip() if len(parts) > 1 else ''
    
    # Example (if present)
    example = parts[2].strip() if len(parts) > 2 else ''
    
    # Extract just the first word as command name
    cmd_name = command_full.split()[0] if command_full else ''
    
    return cmd_name, command_full, description, example

# Build TypeScript content
ts_content = """// Auto-generated from Linux Commands Handbook
// This file contains all 400+ Linux commands organized in 24 sections

export interface Command {
  id: string;
  name: string;
  usage: string;
  description: string;
  example: string;
  section: string;
  category: string;
  isBlocked: boolean;
  blockReason?: string;
  tags?: string[];
}

export interface CommandSection {
  id: string;
  number: number;
  title: string;
  description: string;
  commands: Command[];
}

"""

# Generate command constants
ts_content += "export const COMMANDS: Command[] = [\n"

command_id = 0
for section in sections:
    section_title = section['title']
    is_blocked_section = should_block(section_title, '')
    block_reason = get_block_reason(section_title) if is_blocked_section else None
    
    for cmd_line in section['commands']:
        cmd_name, cmd_full, description, example = parse_command(cmd_line)
        
        if not cmd_name:
            continue
        
        command_id += 1
        
        # Escape quotes in strings
        cmd_name_safe = cmd_name.replace("'", "\\'")
        cmd_full_safe = cmd_full.replace("'", "\\'")
        description_safe = description.replace("'", "\\'").replace('"', '\\"')
        example_safe = example.replace("'", "\\'").replace('"', '\\"')
        
        ts_content += f"""  {{
    id: 'cmd-{command_id:03d}',
    name: '{cmd_name_safe}',
    usage: '{cmd_full_safe}',
    description: '{description_safe}',
    example: '{example_safe}',
    section: '{section_title.replace("'", "\\'")}',
    category: 'general',
    isBlocked: {str(is_blocked_section).lower()},
    blockReason: {f"'{block_reason}'" if block_reason else 'undefined'},
  }},
"""

ts_content += "];\n\n"

# Generate sections
ts_content += "export const SECTIONS: CommandSection[] = [\n"

for section in sections:
    section_title = section['title']
    section_id = f"section-{section['num']:02d}"
    
    # Count commands in this section
    cmd_count = len(section['commands'])
    
    ts_content += f"""  {{
    id: '{section_id}',
    number: {section['num']},
    title: '{section_title.replace("'", "\\'")}',
    description: '{section_title.replace("'", "\\'").lower()}',
    commands: COMMANDS.filter(c => c.section === '{section_title.replace("'", "\\'")}'),
  }},
"""

ts_content += "];\n\n"

# Add alias for compatibility
ts_content += "// Alias for backward compatibility\nexport const commandSections = SECTIONS;\n\n"

# Generate helper functions
ts_content += """
// Get all blocked commands
export const getBlockedCommands = (): Command[] => {
  return COMMANDS.filter(cmd => cmd.isBlocked);
};

// Get commands by section
export const getCommandsBySection = (sectionTitle: string): Command[] => {
  return COMMANDS.filter(cmd => cmd.section === sectionTitle);
};

// Search commands
export const searchCommands = (query: string): Command[] => {
  const q = query.toLowerCase();
  return COMMANDS.filter(cmd => 
    cmd.name.toLowerCase().includes(q) ||
    cmd.description.toLowerCase().includes(q) ||
    cmd.usage.toLowerCase().includes(q)
  );
};

// Get command by name
export const getCommandByName = (name: string): Command | undefined => {
  return COMMANDS.find(cmd => cmd.name === name);
};

// Get section by title
export const getSectionByTitle = (title: string): CommandSection | undefined => {
  return SECTIONS.find(sec => sec.title === title);
};

// Get total command count
export const getTotalCommandCount = (): number => {
  return COMMANDS.length;
};

// Get total blocked count
export const getTotalBlockedCount = (): number => {
  return getBlockedCommands().length;
};
"""

# Write to file
output_path = r'c:\Users\abhin\Desktop\ALLFOLDER\projects\linuxplaylab\linux-handbook\src\data\commands.ts'

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"Generated TypeScript file: {output_path}")
print(f"Total sections: {len(sections)}")
print(f"Total commands: {command_id}")

# Print summary
for section in sections:
    blocked = should_block(section['title'], '')
    status = "BLOCKED" if blocked else "allowed"
    print(f"  Section {section['num']}: {section['title']} ({len(section['commands'])} commands) [{status}]")
