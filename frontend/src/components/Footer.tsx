import React from 'react'

export const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12 text-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex w-full flex-col md:flex-row justify-between gap-8 items-center">
                    <div className='md:w-1/4 w-full'>
                        <h3 className="text-xl font-bold mb-4">Juggy AI</h3>
                        <p className="text-gray-400">
                            Your personal PM interview coach, available 24/7.
                        </p>
                    </div>
                    <div className='flex justify-around md:w-3/4 w-full gap-8'>
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="mailto:support@juggy.ai" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
                                <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2025 Juggy AI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
