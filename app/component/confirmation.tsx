'use client'

import { useRouter } from 'next/navigation'

interface Props {
  message: string
  onClose: () => void
}

export default function ConfirmationOverlay({ message, onClose }: Props) {
  const router = useRouter()

  const handleConfirm = () => {
    onClose()
    router.push('/dashboard') // change path if needed
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
        <p className="text-lg font-semibold mb-4">{message}</p>
        <button
          onClick={handleConfirm}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          OK
        </button>
      </div>
    </div>
  )
}
