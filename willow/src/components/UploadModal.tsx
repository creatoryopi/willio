import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, Image as ImageIcon, Mic, FileMusic, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { processUpload } from '../lib/api';

interface UploadModalProps {
  onClose: () => void;
}

export default function UploadModal({ onClose }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'analyzing' | 'done' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [user] = useAuthState(auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!user) return;

    setUploadState('analyzing');
    setErrorMessage('');

    try {
      let type: 'pdf' | 'image' | 'audio' | 'note' = 'note';
      if (file.type === 'application/pdf') type = 'pdf';
      else if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('audio/')) type = 'audio';

      // 1. Store the original file properly in Firebase Storage (not stuffed
      //    into a Firestore doc as base64 — Firestore has a 1MB doc limit).
      const storagePath = `memories/${user.uid}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      // 2. Run the real analysis pipeline: text extraction, transcription,
      //    or vision description, then GPT summary/tags + an embedding
      //    for semantic search.
      const result = await processUpload(file, file.name, type);

      // 3. Save the memory, now with genuine AI-derived fields.
      await addDoc(collection(db, 'memories'), {
        title: file.name,
        type,
        summary: result.summary,
        topics: result.topics,
        tag: result.tag,
        content: result.extractedText,
        embedding: result.embedding,
        fileUrl,
        tags: ['upload'],
        createdAt: new Date().toISOString(),
        userId: user.uid,
        source: 'Upload',
      });

      setUploadState('done');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
      setUploadState('error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-base border border-border-card rounded-[24px] w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <h2 className="text-xl font-heading font-semibold">Upload</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface text-text-muted hover:text-text-main transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-text-muted text-center mb-6">Add anything to your memory</p>

          {uploadState === 'idle' && (
            <>
              <div
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-border-subtle hover:border-border-card bg-surface'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleChange}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="w-16 h-16 rounded-full bg-elevated flex items-center justify-center mb-4 text-text-muted">
                  <UploadCloud size={32} />
                </div>
                <p className="font-medium text-lg mb-2">Drag & drop your file here</p>
                <p className="text-text-muted text-sm mb-6">or</p>
                <button className="bg-primary hover:bg-primary-hover text-black font-semibold py-2 px-6 rounded-[18px] transition-transform active:scale-95">
                  Choose file
                </button>
              </div>

              <div className="mt-8">
                <p className="text-sm font-medium text-center mb-4">Supported formats</p>
                <div className="flex justify-center gap-6 text-text-muted">
                  <div className="flex flex-col items-center gap-1"><FileText size={24} /><span className="text-[10px]">PDF</span></div>
                  <div className="flex flex-col items-center gap-1"><ImageIcon size={24} /><span className="text-[10px]">JPG</span></div>
                  <div className="flex flex-col items-center gap-1"><ImageIcon size={24} /><span className="text-[10px]">PNG</span></div>
                  <div className="flex flex-col items-center gap-1"><Mic size={24} /><span className="text-[10px]">MP4</span></div>
                  <div className="flex flex-col items-center gap-1"><FileMusic size={24} /><span className="text-[10px]">MP3</span></div>
                </div>
              </div>
            </>
          )}

          {uploadState === 'analyzing' && (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-surface rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-primary animate-pulse" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Analyzing content...</h3>
              <p className="text-text-muted text-sm text-center">Extracting text, generating summaries, and tagging topics for your memory.</p>
            </div>
          )}

          {uploadState === 'done' && (
            <div className="py-12 flex flex-col items-center justify-center text-success animate-in zoom-in duration-300">
              <CheckCircle2 size={64} className="mb-4" />
              <h3 className="text-xl font-heading font-semibold text-text-main">Saved to Memory</h3>
            </div>
          )}

          {uploadState === 'error' && (
            <div className="py-12 flex flex-col items-center justify-center text-error animate-in zoom-in duration-300">
              <AlertCircle size={64} className="mb-4" />
              <h3 className="text-xl font-heading font-semibold text-text-main mb-2">Upload failed</h3>
              <p className="text-text-muted text-sm text-center mb-6">{errorMessage}</p>
              <button
                onClick={() => setUploadState('idle')}
                className="bg-primary hover:bg-primary-hover text-black font-semibold py-2 px-6 rounded-[18px] transition-transform active:scale-95"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {uploadState === 'idle' && (
          <div className="bg-primary/10 p-4 flex items-center justify-center gap-3 text-sm text-primary border-t border-primary/20">
            <Sparkles size={16} />
            Our AI will analyze and organize your content for better retrieval.
          </div>
        )}
      </div>
    </div>
  );
}
