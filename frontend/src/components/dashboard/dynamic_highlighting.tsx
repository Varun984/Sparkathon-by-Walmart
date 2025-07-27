import { useState, useEffect, useCallback } from 'react';
import { ArrowDown, Upload, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { ExcelUpload } from './excel-upload';

const TailoredDynamicBadge = () => {
  const [badgeState, setBadgeState] = useState({
    message: "Upload any inventory file that has been untracked yet!",
    highlightTerms: ["inventory", "file", "untracked"],
    isVisible: true,
    status: "default",
    icon: ArrowDown,
  });

  const [uploadStats, setUploadStats] = useState({
    totalFiles: 0,
    successfulUploads: 0,
    failedUploads: 0,
    isUploading: false,
  });

  type UploadStats = {
    totalFiles?: number;
    successfulUploads?: number;
    failedUploads?: number;
  };

  const messages = {
    idle: {
      message: "Upload any inventory file that has been untracked yet!",
      highlightTerms: ["inventory", "file", "untracked"],
      status: "default",
      icon: ArrowDown,
    },
    uploading: {
      message: `Processing ${(0)} file(s)... Please wait!`,
      highlightTerms: ["Processing", "wait"],
      status: "uploading",
      icon: Loader2,
    },
    success: {
      message: `Successfully uploaded ${(0)} inventory file(s)!`,
      highlightTerms: ["Successfully", "uploaded", "inventory"],
      status: "success",
      icon: CheckCircle,
    },
    partial: {
      message: `${(0)} uploaded, ${(0)} failed. Check files!`,
      highlightTerms: ["uploaded", "failed", "Check"],
      status: "warning",
      icon: AlertCircle,
    },
    error: {
      message: "Upload failed! Please check file format and try again.",
      highlightTerms: ["failed", "check", "try again"],
      status: "error",
      icon: AlertCircle,
    },
  };

  const updateBadgeForUploadState = useCallback((state: keyof typeof messages, stats: UploadStats = {}) => {
    const localMessages = {
      idle: {
        message: "Upload any inventory file that has been untracked yet!",
        highlightTerms: ["inventory", "file", "untracked"],
        status: "default",
        icon: ArrowDown,
      },
      uploading: {
        message: `Processing ${(stats.totalFiles ?? 0)} file(s)... Please wait!`,
        highlightTerms: ["Processing", "wait"],
        status: "uploading",
        icon: Loader2,
      },
      success: {
        message: `Successfully uploaded ${stats.successfulUploads ?? 0} inventory file(s)!`,
        highlightTerms: ["Successfully", "uploaded", "inventory"],
        status: "success",
        icon: CheckCircle,
      },
      partial: {
        message: `${stats.successfulUploads ?? 0} uploaded, ${stats.failedUploads ?? 0} failed. Check files!`,
        highlightTerms: ["uploaded", "failed", "Check"],
        status: "warning",
        icon: AlertCircle,
      },
      error: {
        message: "Upload failed! Please check file format and try again.",
        highlightTerms: ["failed", "check", "try again"],
        status: "error",
        icon: AlertCircle,
      },
    };
    setBadgeState(prev => ({ ...prev, ...localMessages[state], isVisible: true }));
  }, []);

  const getHighlightedText = (text: string, highlights: string[]) => {
    if (!highlights.length) return text;

    const highlightStyles = {
      default: "bg-yellow-100 text-yellow-800",
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-200 text-yellow-900",
      error: "bg-red-100 text-red-800",
      uploading: "bg-blue-100 text-blue-800",
    };

    const currentStyle = highlightStyles[badgeState.status] || highlightStyles.default;

    let processedText = text;
    highlights.forEach((term) => {
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      processedText = processedText.replace(regex, (match) => `
        <span className="${currentStyle} rounded px-1">${match}</span>
      `);
    });

    return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
  };

  const getBadgeStyles = () => {
    const styles = {
      default: "bg-blue-600 text-white border border-blue-700",
      uploading: "bg-blue-600 text-white border border-blue-700",
      success: "bg-green-600 text-white border border-green-700",
      warning: "bg-yellow-600 text-white border border-yellow-700",
      error: "bg-red-600 text-white border border-red-700",
    };
    return styles[badgeState.status] || styles.default;
  };

  useEffect(() => {
    if (badgeState.status === 'success') {
      const timer = setTimeout(() => {
        setBadgeState(prev => ({ ...prev, isVisible: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [badgeState.status]);

  if (!badgeState.isVisible) return null;

  const IconComponent = badgeState.icon;

  return (
    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-md shadow-md ${getBadgeStyles()}`}>
      <IconComponent className="w-5 h-5" aria-hidden="true" />
      <span className="text-sm font-medium">
        {getHighlightedText(badgeState.message, badgeState.highlightTerms)}
      </span>
    </div>
  );
};

export default TailoredDynamicBadge;
