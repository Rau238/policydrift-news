import React from 'react';
import type { Metadata } from 'next';
import { Editor } from '@/components/editor/Editor';

interface EditorProjectPageProps {
  params: {
    projectId: string;
  };
}

export const metadata: Metadata = {
  title: 'Edit Project | Photo Editor',
  description: 'Edit your saved project in the studio photo editor.',
};

export default function EditorProjectPage({ params }: EditorProjectPageProps) {
  return <Editor initialProjectId={params.projectId} />;
}
