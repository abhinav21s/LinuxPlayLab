#!/usr/bin/env python3
"""Parse the Linux Commands Handbook and generate TypeScript commands.ts file"""

import re
import json

# Read the handbook file
with open(r'c:\Users\abhin\Desktop\ALLFOLDER\projects\linuxplaylab\linux_commands_handbook.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Print file stats
print(f"File loaded successfully")
print(f"Total lines: {len(content.splitlines())}")
print(f"Total characters: {len(content)}")

# Split into lines
lines = content.splitlines()

# Find section markers and extract sections
sections = []
current_section = None
current_commands = []

for line in lines:
    # Check for section headers (pattern: "================...")
    if line.startswith("================"):
        continue
    
    # Check for section titles (pattern: "N. SECTION NAME")
    section_match = re.match(r'^(\d+)\.\s+(.+?)$', line.strip())
    if section_match:
        if current_section:
            sections.append({
                'title': current_section,
                'commands': current_commands
            })
        current_section = line.strip()
        current_commands = []
    elif current_section and line.strip():
        # Check if line contains command format (word -- description)
        if '--' in line:
            current_commands.append(line.strip())

# Add last section
if current_section:
    sections.append({
        'title': current_section,
        'commands': current_commands
    })

print(f"\nFound {len(sections)} sections")
for i, sec in enumerate(sections, 1):
    print(f"{i}. {sec['title']}: {len(sec['commands'])} commands")

# Save sections to JSON for review
with open('sections_parsed.json', 'w') as f:
    json.dump(sections, f, indent=2)
print("\nSections saved to sections_parsed.json")
