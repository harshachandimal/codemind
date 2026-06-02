import React from 'react';

type Props = {
  loading?: boolean;
  onDelete: () => void;
};

const DeleteAnalysisButton: React.FC<Props> = ({ loading, onDelete }) => {
  const handleClick = () => {
    if (window.confirm('Delete this analysis? This action cannot be undone.')) {
      onDelete();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? 'Deleting...' : 'Delete Analysis'}
    </button>
  );
};

export default DeleteAnalysisButton;
