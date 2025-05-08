import React, { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

interface WarningSplashProps {
  message?: string
  onDismiss?: () => void
}

const WarningSplash: React.FC<WarningSplashProps> = ({
  message = 'LEVEL UNDER ACTIVE DEVELOPMENT, PROCEED WITH CAUTION',
  onDismiss,
}) => {
  const [visible, setVisible] = useState(true)

  const handleClick = () => {
    setVisible(false)
    if (onDismiss) {
      onDismiss()
    }
  }

  if (!visible) return null

  return (
    <div
      onClick={handleClick}
      className="hover:cursor-pointer fixed bottom-0 left-0 w-full bg-amber-600 overflow-hidden py-2 z-2"
    >
      <div
        className="whitespace-nowrap text-white font-bold flex items-center justify-between"
        style={{
          animation: 'marquee 50s linear infinite',
          display: 'inline-block',
        }}
      >
        <span className="flex items-center">
          <AlertTriangle size={18} className="text-white mr-2" />
          {message}
          &nbsp;&nbsp;&nbsp; {message}
          &nbsp;&nbsp;&nbsp; {message}
          &nbsp;&nbsp;&nbsp; {message}
          &nbsp;&nbsp;&nbsp; {message}
        </span>
      </div>
      {/* Rolling banner at the bottom */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(50%); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </div>
  )
}

export default WarningSplash
