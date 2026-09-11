import React from 'react';
import type { Metadata } from 'next';
import { Editor } from '@/components/editor/Editor';

export const metadata: Metadata = {
  title: 'Photo & Design Editor | NewsFree365',
  description: 'Professional online photo editing and graphic design studio with layers, filters, and vector tools.',
};

export default function EditorPage() {
  return <Editor />;
}
