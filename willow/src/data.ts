import { Memory } from './types';

export const recentMemories: Memory[] = [
  {
    id: '1',
    title: 'React Best Practices',
    type: 'pdf',
    date: 'Today, 4:32 PM',
    tag: 'Development',
    summary: 'This document covers best practices for building scalable React applications including component structure, state management, performance optimization, and testing strategies.',
    topics: ['React', 'Components', 'Performance', 'Testing', 'State Management', 'Hooks'],
    content: '...useState, useEffect and custom hooks are the foundation...'
  },
  {
    id: '2',
    title: 'System Design Diagram',
    type: 'image',
    date: 'Today, 3:10 PM',
    tag: 'Architecture'
  },
  {
    id: '3',
    title: 'Interview Prep Voice Note',
    type: 'audio',
    date: 'Today, 2:15 PM',
    tag: 'Career',
    duration: '12:45',
    content: 'Discussed React hooks questions for upcoming interview...'
  },
  {
    id: '4',
    title: 'Docker Tutorial',
    type: 'link',
    date: 'Yesterday, 9:47 PM',
    source: 'YouTube',
    content: 'A complete guide to Docker and containerization...'
  },
  {
    id: '5',
    title: 'Marketing Strategy 2024',
    type: 'pdf',
    date: 'Yesterday, 6:30 PM',
    tag: 'Business'
  },
  {
    id: '6',
    title: 'Project Ideas',
    type: 'note',
    date: 'Jul 16, 10:15 PM'
  },
  {
    id: '7',
    title: 'UI Inspiration',
    type: 'image',
    date: 'Jul 16, 8:43 PM'
  }
];
