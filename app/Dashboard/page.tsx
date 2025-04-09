'use client'
import { useRouter } from 'next/navigation'
import Header from '@/app/component/Header' // Adjust the path based on your project structure

export default function Dashboard() {
    const router = useRouter()

    return (
        <div>
            <Header />
            <div className="flex items-center justify-center gap-4 p-10 bg-gray-200 rounded-xl ml-20 mt-10 mr-20">
                <button onClick={() => router.push('/attendance')} className="bg-blue-500 px-4 py-2 rounded text-white">
                    Attendance
                </button>
                <button onClick={() => router.push('/common')} className="bg-green-500 px-4 py-2 rounded text-white">
                    Common
                </button>
            </div>
        </div>
    )
}
