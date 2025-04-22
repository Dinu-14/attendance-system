import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-blue-100 shadow-md py-3 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="Logo" width={80} height={80} />
        <span className="text-xl font-bold text-blue-900">Universal Science Academy</span>
      </div>
      {/* Optional nav buttons or user info here */}
    </header>
  )
}
