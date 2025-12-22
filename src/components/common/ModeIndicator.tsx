import React from 'react'

interface ModeIndicatorProps {
  isInsertMode: boolean
  insertCommand?: string
}

const ModeIndicator: React.FC<ModeIndicatorProps> = ({
  isInsertMode,
  insertCommand,
}) => {
  return (
    <div className="text-center px-4 py-2 rounded-lg bg-bg-secondary ">
      <span
        className={`font-mono uppercase ${
          isInsertMode ? 'text-orange-400' : 'text-emerald-400'
        }`}
      >
        {isInsertMode
          ? `Insert${insertCommand ? ` (${insertCommand})` : ''}`
          : 'Normal'}
      </span>
    </div>
  )
}

export default ModeIndicator
