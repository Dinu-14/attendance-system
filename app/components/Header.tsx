import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-3 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Image src="/logo.png" alt="Logo" width={80} height={80} className="rounded-full" />
        <span className="text-2xl font-semibold text-gray-800">Universal Science Academy</span>
      </div>
    </header>
  )
}