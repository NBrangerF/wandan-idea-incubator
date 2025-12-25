import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'default';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  variant = 'default'
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: '⚠️',
          confirmBtn: 'bg-red-500 hover:bg-red-600 shadow-red-200',
          iconBg: 'bg-red-50'
        };
      case 'warning':
        return {
          icon: '🔄',
          confirmBtn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
          iconBg: 'bg-amber-50'
        };
      default:
        return {
          icon: '💡',
          confirmBtn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
          iconBg: 'bg-indigo-50'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full mx-4 animate-[fadeInUp_0.3s_ease-out]">
        {/* Icon */}
        <div className={`w-16 h-16 ${styles.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
          <span className="text-3xl">{styles.icon}</span>
        </div>
        
        {/* Title */}
        <h2 className="text-xl font-black text-slate-800 text-center mb-3">
          {title}
        </h2>
        
        {/* Message */}
        <p className="text-slate-500 text-center mb-8 leading-relaxed">
          {message}
        </p>
        
        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-4 px-6 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-4 px-6 rounded-2xl text-white font-bold transition-all active:scale-95 shadow-lg ${styles.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
