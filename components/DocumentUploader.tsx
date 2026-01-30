"use client";

// Document Uploader - Drag & Drop + Click to Upload
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, FileUp, X, Check } from "lucide-react";
import { uploadDocument } from "@/lib/storage";
import { createDocument, DOCUMENT_CATEGORIES, DocumentCategory } from "@/lib/documents";

interface DocumentUploaderProps {
    userId: string;
    onUploadComplete?: () => void;
}

// Accepted file types
const ACCEPTED_TYPES = [
    ".pdf",
    ".doc", ".docx",
    ".ppt", ".pptx",
    ".xls", ".xlsx",
    ".txt",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export default function DocumentUploader({ userId, onUploadComplete }: DocumentUploaderProps) {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Form state for document metadata
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [docName, setDocName] = useState("");
    const [docDescription, setDocDescription] = useState("");
    const [docCategory, setDocCategory] = useState<DocumentCategory>("Lainnya");

    const validateFile = (file: File): string | null => {
        // Check file type
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        const isValidType = ACCEPTED_TYPES.includes(ext) || ACCEPTED_TYPES.includes(file.type);
        if (!isValidType) {
            return "File type not supported. Use PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, or TXT.";
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return "File size must be less than 25MB";
        }

        return null;
    };

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        const validationError = validateFile(file);

        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setPendingFile(file);
        setDocName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension for name
    };

    const handleUpload = async () => {
        if (!pendingFile || !docName.trim()) return;

        setUploading(true);
        setProgress(30);
        setError(null);

        try {
            // Upload to Storage
            const { url, storagePath } = await uploadDocument(userId, pendingFile);
            setProgress(70);

            // Create Firestore document
            await createDocument({
                userId,
                name: docName.trim(),
                description: docDescription.trim(),
                category: docCategory,
                fileUrl: url,
                storagePath,
                fileName: pendingFile.name,
                fileSize: pendingFile.size,
                fileType: pendingFile.type,
            });
            setProgress(100);

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setPendingFile(null);
                setDocName("");
                setDocDescription("");
                setDocCategory("Lainnya");
                onUploadComplete?.();
            }, 1500);
        } catch (err) {
            console.error("Upload failed:", err);
            setError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
            setProgress(0);
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
        },
        [userId]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const cancelPending = () => {
        setPendingFile(null);
        setDocName("");
        setDocDescription("");
        setDocCategory("Lainnya");
        setError(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
        >
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
                id="document-upload"
            />

            <AnimatePresence mode="wait">
                {!pendingFile ? (
                    // Drop zone
                    <motion.label
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        htmlFor="document-upload"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${dragOver
                            ? "border-[#D1F441] bg-[#D1F441]/10"
                            : "border-white/20 bg-[#1a1a1a] hover:border-[#D1F441]/50"
                            }`}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[#D1F441]/10 flex items-center justify-center">
                            {dragOver ? (
                                <FileUp className="w-8 h-8 text-[#D1F441]" />
                            ) : (
                                <Upload className="w-8 h-8 text-[#D1F441]" />
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-white font-medium">
                                {dragOver ? "Drop file here" : "Drop document or click to upload"}
                            </p>
                            <p className="text-white/40 text-sm mt-1">
                                PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT up to 25MB
                            </p>
                        </div>
                    </motion.label>
                ) : (
                    // Form to fill metadata
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6"
                    >
                        {success ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="w-16 h-16 rounded-full bg-[#D1F441]/20 flex items-center justify-center mb-4">
                                    <Check className="w-8 h-8 text-[#D1F441]" />
                                </div>
                                <p className="text-white font-medium">Document uploaded successfully!</p>
                            </div>
                        ) : uploading ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <Loader2 className="w-10 h-10 text-[#D1F441] animate-spin mb-4" />
                                <p className="text-white/60 text-sm">Uploading... {progress}%</p>
                                <div className="w-full max-w-xs h-2 bg-white/10 rounded-full overflow-hidden mt-3">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className="h-full bg-[#D1F441]"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* File preview */}
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg mb-4">
                                    <FileUp className="w-6 h-6 text-[#D1F441]" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm truncate">{pendingFile.name}</p>
                                        <p className="text-white/40 text-xs">
                                            {(pendingFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        onClick={cancelPending}
                                        className="p-1 hover:bg-white/10 rounded transition-colors"
                                    >
                                        <X className="w-4 h-4 text-white/40" />
                                    </button>
                                </div>

                                {/* Form fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-white/60 text-sm mb-1 block">
                                            Nama Dokumen *
                                        </label>
                                        <input
                                            type="text"
                                            value={docName}
                                            onChange={(e) => setDocName(e.target.value)}
                                            placeholder="Masukkan nama dokumen"
                                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D1F441]/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-white/60 text-sm mb-1 block">
                                            Deskripsi
                                        </label>
                                        <input
                                            type="text"
                                            value={docDescription}
                                            onChange={(e) => setDocDescription(e.target.value)}
                                            placeholder="Deskripsi singkat (opsional)"
                                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D1F441]/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-white/60 text-sm mb-1 block">
                                            Kategori
                                        </label>
                                        <select
                                            value={docCategory}
                                            onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                                            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#D1F441]/50"
                                        >
                                            {DOCUMENT_CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat} className="bg-[#1a1a1a]">
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={cancelPending}
                                        className="flex-1 py-2 rounded-full border border-white/10 text-white/60 hover:border-white/20 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={!docName.trim()}
                                        className="flex-1 py-2 rounded-full bg-[#D1F441] hover:bg-[#c5e83b] text-[#0f0f0f] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Upload
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center justify-center gap-2 text-red-400 text-sm"
                >
                    <X className="w-4 h-4" />
                    {error}
                </motion.div>
            )}
        </motion.div>
    );
}
