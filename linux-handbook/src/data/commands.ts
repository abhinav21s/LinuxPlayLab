export interface Command {
  id: string;
  name: string;
  description: string;
  example: string;
  section: number;
  isBlocked?: boolean;
  blockReason?: string;
}

export interface CommandSection {
  id: number;
  title: string;
  commands: Command[];
}

export const commandSections: CommandSection[] = [
  {
    id: 1,
    title: "File & Directory Management",
    commands: [
      {
        id: "cmd_1_1",
        name: "ls",
        description: "list directory contents",
        example: "ls -la",
        section: 1,
      },
      {
        id: "cmd_1_2",
        name: "pwd",
        description: "print working (current) directory",
        example: "pwd",
        section: 1,
      },
      {
        id: "cmd_1_3",
        name: "cd",
        description: "change directory",
        example: "cd /var/log",
        section: 1,
      },
      {
        id: "cmd_1_4",
        name: "mkdir",
        description: "create a directory",
        example: "mkdir -p a/b/c",
        section: 1,
      },
      {
        id: "cmd_1_5",
        name: "rm",
        description: "remove files or directories",
        example: "rm -rf folder/",
        section: 1,
      },
      {
        id: "cmd_1_6",
        name: "cp",
        description: "copy files or directories",
        example: "cp -r src dest",
        section: 1,
      },
      {
        id: "cmd_1_7",
        name: "mv",
        description: "move or rename files/directories",
        example: "mv old.txt new.txt",
        section: 1,
      },
      {
        id: "cmd_1_8",
        name: "touch",
        description: "create an empty file or update timestamp",
        example: "touch file.txt",
        section: 1,
      },
      {
        id: "cmd_1_9",
        name: "file",
        description: "determine file type",
        example: "file archive.zip",
        section: 1,
      },
      {
        id: "cmd_1_10",
        name: "find",
        description: "search for files/directories",
        example: "find . -name '*.log'",
        section: 1,
      },
    ],
  },
  {
    id: 2,
    title: "File Viewing & Editing",
    commands: [
      {
        id: "cmd_2_1",
        name: "cat",
        description: "print file contents to screen",
        example: "cat file.txt",
        section: 2,
      },
      {
        id: "cmd_2_2",
        name: "head",
        description: "print first 10 lines of a file",
        example: "head -n 20 file.txt",
        section: 2,
      },
      {
        id: "cmd_2_3",
        name: "tail",
        description: "print last 10 lines of a file",
        example: "tail -n 20 file.txt",
        section: 2,
      },
      {
        id: "cmd_2_4",
        name: "less",
        description: "view file contents page by page (scrollable)",
        example: "less file.txt",
        section: 2,
      },
      {
        id: "cmd_2_5",
        name: "nano",
        description: "simple terminal text editor",
        example: "nano file.txt",
        section: 2,
      },
      {
        id: "cmd_2_6",
        name: "wc",
        description: "word, line, character, byte count",
        example: "wc -l file.txt",
        section: 2,
      },
      {
        id: "cmd_2_7",
        name: "diff",
        description: "compare two files line by line",
        example: "diff a.txt b.txt",
        section: 2,
      },
      {
        id: "cmd_2_8",
        name: "sort",
        description: "sort lines of text",
        example: "sort file.txt",
        section: 2,
      },
      {
        id: "cmd_2_9",
        name: "cut",
        description: "extract columns/fields from text",
        example: "cut -d',' -f1 file.csv",
        section: 2,
      },
    ],
  },
  {
    id: 3,
    title: "Search & Text Processing",
    commands: [
      {
        id: "cmd_3_1",
        name: "grep",
        description: "search text using patterns",
        example: "grep 'error' log.txt",
        section: 3,
      },
      {
        id: "cmd_3_2",
        name: "sed",
        description: "stream editor for filtering/transforming text",
        example: "sed 's/old/new/g' file.txt",
        section: 3,
      },
      {
        id: "cmd_3_3",
        name: "awk",
        description: "pattern scanning and text processing language",
        example: "awk '{print $1}' file.txt",
        section: 3,
      },
      {
        id: "cmd_3_4",
        name: "xargs",
        description: "build and execute commands from input",
        example: "find . -name '*.tmp' | xargs rm",
        section: 3,
      },
      {
        id: "cmd_3_5",
        name: "tr",
        description: "translate or delete characters",
        example: "tr 'a-z' 'A-Z'",
        section: 3,
      },
    ],
  },
];

  {
    id: 4,
    title: "Users & Groups",
    commands: [
      {
        id: "cmd_4_1",
        name: "whoami",
        description: "print current logged-in username",
        example: "whoami",
        section: 4,
      },
      {
        id: "cmd_4_2",
        name: "id",
        description: "print user and group IDs",
        example: "id username",
        section: 4,
      },
      {
        id: "cmd_4_3",
        name: "sudo",
        description: "execute a command as another user (root)",
        example: "sudo apt update",
        section: 4,
      },
      {
        id: "cmd_4_4",
        name: "passwd",
        description: "change a user's password",
        example: "passwd username",
        section: 4,
      },
    ],
  },
  {
    id: 5,
    title: "Permissions & Ownership",
    commands: [
      {
        id: "cmd_5_1",
        name: "chmod",
        description: "change file permissions",
        example: "chmod 755 script.sh",
        section: 5,
      },
      {
        id: "cmd_5_2",
        name: "chown",
        description: "change file owner and/or group",
        example: "chown user:group file",
        section: 5,
      },
      {
        id: "cmd_5_3",
        name: "chgrp",
        description: "change group ownership of a file",
        example: "chgrp groupname file",
        section: 5,
      },
    ],
  },
  {
    id: 6,
    title: "Processes & Jobs",
    commands: [
      {
        id: "cmd_6_1",
        name: "ps",
        description: "report a snapshot of current processes",
        example: "ps aux",
        section: 6,
      },
      {
        id: "cmd_6_2",
        name: "top",
        description: "interactive real-time process viewer",
        example: "top",
        section: 6,
      },
      {
        id: "cmd_6_3",
        name: "kill",
        description: "send a signal to a process by PID",
        example: "kill 1234",
        section: 6,
      },
      {
        id: "cmd_6_4",
        name: "jobs",
        description: "list background jobs in current shell",
        example: "jobs",
        section: 6,
      },
    ],
  },
  {
    id: 7,
    title: "System Information",
    commands: [
      {
        id: "cmd_7_1",
        name: "uname",
        description: "print system information",
        example: "uname -a",
        section: 7,
      },
      {
        id: "cmd_7_2",
        name: "hostname",
        description: "show or set the system hostname",
        example: "hostname",
        section: 7,
      },
      {
        id: "cmd_7_3",
        name: "uptime",
        description: "show system uptime and load averages",
        example: "uptime",
        section: 7,
      },
      {
        id: "cmd_7_4",
        name: "free",
        description: "display memory (RAM) usage",
        example: "free -h",
        section: 7,
      },
      {
        id: "cmd_7_5",
        name: "lscpu",
        description: "display CPU architecture information",
        example: "lscpu",
        section: 7,
      },
    ],
  },
];
